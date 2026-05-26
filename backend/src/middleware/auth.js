const jwt = require('jsonwebtoken')

// Permisos por rol
const PERMISOS = {
  gerente:      ['ventas', 'productos', 'clientes', 'catalogos', 'reportes', 'usuarios'],
  vendedor:     ['ventas', 'productos:read', 'clientes', 'reportes:read'],
  cajero:       ['ventas', 'productos:read', 'clientes:read'],
  inventarista: ['productos', 'catalogos', 'reportes:read'],
  auditor:      ['reportes', 'ventas:read', 'productos:read', 'clientes:read'],
}

function authenticate(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer '))
    return res.status(401).json({ error: 'Token requerido' })
  const token = header.slice(7)
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' })
  }
}

function requireRol(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'No autenticado' })
    if (!roles.includes(req.user.rol))
      return res.status(403).json({ error: `Acceso denegado. Se requiere: ${roles.join(' o ')}` })
    next()
  }
}

function requirePermiso(permiso) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'No autenticado' })
    const perms = PERMISOS[req.user.rol] || []
    const ok = perms.some(p => p === permiso || p === permiso.split(':')[0])
    if (!ok) return res.status(403).json({ error: 'Sin permisos para esta operación' })
    next()
  }
}

module.exports = { authenticate, requireRol, requirePermiso, PERMISOS }
