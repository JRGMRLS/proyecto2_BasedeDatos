import { useEffect, useState } from 'react'
import { api } from '../api'

const EMPTY = { nombre: '', descripcion: '', precio: '', stock: '', categoria_id: '', proveedor_id: '' }
const fmt = n => `Q${Number(n).toLocaleString('es-GT', { minimumFractionDigits: 2 })}`

function Modal({ title, form, setForm, cats, provs, onSave, onClose, error }) {
  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label>Nombre *</label>
            <input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Descripción</label>
            <textarea rows={2} value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label>Precio (Q) *</label>
              <input type="number" step="0.01" value={form.precio} onChange={e => setForm(f => ({ ...f, precio: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Stock *</label>
              <input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} />
            </div>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label>Categoría *</label>
              <select value={form.categoria_id} onChange={e => setForm(f => ({ ...f, categoria_id: e.target.value }))}>
                <option value="">Seleccionar…</option>
                {cats.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Proveedor *</label>
              <select value={form.proveedor_id} onChange={e => setForm(f => ({ ...f, proveedor_id: e.target.value }))}>
                <option value="">Seleccionar…</option>
                {provs.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={onSave}>Guardar</button>
        </div>
      </div>
    </div>
  )
}

export default function Productos() {
  const [productos, setProductos] = useState([])
  const [cats, setCats]     = useState([])
  const [provs, setProvs]   = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]   = useState(null) // null | 'add' | 'edit'
  const [form, setForm]     = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [error, setError]   = useState('')
  const [search, setSearch] = useState('')
  const [msg, setMsg]       = useState('')

  async function load() {
    const [p, c, pr] = await Promise.all([
      api.get('/productos'),
      api.get('/categorias'),
      api.get('/proveedores'),
    ])
    setProductos(p); setCats(c); setProvs(pr)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  function openAdd()    { setForm(EMPTY); setEditId(null); setError(''); setModal('add') }
  function openEdit(p)  { setForm({ nombre: p.nombre, descripcion: p.descripcion || '', precio: p.precio, stock: p.stock, categoria_id: p.categoria_id, proveedor_id: p.proveedor_id }); setEditId(p.id); setError(''); setModal('edit') }

  async function save() {
    setError('')
    try {
      if (modal === 'add') await api.post('/productos', form)
      else await api.put(`/productos/${editId}`, form)
      setModal(null)
      setMsg(modal === 'add' ? 'Producto creado' : 'Producto actualizado')
      setTimeout(() => setMsg(''), 3000)
      load()
    } catch (err) { setError(err.message) }
  }

  async function del(p) {
    if (!confirm(`¿Eliminar "${p.nombre}"?`)) return
    try {
      await api.delete(`/productos/${p.id}`)
      setMsg('Producto eliminado')
      setTimeout(() => setMsg(''), 3000)
      load()
    } catch (err) { alert(err.message) }
  }

  const filtered = productos.filter(p =>
    p.nombre.toLowerCase().includes(search.toLowerCase()) ||
    p.categoria?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div style={{ color: 'var(--muted)' }}>Cargando…</div>

  return (
    <div>
      <div className="page-header">
        <h1>Productos</h1>
        <button className="btn btn-primary" onClick={openAdd}>+ Nuevo producto</button>
      </div>

      {msg && <div className="alert alert-success">{msg}</div>}

      <div className="card">
        <input style={{ maxWidth: 320, marginBottom: '1rem' }} placeholder="Buscar por nombre o categoría…"
          value={search} onChange={e => setSearch(e.target.value)} />
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>Nombre</th><th>Categoría</th><th>Proveedor</th>
                <th>Precio</th><th>Stock</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td><strong>{p.nombre}</strong><br /><span className="text-muted" style={{ fontSize: '.78rem' }}>{p.descripcion?.slice(0,50)}</span></td>
                  <td><span className="badge badge-blue">{p.categoria}</span></td>
                  <td className="text-muted">{p.proveedor}</td>
                  <td className="text-accent">{fmt(p.precio)}</td>
                  <td>
                    <span className={`badge ${p.stock < 5 ? 'badge-red' : p.stock < 15 ? 'badge-yellow' : 'badge-green'}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-1">
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>Editar</button>
                      <button className="btn btn-danger btn-sm" onClick={() => del(p)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--muted)', padding: '2rem' }}>Sin resultados</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <Modal title={modal === 'add' ? 'Nuevo producto' : 'Editar producto'}
          form={form} setForm={setForm} cats={cats} provs={provs}
          onSave={save} onClose={() => setModal(null)} error={error} />
      )}
    </div>
  )
}
