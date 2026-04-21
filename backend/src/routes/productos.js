const router = require('express').Router();
const pool   = require('../db/pool');
const { authenticate } = require('../middleware/auth');

// GET /api/productos  – JOIN con categoria y proveedor
router.get('/', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT p.id, p.nombre, p.descripcion, p.precio, p.stock, p.creado_en,
             c.id AS categoria_id, c.nombre AS categoria,
             pr.id AS proveedor_id, pr.nombre AS proveedor
      FROM productos p
      JOIN categorias c  ON c.id  = p.categoria_id
      JOIN proveedores pr ON pr.id = p.proveedor_id
      ORDER BY p.id
    `);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/productos/bajo-stock  – subquery: productos cuyo stock < promedio
router.get('/bajo-stock', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT p.id, p.nombre, p.stock, p.precio,
             c.nombre AS categoria,
             (SELECT AVG(stock) FROM productos) AS promedio_stock
      FROM productos p
      JOIN categorias c ON c.id = p.categoria_id
      WHERE p.stock < (SELECT AVG(stock) FROM productos)
      ORDER BY p.stock ASC
    `);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/productos/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT p.*, c.nombre AS categoria, pr.nombre AS proveedor
      FROM productos p
      JOIN categorias c  ON c.id  = p.categoria_id
      JOIN proveedores pr ON pr.id = p.proveedor_id
      WHERE p.id = $1
    `, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/productos
router.post('/', authenticate, async (req, res) => {
  const { nombre, descripcion, precio, stock, categoria_id, proveedor_id } = req.body;
  if (!nombre || precio == null || stock == null || !categoria_id || !proveedor_id)
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  try {
    const { rows } = await pool.query(`
      INSERT INTO productos (nombre, descripcion, precio, stock, categoria_id, proveedor_id)
      VALUES ($1,$2,$3,$4,$5,$6) RETURNING *
    `, [nombre, descripcion, precio, stock, categoria_id, proveedor_id]);
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/productos/:id
router.put('/:id', authenticate, async (req, res) => {
  const { nombre, descripcion, precio, stock, categoria_id, proveedor_id } = req.body;
  try {
    const { rows } = await pool.query(`
      UPDATE productos
      SET nombre=$1, descripcion=$2, precio=$3, stock=$4,
          categoria_id=$5, proveedor_id=$6
      WHERE id=$7 RETURNING *
    `, [nombre, descripcion, precio, stock, categoria_id, proveedor_id, req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/productos/:id
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM productos WHERE id=$1', [req.params.id]
    );
    if (!rowCount) return res.status(404).json({ error: 'Producto no encontrado' });
    res.status(204).send();
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
