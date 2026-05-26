const router = require('express').Router()
const pool   = require('../db/pool')
const { authenticate, requirePermiso } = require('../middleware/auth')

router.get('/', authenticate, requirePermiso('ventas:read'), async (_req, res) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM v_ventas_detalle ORDER BY fecha DESC`)
    res.json(rows)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.get('/:id', authenticate, requirePermiso('ventas:read'), async (req, res) => {
  try {
    const venta = await pool.query(`SELECT * FROM v_ventas_detalle WHERE venta_id=$1`, [req.params.id])
    if (!venta.rows[0]) return res.status(404).json({ error: 'Venta no encontrada' })
    const items = await pool.query(`
      SELECT dv.*, p.nombre AS producto
      FROM detalle_venta dv JOIN productos p ON p.id=dv.producto_id
      WHERE dv.venta_id=$1`, [req.params.id])
    res.json({ ...venta.rows[0], items: items.rows })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// POST — Stored Procedure registrar_venta con ROLLBACK interno
router.post('/', authenticate, requirePermiso('ventas'), async (req, res) => {
  const { cliente_id, empleado_id, items } = req.body
  if (!cliente_id || !empleado_id || !Array.isArray(items) || !items.length)
    return res.status(400).json({ error: 'Datos de venta incompletos' })

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    // Llamar al stored procedure
    await client.query(
      `CALL registrar_venta($1, $2, $3::json, NULL, NULL, NULL)`,
      [cliente_id, empleado_id, JSON.stringify(items)]
    )
    // Obtener el ID de la venta recién creada
    const { rows } = await client.query(
      `SELECT id, total FROM ventas WHERE cliente_id=$1 AND empleado_id=$2 ORDER BY id DESC LIMIT 1`,
      [cliente_id, empleado_id]
    )
    await client.query('COMMIT')
    res.status(201).json(rows[0])
  } catch (err) {
    await client.query('ROLLBACK')
    res.status(400).json({ error: err.message })
  } finally { client.release() }
})

// DELETE — Stored Procedure anular_venta
router.delete('/:id', authenticate, requirePermiso('ventas'), async (req, res) => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query(`CALL anular_venta($1, NULL, NULL)`, [req.params.id])
    await client.query('COMMIT')
    res.json({ message: 'Venta anulada correctamente' })
  } catch (err) {
    await client.query('ROLLBACK')
    res.status(400).json({ error: err.message })
  } finally { client.release() }
})

module.exports = router
