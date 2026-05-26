import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Productos from './pages/Productos'
import Clientes from './pages/Clientes'
import Ventas from './pages/Ventas'
import NuevaVenta from './pages/NuevaVenta'
import Reportes from './pages/Reportes'
import Catalogos from './pages/Catalogos'
import SinPermiso from './pages/SinPermiso'

// Permisos por rol (debe coincidir con el backend)
const PERMISOS = {
  gerente:      ['ventas','productos','clientes','catalogos','reportes'],
  vendedor:     ['ventas','productos','clientes'],
  cajero:       ['ventas','productos'],
  inventarista: ['productos','catalogos','reportes'],
  auditor:      ['reportes','ventas','productos','clientes'],
}

function Private({ children, permiso }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (permiso) {
    const perms = PERMISOS[user.rol] || []
    if (!perms.includes(permiso)) return <Navigate to="/sin-permiso" replace />
  }
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Private><Layout /></Private>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard"    element={<Dashboard />} />
            <Route path="ventas"       element={<Private permiso="ventas"><Ventas /></Private>} />
            <Route path="ventas/nueva" element={<Private permiso="ventas"><NuevaVenta /></Private>} />
            <Route path="productos"    element={<Private permiso="productos"><Productos /></Private>} />
            <Route path="clientes"     element={<Private permiso="clientes"><Clientes /></Private>} />
            <Route path="reportes"     element={<Private permiso="reportes"><Reportes /></Private>} />
            <Route path="catalogos"    element={<Private permiso="catalogos"><Catalogos /></Private>} />
            <Route path="sin-permiso"  element={<SinPermiso />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
