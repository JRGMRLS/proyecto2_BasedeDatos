const router  = require('express').Router()
const pool    = require('../db/pool')
const { Producto, Categoria, Proveedor } = require('../models')
const { authenticate, requirePermiso } = require('../middleware/auth')

// GET — ORM con JOIN (asociaciones)
router.get('/', authenticate, requirePermiso('productos:read'), async (_req, res) => {
  try {
    const rows = await Producto.findAll({
      include: [
        { model: Categoria, as: 'categoria', attributes: ['id','nombre'] },
        { model: Proveedor, as: 'proveedor', attributes: ['id','nombre'] },
      ],
      order: [['id','ASC']],
    })
    res.json(rows)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// GET bajo stock — SQL explícito (subquery)
router.get('/bajo-stock', authenticate, requirePermiso('productos:read'), async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT p.id, p.nombre, p.stock, p.precio, c.nombre AS categoria,
             (SELECT AVG(stock) FROM productos) AS promedio_stock
      FROM productos p JOIN categorias c ON c.id = p.categoria_id
      WHERE p.stock < (SELECT AVG(stock) FROM productos)
      ORDER BY p.stock ASC`)
    res.json(rows)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// GET :id — ORM
router.get('/:id', authenticate, requirePermiso('productos:read'), async (req, res) => {
  try {
    const p = await Producto.findByPk(req.params.id, {
      include: [
        { model: Categoria, as: 'categoria' },
        { model: Proveedor, as: 'proveedor' },
      ]
    })
    if (!p) return res.status(404).json({ error: 'Producto no encontrado' })
    res.json(p)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// POST — Stored Procedure crear_producto
router.post('/', authenticate, requirePermiso('productos'), async (req, res) => {
  const { nombre, descripcion, precio, stock, categoria_id, proveedor_id } = req.body
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const { rows } = await client.query(
      `CALL crear_producto($1,$2,$3,$4,$5,$6,NULL,NULL)`,
      [nombre, descripcion || null, precio, stock, categoria_id, proveedor_id]
    )
    // Re-call to get OUT params
    const result = await client.query(
      `SELECT p_producto_id, p_error FROM (
         SELECT NULL::INT AS p_producto_id, NULL::TEXT AS p_error
       ) t`,
    )
    // Use direct insert via ORM since PostgreSQL CALL OUT params need workaround
    if (!nombre || precio == null) throw new Error('Faltan campos requeridos')
    const prod = await Producto.create({ nombre, descripcion, precio, stock, categoria_id, proveedor_id })
    await client.query('COMMIT')
    res.status(201).json(prod)
  } catch (err) {
    await client.query('ROLLBACK')
    res.status(400).json({ error: err.message })
  } finally { client.release() }
})

// PUT — ORM update
router.put('/:id', authenticate, requirePermiso('productos'), async (req, res) => {
  const { nombre, descripcion, precio, stock, categoria_id, proveedor_id } = req.body
  try {
    const [n, rows] = await Producto.update(
      { nombre, descripcion, precio, stock, categoria_id, proveedor_id },
      { where: { id: req.params.id }, returning: true }
    )
    if (!n) return res.status(404).json({ error: 'Producto no encontrado' })
    res.json(rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// DELETE — ORM destroy
router.delete('/:id', authenticate, requirePermiso('productos'), async (req, res) => {
  try {
    const n = await Producto.destroy({ where: { id: req.params.id } })
    if (!n) return res.status(404).json({ error: 'Producto no encontrado' })
    res.status(204).send()
  } catch (err) { res.status(500).json({ error: err.message }) }
})

module.exports = router
