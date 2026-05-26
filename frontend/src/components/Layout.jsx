import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import './Layout.css'

const PERMISOS_ROL = {
  gerente:      ['ventas','productos','clientes','catalogos','reportes'],
  vendedor:     ['ventas','productos','clientes'],
  cajero:       ['ventas','productos'],
  inventarista: ['productos','catalogos','reportes'],
  auditor:      ['reportes','ventas','productos','clientes'],
}

const ROL_BADGE = {
  gerente:      { color:'var(--accent)',  bg:'rgba(240,192,74,.15)' },
  vendedor:     { color:'var(--green)',   bg:'rgba(62,207,142,.15)' },
  cajero:       { color:'var(--blue)',    bg:'rgba(91,141,238,.15)' },
  inventarista: { color:'var(--accent2)', bg:'rgba(224,123,63,.15)' },
  auditor:      { color:'var(--muted)',   bg:'rgba(122,128,160,.15)' },
}

const ALL_NAV = [
  { to:'/dashboard',  icon:'◈', label:'Dashboard',  permiso: null },
  { to:'/ventas',     icon:'⟁', label:'Ventas',      permiso:'ventas' },
  { to:'/productos',  icon:'▦', label:'Productos',   permiso:'productos' },
  { to:'/clientes',   icon:'◎', label:'Clientes',    permiso:'clientes' },
  { to:'/reportes',   icon:'▤', label:'Reportes',    permiso:'reportes' },
  { to:'/catalogos',  icon:'≡', label:'Catálogos',   permiso:'catalogos' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const perms = PERMISOS_ROL[user?.rol] || []
  const nav = ALL_NAV.filter(n => !n.permiso || perms.includes(n.permiso))
  const badge = ROL_BADGE[user?.rol] || { color:'var(--muted)', bg:'rgba(122,128,160,.15)' }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-mark">T</span>
          <span className="logo-text">TiendaGT</span>
        </div>
        <nav className="sidebar-nav">
          {nav.map(n => (
            <NavLink key={n.to} to={n.to} className={({ isActive }) => 'nav-item'+(isActive?' active':'')}>
              <span className="nav-icon">{n.icon}</span>
              <span>{n.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user?.username?.[0]?.toUpperCase()}</div>
            <div>
              <div className="user-name">{user?.nombre || user?.username}</div>
              <div style={{ display:'inline-block', padding:'.15rem .5rem', borderRadius:20, fontSize:'.7rem', fontWeight:600,
                color: badge.color, background: badge.bg, marginTop:'.15rem' }}>
                {user?.rol}
              </div>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm w-full mt-2" onClick={() => { logout(); navigate('/login') }}>
            Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="main-content"><Outlet /></main>
    </div>
  )
}
