const router = require('express').Router()
const { Categoria, Proveedor, Empleado } = require('../models')
const { authenticate, requirePermiso } = require('../middleware/auth')

/* ── CATEGORÍAS ── ORM ─────────────────────────────── */
router.get('/categorias', authenticate, requirePermiso('catalogos'), async (_req, res) => {
  try { res.json(await Categoria.findAll({ order: [['nombre','ASC']] })) }
  catch (err) { res.status(500).json({ error: err.message }) }
})
router.post('/categorias', authenticate, requirePermiso('catalogos'), async (req, res) => {
  try { res.status(201).json(await Categoria.create(req.body)) }
  catch (err) { res.status(400).json({ error: err.message }) }
})
router.put('/categorias/:id', authenticate, requirePermiso('catalogos'), async (req, res) => {
  try {
    const [n,rows] = await Categoria.update(req.body, { where:{id:req.params.id}, returning:true })
    if (!n) return res.status(404).json({ error: 'No encontrada' })
    res.json(rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
})
router.delete('/categorias/:id', authenticate, requirePermiso('catalogos'), async (req, res) => {
  try {
    await Categoria.destroy({ where:{id:req.params.id} })
    res.status(204).send()
  } catch (err) { res.status(500).json({ error: err.message }) }
})

/* ── PROVEEDORES ── ORM ────────────────────────────── */
router.get('/proveedores', authenticate, requirePermiso('catalogos'), async (_req, res) => {
  try { res.json(await Proveedor.findAll({ order: [['nombre','ASC']] })) }
  catch (err) { res.status(500).json({ error: err.message }) }
})
router.post('/proveedores', authenticate, requirePermiso('catalogos'), async (req, res) => {
  try { res.status(201).json(await Proveedor.create(req.body)) }
  catch (err) { res.status(400).json({ error: err.message }) }
})
router.put('/proveedores/:id', authenticate, requirePermiso('catalogos'), async (req, res) => {
  try {
    const [n,rows] = await Proveedor.update(req.body, { where:{id:req.params.id}, returning:true })
    if (!n) return res.status(404).json({ error: 'No encontrado' })
    res.json(rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
})
router.delete('/proveedores/:id', authenticate, requirePermiso('catalogos'), async (req, res) => {
  try {
    await Proveedor.destroy({ where:{id:req.params.id} })
    res.status(204).send()
  } catch (err) { res.status(500).json({ error: err.message }) }
})

/* ── EMPLEADOS ── ORM ──────────────────────────────── */
router.get('/empleados', authenticate, requirePermiso('ventas:read'), async (_req, res) => {
  try { res.json(await Empleado.findAll({ where:{ activo:true }, order:[['nombre','ASC']] })) }
  catch (err) { res.status(500).json({ error: err.message }) }
})
router.post('/empleados', authenticate, requirePermiso('catalogos'), async (req, res) => {
  try { res.status(201).json(await Empleado.create(req.body)) }
  catch (err) { res.status(400).json({ error: err.message }) }
})
router.put('/empleados/:id', authenticate, requirePermiso('catalogos'), async (req, res) => {
  try {
    const [n,rows] = await Empleado.update(req.body, { where:{id:req.params.id}, returning:true })
    if (!n) return res.status(404).json({ error: 'No encontrado' })
    res.json(rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
})

module.exports = router
