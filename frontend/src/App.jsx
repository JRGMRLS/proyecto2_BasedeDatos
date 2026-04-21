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

function Private({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Private><Layout /></Private>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard"  element={<Dashboard />} />
            <Route path="productos"  element={<Productos />} />
            <Route path="clientes"   element={<Clientes />} />
            <Route path="ventas"     element={<Ventas />} />
            <Route path="ventas/nueva" element={<NuevaVenta />} />
            <Route path="reportes"   element={<Reportes />} />
            <Route path="catalogos"  element={<Catalogos />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
