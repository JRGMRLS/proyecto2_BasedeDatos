const router  = require('express').Router()
const pool    = require('../db/pool')
const { Producto, Categoria, Proveedor } = require('../models')
const { authenticate, requirePermiso } = require('../middleware/auth')

// GET — ORM con JOIN, aplanado para el frontend
router.get('/', authenticate, requirePermiso('productos:read'), async (_req, res) => {
  try {
    const rows = await Producto.findAll({
      include: [
        { model: Categoria, as: 'categoria', attributes: ['id','nombre'] },
        { model: Proveedor, as: 'proveedor', attributes: ['id','nombre'] },
      ],
      order: [['id','ASC']],
    })
    // Aplanar para que el frontend reciba el mismo formato que antes
    const data = rows.map(p => ({
      id:           p.id,
      nombre:       p.nombre,
      descripcion:  p.descripcion,
      precio:       p.precio,
      stock:        p.stock,
      categoria_id: p.categoria_id,
      proveedor_id: p.proveedor_id,
      creado_en:    p.creado_en,
      categoria:    p.categoria?.nombre,
      proveedor:    p.proveedor?.nombre,
    }))
    res.json(data)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// GET bajo stock
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

// GET :id
router.get('/:id', authenticate, requirePermiso('productos:read'), async (req, res) => {
  try {
    const p = await Producto.findByPk(req.params.id, {
      include: [
        { model: Categoria, as: 'categoria' },
        { model: Proveedor, as: 'proveedor' },
      ]
    })
    if (!p) return res.status(404).json({ error: 'Producto no encontrado' })
    res.json({
      id: p.id, nombre: p.nombre, descripcion: p.descripcion,
      precio: p.precio, stock: p.stock,
      categoria_id: p.categoria_id, proveedor_id: p.proveedor_id,
      categoria: p.categoria?.nombre, proveedor: p.proveedor?.nombre,
    })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// POST — ORM create
router.post('/', authenticate, requirePermiso('productos'), async (req, res) => {
  const { nombre, descripcion, precio, stock, categoria_id, proveedor_id } = req.body
  if (!nombre || precio == null || stock == null || !categoria_id || !proveedor_id)
    return res.status(400).json({ error: 'Faltan campos requeridos' })
  try {
    const prod = await Producto.create({ nombre, descripcion, precio, stock, categoria_id, proveedor_id })
    res.status(201).json(prod)
  } catch (err) { res.status(400).json({ error: err.message }) }
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
