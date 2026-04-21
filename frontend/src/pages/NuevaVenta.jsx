import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'

const fmt = n => `Q${Number(n).toLocaleString('es-GT', { minimumFractionDigits: 2 })}`

export default function NuevaVenta() {
  const navigate = useNavigate()
  const [productos, setProductos]   = useState([])
  const [clientes, setClientes]     = useState([])
  const [empleados, setEmpleados]   = useState([])
  const [clienteId, setClienteId]   = useState('')
  const [empleadoId, setEmpleadoId] = useState('')
  const [items, setItems]           = useState([])
  const [search, setSearch]         = useState('')
  const [error, setError]           = useState('')
  const [saving, setSaving]         = useState(false)
  const [success, setSuccess]       = useState(null)

  useEffect(() => {
    Promise.all([
      api.get('/productos'),
      api.get('/clientes'),
      api.get('/empleados'),
    ]).then(([p, c, e]) => { setProductos(p); setClientes(c); setEmpleados(e) })
  }, [])

  function addItem(prod) {
    setItems(prev => {
      const ex = prev.find(i => i.producto_id === prod.id)
      if (ex) return prev.map(i => i.producto_id === prod.id
        ? { ...i, cantidad: i.cantidad + 1 }
        : i)
      return [...prev, { producto_id: prod.id, nombre: prod.nombre, precio_unit: prod.precio, cantidad: 1, stock: prod.stock }]
    })
    setSearch('')
  }

  function updateCant(id, val) {
    const n = parseInt(val)
    if (n < 1) return
    setItems(prev => prev.map(i => i.producto_id === id ? { ...i, cantidad: n } : i))
  }

  function removeItem(id) {
    setItems(prev => prev.filter(i => i.producto_id !== id))
  }

  const total = items.reduce((s, i) => s + i.cantidad * i.precio_unit, 0)

  const filtered = search.length > 1
    ? productos.filter(p => p.nombre.toLowerCase().includes(search.toLowerCase())).slice(0, 8)
    : []

  async function submit() {
    setError('')
    if (!clienteId)   return setError('Seleccione un cliente')
    if (!empleadoId)  return setError('Seleccione un empleado')
    if (items.length === 0) return setError('Agregue al menos un producto')

    for (const i of items) {
      if (i.cantidad > i.stock) {
        setError(`Stock insuficiente para "${i.nombre}". Disponible: ${i.stock}`)
        return
      }
    }

    setSaving(true)
    try {
      const res = await api.post('/ventas', {
        cliente_id: parseInt(clienteId),
        empleado_id: parseInt(empleadoId),
        items: items.map(i => ({ producto_id: i.producto_id, cantidad: i.cantidad, precio_unit: i.precio_unit })),
      })
      setSuccess(res)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (success) return (
    <div style={{ maxWidth: 480, margin: '4rem auto', textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✓</div>
      <h2 style={{ color: 'var(--green)', marginBottom: '.5rem' }}>Venta registrada</h2>
      <p className="text-muted">Venta #{success.id} — Total: <strong className="text-accent">{fmt(success.total)}</strong></p>
      <div className="flex gap-1" style={{ justifyContent: 'center', marginTop: '1.5rem' }}>
        <button className="btn btn-ghost" onClick={() => navigate('/ventas')}>Ver ventas</button>
        <button className="btn btn-primary" onClick={() => { setSuccess(null); setItems([]); setClienteId(''); setEmpleadoId('') }}>Nueva venta</button>
      </div>
    </div>
  )

  return (
    <div>
      <div className="page-header">
        <h1>Nueva venta</h1>
        <button className="btn btn-ghost" onClick={() => navigate('/ventas')}>← Volver</button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="grid-2" style={{ gap: '1.5rem', alignItems: 'start' }}>
        {/* Left: product search + cart */}
        <div>
          <div className="card" style={{ marginBottom: '1rem' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Agregar productos</h3>
            <div style={{ position: 'relative' }}>
              <input placeholder="Buscar producto…" value={search}
                onChange={e => setSearch(e.target.value)} />
              {filtered.length > 0 && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
                  background: 'var(--surface2)', border: '1px solid var(--border)',
                  borderRadius: 8, marginTop: 4, maxHeight: 260, overflowY: 'auto'
                }}>
                  {filtered.map(p => (
                    <div key={p.id} onClick={() => addItem(p)}
                      style={{ padding: '.6rem 1rem', cursor: 'pointer', borderBottom: '1px solid var(--border)', fontSize: '.875rem' }}
                      onMouseOver={e => e.currentTarget.style.background = 'var(--border)'}
                      onMouseOut={e => e.currentTarget.style.background = ''}>
                      <div style={{ fontWeight: 500 }}>{p.nombre}</div>
                      <div style={{ color: 'var(--muted)', fontSize: '.78rem' }}>
                        {fmt(p.precio)} · Stock: {p.stock}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Carrito ({items.length})</h3>
            {items.length === 0
              ? <p className="text-muted" style={{ fontSize: '.875rem' }}>Sin productos</p>
              : items.map(i => (
                <div key={i.producto_id} style={{ display: 'flex', alignItems: 'center', gap: '.75rem', padding: '.6rem 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '.875rem', fontWeight: 500 }}>{i.nombre}</div>
                    <div style={{ fontSize: '.78rem', color: 'var(--muted)' }}>{fmt(i.precio_unit)} c/u</div>
                  </div>
                  <input type="number" min={1} max={i.stock} value={i.cantidad}
                    onChange={e => updateCant(i.producto_id, e.target.value)}
                    style={{ width: 64, textAlign: 'center' }} />
                  <div style={{ width: 90, textAlign: 'right', color: 'var(--accent)', fontWeight: 600 }}>
                    {fmt(i.cantidad * i.precio_unit)}
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={() => removeItem(i.producto_id)}>✕</button>
                </div>
              ))
            }
            {items.length > 0 && (
              <div style={{ textAlign: 'right', marginTop: '1rem', fontSize: '1.15rem', fontWeight: 700 }}>
                Total: <span className="text-accent">{fmt(total)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: client + employee + submit */}
        <div className="card">
          <h3 style={{ marginBottom: '1.25rem', fontSize: '1rem' }}>Datos de la venta</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label>Cliente *</label>
              <select value={clienteId} onChange={e => setClienteId(e.target.value)}>
                <option value="">Seleccionar cliente…</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Empleado *</label>
              <select value={empleadoId} onChange={e => setEmpleadoId(e.target.value)}>
                <option value="">Seleccionar empleado…</option>
                {empleados.map(e => (
                  <option key={e.id} value={e.id}>{e.nombre} {e.apellido}</option>
                ))}
              </select>
            </div>
            <div style={{ padding: '1rem', background: 'var(--surface2)', borderRadius: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.875rem', color: 'var(--muted)' }}>
                <span>Subtotal</span><span>{fmt(total)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '.5rem', fontWeight: 700 }}>
                <span>Total</span><span className="text-accent">{fmt(total)}</span>
              </div>
            </div>
            <button className="btn btn-primary w-full" onClick={submit} disabled={saving}>
              {saving ? 'Procesando…' : 'Confirmar venta'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
