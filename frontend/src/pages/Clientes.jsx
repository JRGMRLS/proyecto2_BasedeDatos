import { useEffect, useState } from 'react'
import { api } from '../api'

const EMPTY = { nombre: '', apellido: '', email: '', telefono: '', direccion: '' }
const fmt = n => `Q${Number(n).toLocaleString('es-GT', { minimumFractionDigits: 2 })}`

function Modal({ title, form, setForm, onSave, onClose, error }) {
  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="grid-2">
            <div className="form-group"><label>Nombre *</label><input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} /></div>
            <div className="form-group"><label>Apellido *</label><input value={form.apellido} onChange={e => setForm(f => ({ ...f, apellido: e.target.value }))} /></div>
          </div>
          <div className="grid-2">
            <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
            <div className="form-group"><label>Teléfono</label><input value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} /></div>
          </div>
          <div className="form-group"><label>Dirección</label><input value={form.direccion} onChange={e => setForm(f => ({ ...f, direccion: e.target.value }))} /></div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={onSave}>Guardar</button>
        </div>
      </div>
    </div>
  )
}

export default function Clientes() {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm]   = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [error, setError]   = useState('')
  const [msg, setMsg]       = useState('')
  const [search, setSearch] = useState('')

  async function load() {
    const data = await api.get('/clientes')
    setClientes(data); setLoading(false)
  }
  useEffect(() => { load() }, [])

  function openAdd()   { setForm(EMPTY); setEditId(null); setError(''); setModal('add') }
  function openEdit(c) { setForm({ nombre: c.nombre, apellido: c.apellido, email: c.email || '', telefono: c.telefono || '', direccion: c.direccion || '' }); setEditId(c.id); setError(''); setModal('edit') }

  async function save() {
    setError('')
    try {
      if (modal === 'add') await api.post('/clientes', form)
      else await api.put(`/clientes/${editId}`, form)
      setModal(null); setMsg(modal === 'add' ? 'Cliente creado' : 'Cliente actualizado')
      setTimeout(() => setMsg(''), 3000); load()
    } catch (err) { setError(err.message) }
  }

  async function del(c) {
    if (!confirm(`¿Eliminar a ${c.nombre} ${c.apellido}?`)) return
    try {
      await api.delete(`/clientes/${c.id}`)
      setMsg('Cliente eliminado'); setTimeout(() => setMsg(''), 3000); load()
    } catch (err) { alert(err.message) }
  }

  const filtered = clientes.filter(c =>
    `${c.nombre} ${c.apellido} ${c.email}`.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div style={{ color: 'var(--muted)' }}>Cargando…</div>

  return (
    <div>
      <div className="page-header">
        <h1>Clientes</h1>
        <button className="btn btn-primary" onClick={openAdd}>+ Nuevo cliente</button>
      </div>

      {msg && <div className="alert alert-success">{msg}</div>}

      <div className="card">
        <input style={{ maxWidth: 320, marginBottom: '1rem' }} placeholder="Buscar…"
          value={search} onChange={e => setSearch(e.target.value)} />
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr><th>Nombre</th><th>Email</th><th>Teléfono</th><th>Compras</th><th>Total gastado</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td><strong>{c.nombre} {c.apellido}</strong></td>
                  <td className="text-muted">{c.email || '—'}</td>
                  <td className="text-muted">{c.telefono || '—'}</td>
                  <td><span className="badge badge-blue">{c.total_compras}</span></td>
                  <td className="text-accent">{fmt(c.total_gastado)}</td>
                  <td>
                    <div className="flex gap-1">
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(c)}>Editar</button>
                      <button className="btn btn-danger btn-sm" onClick={() => del(c)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && <Modal title={modal === 'add' ? 'Nuevo cliente' : 'Editar cliente'}
        form={form} setForm={setForm} onSave={save} onClose={() => setModal(null)} error={error} />}
    </div>
  )
}
