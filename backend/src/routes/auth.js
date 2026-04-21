const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const pool   = require('../db/pool');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'Usuario y contraseña requeridos' });

  try {
    const { rows } = await pool.query(
      `SELECT u.*, e.nombre AS emp_nombre, e.apellido AS emp_apellido
       FROM usuarios u
       LEFT JOIN empleados e ON e.id = u.empleado_id
       WHERE u.username = $1`,
      [username]
    );
    const user = rows[0];
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Credenciales inválidas' });

    const token = jwt.sign(
      { id: user.id, username: user.username, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({
      token,
      user: { id: user.id, username: user.username, rol: user.rol,
              nombre: user.emp_nombre, apellido: user.emp_apellido }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// POST /api/auth/register  (admin only – used by seed script setup)
router.post('/setup', async (req, res) => {
  const { username, password, rol, empleado_id } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO usuarios (username, password_hash, rol, empleado_id)
       VALUES ($1, $2, $3, $4) RETURNING id, username, rol`,
      [username, hash, rol || 'vendedor', empleado_id || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Usuario ya existe' });
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
