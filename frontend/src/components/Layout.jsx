import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import './Layout.css'

const NAV = [
  { to: '/dashboard', icon: '◈', label: 'Dashboard' },
  { to: '/ventas',    icon: '⟁', label: 'Ventas' },
  { to: '/productos', icon: '▦', label: 'Productos' },
  { to: '/clientes',  icon: '◎', label: 'Clientes' },
  { to: '/reportes',  icon: '▤', label: 'Reportes' },
  { to: '/catalogos', icon: '≡', label: 'Catálogos' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-mark">T</span>
          <span className="logo-text">TiendaGT</span>
        </div>

        <nav className="sidebar-nav">
          {NAV.map(n => (
            <NavLink key={n.to} to={n.to} className={({ isActive }) =>
              'nav-item' + (isActive ? ' active' : '')
            }>
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
              <div className="user-role">{user?.rol}</div>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm w-full mt-2" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
