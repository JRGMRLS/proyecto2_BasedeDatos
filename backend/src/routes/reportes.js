const router = require('express').Router();
const pool   = require('../db/pool');
const { authenticate } = require('../middleware/auth');

// Reporte 1: Ventas por empleado (GROUP BY + HAVING + JOIN)
router.get('/ventas-por-empleado', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT e.id,
             e.nombre || ' ' || e.apellido AS empleado,
             e.cargo,
             COUNT(v.id)            AS num_ventas,
             SUM(v.total)           AS total_ventas,
             AVG(v.total)           AS promedio_venta,
             MAX(v.total)           AS venta_max
      FROM empleados e
      JOIN ventas v ON v.empleado_id = e.id AND v.estado = 'completada'
      GROUP BY e.id, e.nombre, e.apellido, e.cargo
      HAVING COUNT(v.id) > 0
      ORDER BY total_ventas DESC
    `);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Reporte 2: Productos más vendidos (VIEW + JOIN)
router.get('/productos-top', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM v_productos_mas_vendidos ORDER BY total_vendido DESC LIMIT 10`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Reporte 3: Inventario por categoría (VIEW)
router.get('/inventario-categoria', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM v_inventario_categoria ORDER BY valor_inventario DESC`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Reporte 4: Ventas diarias últimos 30 días (GROUP BY fecha + CTE)
router.get('/ventas-diarias', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      WITH dias AS (
        SELECT generate_series(
          CURRENT_DATE - INTERVAL '29 days',
          CURRENT_DATE,
          '1 day'::interval
        )::date AS dia
      ),
      ventas_por_dia AS (
        SELECT DATE(fecha) AS dia,
               COUNT(*)    AS num_ventas,
               SUM(total)  AS total
        FROM ventas
        WHERE estado = 'completada'
          AND fecha >= CURRENT_DATE - INTERVAL '29 days'
        GROUP BY DATE(fecha)
      )
      SELECT d.dia,
             COALESCE(vpd.num_ventas, 0) AS num_ventas,
             COALESCE(vpd.total, 0)      AS total
      FROM dias d
      LEFT JOIN ventas_por_dia vpd ON vpd.dia = d.dia
      ORDER BY d.dia
    `);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Reporte 5: Clientes que han comprado más de 1 vez (subquery EXISTS)
router.get('/clientes-frecuentes', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT c.id, c.nombre || ' ' || c.apellido AS cliente,
             c.email, c.telefono,
             (SELECT COUNT(*) FROM ventas v
              WHERE v.cliente_id = c.id AND v.estado='completada') AS total_compras,
             (SELECT COALESCE(SUM(total),0) FROM ventas v
              WHERE v.cliente_id = c.id AND v.estado='completada') AS total_gastado
      FROM clientes c
      WHERE EXISTS (
        SELECT 1 FROM ventas v
        WHERE v.cliente_id = c.id AND v.estado='completada'
        GROUP BY v.cliente_id
        HAVING COUNT(*) > 1
      )
      ORDER BY total_gastado DESC
    `);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Reporte 6: Resumen general (para dashboard)
router.get('/dashboard', authenticate, async (req, res) => {
  try {
    const [ventas, productos, clientes, stockBajo] = await Promise.all([
      pool.query(`SELECT COUNT(*) AS total, COALESCE(SUM(total),0) AS monto
                  FROM ventas WHERE estado='completada'`),
      pool.query(`SELECT COUNT(*) AS total, SUM(stock) AS stock_total FROM productos`),
      pool.query(`SELECT COUNT(*) AS total FROM clientes`),
      pool.query(`SELECT COUNT(*) AS total FROM productos WHERE stock < 5`),
    ]);
    res.json({
      ventas:      ventas.rows[0],
      productos:   productos.rows[0],
      clientes:    clientes.rows[0],
      stock_bajo:  stockBajo.rows[0],
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
