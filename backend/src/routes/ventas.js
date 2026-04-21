const router = require('express').Router();
const pool   = require('../db/pool');
const { authenticate } = require('../middleware/auth');

// GET /api/ventas  – VIEW v_ventas_detalle (JOIN múltiple)
router.get('/', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM v_ventas_detalle ORDER BY fecha DESC`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/ventas/:id  – detalle completo con productos
router.get('/:id', authenticate, async (req, res) => {
  try {
    const venta = await pool.query(
      `SELECT * FROM v_ventas_detalle WHERE venta_id = $1`, [req.params.id]
    );
    if (!venta.rows[0]) return res.status(404).json({ error: 'Venta no encontrada' });

    const items = await pool.query(`
      SELECT dv.*, p.nombre AS producto, p.precio AS precio_actual
      FROM detalle_venta dv
      JOIN productos p ON p.id = dv.producto_id
      WHERE dv.venta_id = $1
    `, [req.params.id]);

    res.json({ ...venta.rows[0], items: items.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/ventas  – TRANSACCIÓN EXPLÍCITA con ROLLBACK
router.post('/', authenticate, async (req, res) => {
  const { cliente_id, empleado_id, items } = req.body;
  if (!cliente_id || !empleado_id || !Array.isArray(items) || items.length === 0)
    return res.status(400).json({ error: 'Datos de venta incompletos' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Verificar stock suficiente para cada producto
    for (const item of items) {
      const { rows } = await client.query(
        'SELECT stock, nombre FROM productos WHERE id = $1 FOR UPDATE',
        [item.producto_id]
      );
      if (!rows[0]) {
        throw new Error(`Producto ${item.producto_id} no encontrado`);
      }
      if (rows[0].stock < item.cantidad) {
        throw new Error(`Stock insuficiente para "${rows[0].nombre}". Disponible: ${rows[0].stock}`);
      }
    }

    // 2. Crear la venta
    const ventaRes = await client.query(
      `INSERT INTO ventas (cliente_id, empleado_id, estado)
       VALUES ($1, $2, 'completada') RETURNING id`,
      [cliente_id, empleado_id]
    );
    const ventaId = ventaRes.rows[0].id;

    // 3. Insertar detalle y descontar stock
    let total = 0;
    for (const item of items) {
      const prodRes = await client.query(
        'SELECT precio FROM productos WHERE id = $1', [item.producto_id]
      );
      const precio_unit = item.precio_unit ?? prodRes.rows[0].precio;

      await client.query(
        `INSERT INTO detalle_venta (venta_id, producto_id, cantidad, precio_unit)
         VALUES ($1, $2, $3, $4)`,
        [ventaId, item.producto_id, item.cantidad, precio_unit]
      );

      await client.query(
        'UPDATE productos SET stock = stock - $1 WHERE id = $2',
        [item.cantidad, item.producto_id]
      );

      total += item.cantidad * precio_unit;
    }

    // 4. Actualizar total de la venta
    await client.query('UPDATE ventas SET total = $1 WHERE id = $2', [total, ventaId]);

    await client.query('COMMIT');
    res.status(201).json({ id: ventaId, total });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Venta ROLLBACK:', err.message);
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
});

// DELETE /api/ventas/:id  – anular venta (no borrar, cambiar estado)
router.delete('/:id', authenticate, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      `SELECT estado FROM ventas WHERE id = $1 FOR UPDATE`, [req.params.id]
    );
    if (!rows[0]) throw new Error('Venta no encontrada');
    if (rows[0].estado === 'anulada') throw new Error('La venta ya está anulada');

    // Restaurar stock
    await client.query(`
      UPDATE productos p
      SET stock = p.stock + dv.cantidad
      FROM detalle_venta dv
      WHERE dv.venta_id = $1 AND dv.producto_id = p.id
    `, [req.params.id]);

    await client.query(
      `UPDATE ventas SET estado = 'anulada' WHERE id = $1`, [req.params.id]
    );

    await client.query('COMMIT');
    res.json({ message: 'Venta anulada correctamente' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
