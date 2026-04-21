const router = require('express').Router();
const pool   = require('../db/pool');
const { authenticate } = require('../middleware/auth');

/* ── CATEGORÍAS ─────────────────────────────────────────────── */
router.get('/categorias', authenticate, async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM categorias ORDER BY nombre');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.post('/categorias', authenticate, async (req, res) => {
  const { nombre, descripcion } = req.body;
  if (!nombre) return res.status(400).json({ error: 'Nombre requerido' });
  try {
    const { rows } = await pool.query(
      'INSERT INTO categorias (nombre, descripcion) VALUES ($1,$2) RETURNING *',
      [nombre, descripcion]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.put('/categorias/:id', authenticate, async (req, res) => {
  const { nombre, descripcion } = req.body;
  try {
    const { rows } = await pool.query(
      'UPDATE categorias SET nombre=$1, descripcion=$2 WHERE id=$3 RETURNING *',
      [nombre, descripcion, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'No encontrada' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.delete('/categorias/:id', authenticate, async (req, res) => {
  try {
    await pool.query('DELETE FROM categorias WHERE id=$1', [req.params.id]);
    res.status(204).send();
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/* ── PROVEEDORES ─────────────────────────────────────────────── */
router.get('/proveedores', authenticate, async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM proveedores ORDER BY nombre');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.post('/proveedores', authenticate, async (req, res) => {
  const { nombre, contacto, telefono, email, direccion } = req.body;
  if (!nombre) return res.status(400).json({ error: 'Nombre requerido' });
  try {
    const { rows } = await pool.query(
      `INSERT INTO proveedores (nombre,contacto,telefono,email,direccion)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [nombre, contacto, telefono, email, direccion]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.put('/proveedores/:id', authenticate, async (req, res) => {
  const { nombre, contacto, telefono, email, direccion } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE proveedores SET nombre=$1,contacto=$2,telefono=$3,email=$4,direccion=$5
       WHERE id=$6 RETURNING *`,
      [nombre, contacto, telefono, email, direccion, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'No encontrado' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.delete('/proveedores/:id', authenticate, async (req, res) => {
  try {
    await pool.query('DELETE FROM proveedores WHERE id=$1', [req.params.id]);
    res.status(204).send();
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/* ── EMPLEADOS ───────────────────────────────────────────────── */
router.get('/empleados', authenticate, async (_req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM empleados WHERE activo=true ORDER BY nombre'
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.post('/empleados', authenticate, async (req, res) => {
  const { nombre, apellido, email, telefono, cargo } = req.body;
  if (!nombre || !apellido || !email)
    return res.status(400).json({ error: 'Nombre, apellido y email requeridos' });
  try {
    const { rows } = await pool.query(
      `INSERT INTO empleados (nombre,apellido,email,telefono,cargo)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [nombre, apellido, email, telefono, cargo]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.put('/empleados/:id', authenticate, async (req, res) => {
  const { nombre, apellido, email, telefono, cargo, activo } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE empleados SET nombre=$1,apellido=$2,email=$3,telefono=$4,cargo=$5,activo=$6
       WHERE id=$7 RETURNING *`,
      [nombre, apellido, email, telefono, cargo, activo ?? true, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'No encontrado' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
