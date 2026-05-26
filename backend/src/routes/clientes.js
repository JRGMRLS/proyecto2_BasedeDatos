const router = require('express').Router()
const pool   = require('../db/pool')
const { Cliente } = require('../models')
const { authenticate, requirePermiso } = require('../middleware/auth')

// GET — ORM con agregación via SQL
router.get('/', authenticate, requirePermiso('clientes:read'), async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT c.*, COUNT(v.id) AS total_compras,
             COALESCE(SUM(v.total),0) AS total_gastado
      FROM clientes c
      LEFT JOIN ventas v ON v.cliente_id = c.id AND v.estado='completada'
      GROUP BY c.id ORDER BY c.id`)
    res.json(rows)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.get('/:id', authenticate, requirePermiso('clientes:read'), async (req, res) => {
  try {
    const c = await Cliente.findByPk(req.params.id)
    if (!c) return res.status(404).json({ error: 'Cliente no encontrado' })
    res.json(c)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// POST — Stored Procedure crear_cliente
router.post('/', authenticate, requirePermiso('clientes'), async (req, res) => {
  const { nombre, apellido, email, telefono, direccion } = req.body
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const { rows } = await client.query(
      `CALL crear_cliente($1,$2,$3,$4,$5,NULL,NULL)`,
      [nombre, apellido, email || null, telefono || null, direccion || null]
    )
    // Fetch the created client
    const { rows: created } = await client.query(
      `SELECT * FROM clientes WHERE email=$1 OR (nombre=$2 AND apellido=$3) ORDER BY id DESC LIMIT 1`,
      [email || '', nombre, apellido]
    )
    await client.query('COMMIT')
    res.status(201).json(created[0])
  } catch (err) {
    await client.query('ROLLBACK')
    if (err.message.includes('email')) return res.status(409).json({ error: err.message })
    res.status(400).json({ error: err.message })
  } finally { client.release() }
})

// PUT — ORM
router.put('/:id', authenticate, requirePermiso('clientes'), async (req, res) => {
  const { nombre, apellido, email, telefono, direccion } = req.body
  try {
    const [n, rows] = await Cliente.update(
      { nombre, apellido, email, telefono, direccion },
      { where: { id: req.params.id }, returning: true }
    )
    if (!n) return res.status(404).json({ error: 'Cliente no encontrado' })
    res.json(rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// DELETE — ORM
router.delete('/:id', authenticate, requirePermiso('clientes'), async (req, res) => {
  try {
    const n = await Cliente.destroy({ where: { id: req.params.id } })
    if (!n) return res.status(404).json({ error: 'Cliente no encontrado' })
    res.status(204).send()
  } catch (err) { res.status(500).json({ error: err.message }) }
})

module.exports = router
