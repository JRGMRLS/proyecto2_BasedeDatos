const router = require('express').Router();
const pool   = require('../db/pool');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT c.*, COUNT(v.id) AS total_compras,
              COALESCE(SUM(v.total),0) AS total_gastado
       FROM clientes c
       LEFT JOIN ventas v ON v.cliente_id = c.id AND v.estado='completada'
       GROUP BY c.id ORDER BY c.id`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM clientes WHERE id=$1', [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', authenticate, async (req, res) => {
  const { nombre, apellido, email, telefono, direccion } = req.body;
  if (!nombre || !apellido)
    return res.status(400).json({ error: 'Nombre y apellido requeridos' });
  try {
    const { rows } = await pool.query(
      `INSERT INTO clientes (nombre, apellido, email, telefono, direccion)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [nombre, apellido, email, telefono, direccion]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Email ya registrado' });
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  const { nombre, apellido, email, telefono, direccion } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE clientes SET nombre=$1, apellido=$2, email=$3, telefono=$4, direccion=$5
       WHERE id=$6 RETURNING *`,
      [nombre, apellido, email, telefono, direccion, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM clientes WHERE id=$1', [req.params.id]
    );
    if (!rowCount) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.status(204).send();
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
