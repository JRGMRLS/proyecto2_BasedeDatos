import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'

const fmt = n => `Q${Number(n).toLocaleString('es-GT', { minimumFractionDigits: 2 })}`

const ESTADO_BADGE = {
  completada: 'badge-green',
  anulada:    'badge-red',
  pendiente:  'badge-yellow',
}

export default function Ventas() {
  const navigate = useNavigate()
  const [ventas, setVentas] = useState([])
  const [loading, setLoading] = useState(true)
  const [detalle, setDetalle] = useState(null)
  const [msg, setMsg] = useState('')

  async function load() {
    const data = await api.get('/ventas')
    setVentas(data); setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function verDetalle(id) {
    const data = await api.get(`/ventas/${id}`)
    setDetalle(data)
  }

  async function anular(id) {
    if (!confirm('¿Anular esta venta? Se restaurará el stock.')) return
    try {
      await api.delete(`/ventas/${id}`)
      setMsg('Venta anulada'); setTimeout(() => setMsg(''), 3000); load()
    } catch (err) { alert(err.message) }
  }

  if (loading) return <div style={{ color: 'var(--muted)' }}>Cargando…</div>

  return (
    <div>
      <div className="page-header">
        <h1>Ventas</h1>
        <button className="btn btn-primary" onClick={() => navigate('/ventas/nueva')}>+ Nueva venta</button>
      </div>

      {msg && <div className="alert alert-success">{msg}</div>}

      <div className="card">
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr><th>#</th><th>Fecha</th><th>Cliente</th><th>Empleado</th><th>Items</th><th>Total</th><th>Estado</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {ventas.map(v => (
                <tr key={v.venta_id}>
                  <td className="text-muted">#{v.venta_id}</td>
                  <td>{new Date(v.fecha).toLocaleDateString('es-GT')}</td>
                  <td><strong>{v.cliente}</strong><br /><span className="text-muted" style={{ fontSize: '.78rem' }}>{v.cliente_email}</span></td>
                  <td className="text-muted">{v.empleado}</td>
                  <td>{v.num_items}</td>
                  <td className="text-accent">{fmt(v.total)}</td>
                  <td><span className={`badge ${ESTADO_BADGE[v.estado]}`}>{v.estado}</span></td>
                  <td>
                    <div className="flex gap-1">
                      <button className="btn btn-ghost btn-sm" onClick={() => verDetalle(v.venta_id)}>Ver</button>
                      {v.estado !== 'anulada' && (
                        <button className="btn btn-danger btn-sm" onClick={() => anular(v.venta_id)}>Anular</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {detalle && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setDetalle(null)}>
          <div className="modal" style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <h2>Venta #{detalle.venta_id}</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setDetalle(null)}>✕</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.5rem 1.5rem', marginBottom: '1.25rem', fontSize: '.875rem' }}>
              <div><span className="text-muted">Cliente: </span>{detalle.cliente}</div>
              <div><span className="text-muted">Empleado: </span>{detalle.empleado}</div>
              <div><span className="text-muted">Fecha: </span>{new Date(detalle.fecha).toLocaleString('es-GT')}</div>
              <div><span className="text-muted">Estado: </span><span className={`badge ${ESTADO_BADGE[detalle.estado]}`}>{detalle.estado}</span></div>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: '.4rem .5rem', color: 'var(--muted)', fontSize: '.78rem' }}>Producto</th>
                <th style={{ textAlign: 'right', padding: '.4rem .5rem', color: 'var(--muted)', fontSize: '.78rem' }}>Cant</th>
                <th style={{ textAlign: 'right', padding: '.4rem .5rem', color: 'var(--muted)', fontSize: '.78rem' }}>Precio</th>
                <th style={{ textAlign: 'right', padding: '.4rem .5rem', color: 'var(--muted)', fontSize: '.78rem' }}>Subtotal</th>
              </tr></thead>
              <tbody>
                {detalle.items?.map(it => (
                  <tr key={it.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '.5rem' }}>{it.producto}</td>
                    <td style={{ padding: '.5rem', textAlign: 'right' }}>{it.cantidad}</td>
                    <td style={{ padding: '.5rem', textAlign: 'right' }}>{fmt(it.precio_unit)}</td>
                    <td style={{ padding: '.5rem', textAlign: 'right', color: 'var(--accent)' }}>{fmt(it.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ textAlign: 'right', marginTop: '1rem', fontSize: '1.1rem', fontWeight: 700 }}>
              Total: <span className="text-accent">{fmt(detalle.total)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
