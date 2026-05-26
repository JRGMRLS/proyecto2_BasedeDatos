const router = require('express').Router()
const pool   = require('../db/pool')
const { authenticate, requirePermiso } = require('../middleware/auth')

router.get('/ventas-por-empleado', authenticate, authenticate, async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT e.id, e.nombre||' '||e.apellido AS empleado, e.cargo,
             COUNT(v.id) AS num_ventas, SUM(v.total) AS total_ventas,
             AVG(v.total) AS promedio_venta, MAX(v.total) AS venta_max
      FROM empleados e JOIN ventas v ON v.empleado_id=e.id AND v.estado='completada'
      GROUP BY e.id, e.nombre, e.apellido, e.cargo
      HAVING COUNT(v.id) > 0 ORDER BY total_ventas DESC`)
    res.json(rows)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.get('/productos-top', authenticate, authenticate, async (_req, res) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM v_productos_mas_vendidos ORDER BY total_vendido DESC LIMIT 10`)
    res.json(rows)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.get('/inventario-categoria', authenticate, authenticate, async (_req, res) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM v_inventario_categoria ORDER BY valor_inventario DESC`)
    res.json(rows)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.get('/ventas-diarias', authenticate, authenticate, async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      WITH dias AS (
        SELECT generate_series(CURRENT_DATE-INTERVAL '29 days', CURRENT_DATE, '1 day')::date AS dia
      ),
      vpd AS (
        SELECT DATE(fecha) AS dia, COUNT(*) AS num_ventas, SUM(total) AS total
        FROM ventas WHERE estado='completada' AND fecha>=CURRENT_DATE-INTERVAL '29 days'
        GROUP BY DATE(fecha)
      )
      SELECT d.dia, COALESCE(vpd.num_ventas,0) AS num_ventas, COALESCE(vpd.total,0) AS total
      FROM dias d LEFT JOIN vpd ON vpd.dia=d.dia ORDER BY d.dia`)
    res.json(rows)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.get('/clientes-frecuentes', authenticate, authenticate, async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT c.id, c.nombre||' '||c.apellido AS cliente, c.email, c.telefono,
             (SELECT COUNT(*) FROM ventas v WHERE v.cliente_id=c.id AND v.estado='completada') AS total_compras,
             (SELECT COALESCE(SUM(total),0) FROM ventas v WHERE v.cliente_id=c.id AND v.estado='completada') AS total_gastado
      FROM clientes c
      WHERE EXISTS (
        SELECT 1 FROM ventas v WHERE v.cliente_id=c.id AND v.estado='completada'
        GROUP BY v.cliente_id HAVING COUNT(*)>1
      ) ORDER BY total_gastado DESC`)
    res.json(rows)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Stored Procedure: reporte por periodo
router.get('/periodo', authenticate, authenticate, async (req, res) => {
  const { desde, hasta } = req.query
  if (!desde || !hasta) return res.status(400).json({ error: 'Parámetros desde y hasta requeridos' })
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query(`CALL reporte_ventas_periodo($1::date, $2::date, NULL, NULL, NULL, NULL)`, [desde, hasta])
    const { rows } = await client.query(`
      SELECT COUNT(*) AS total_ventas, COALESCE(SUM(total),0) AS monto_total, COALESCE(AVG(total),0) AS ticket_promedio
      FROM ventas WHERE estado='completada' AND DATE(fecha) BETWEEN $1 AND $2`, [desde, hasta])
    await client.query('COMMIT')
    res.json(rows[0])
  } catch (err) {
    await client.query('ROLLBACK')
    res.status(500).json({ error: err.message })
  } finally { client.release() }
})

router.get('/dashboard', authenticate, async (_req, res) => {
  try {
    const [ventas, productos, clientes, stockBajo] = await Promise.all([
      pool.query(`SELECT COUNT(*) AS total, COALESCE(SUM(total),0) AS monto FROM ventas WHERE estado='completada'`),
      pool.query(`SELECT COUNT(*) AS total, SUM(stock) AS stock_total FROM productos`),
      pool.query(`SELECT COUNT(*) AS total FROM clientes`),
      pool.query(`SELECT COUNT(*) AS total FROM productos WHERE stock < 5`),
    ])
    res.json({
      ventas: ventas.rows[0], productos: productos.rows[0],
      clientes: clientes.rows[0], stock_bajo: stockBajo.rows[0],
    })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

module.exports = router
