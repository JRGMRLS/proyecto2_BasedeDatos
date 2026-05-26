import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function SinPermiso() {
  const navigate = useNavigate()
  const { user } = useAuth()
  return (
    <div style={{ textAlign:'center', padding:'4rem 2rem' }}>
      <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>🔒</div>
      <h2 style={{ marginBottom:'.5rem' }}>Acceso denegado</h2>
      <p className="text-muted" style={{ marginBottom:'1.5rem' }}>
        Tu rol <strong style={{ color:'var(--accent)' }}>{user?.rol}</strong> no tiene permisos para ver esta sección.
      </p>
      <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
        Volver al Dashboard
      </button>
    </div>
  )
}
