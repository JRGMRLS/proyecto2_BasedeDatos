import { useEffect, useState } from 'react'
import { api } from '../api'

const TABS = ['Categorías', 'Proveedores', 'Empleados']

/* ── Generic table + CRUD for simple entities ─────────── */
function CatTable({ data, onEdit, onDelete }) {
  return (
    <div className="tbl-wrap">
      <table>
        <thead><tr><th>ID</th><th>Nombre</th><th>Descripción</th><th>Acciones</th></tr></thead>
        <tbody>
          {data.map(r => (
            <tr key={r.id}>
              <td className="text-muted">{r.id}</td>
              <td><strong>{r.nombre}</strong></td>
              <td className="text-muted">{r.descripcion || '—'}</td>
              <td>
                <div className="flex gap-1">
                  <button className="btn btn-ghost btn-sm" onClick={() => onEdit(r)}>Editar</button>
                  <button className="btn btn-danger btn-sm" onClick={() => onDelete(r)}>Eliminar</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ProvTable({ data, onEdit, onDelete }) {
  return (
    <div className="tbl-wrap">
      <table>
        <thead><tr><th>Nombre</th><th>Contacto</th><th>Teléfono</th><th>Email</th><th>Acciones</th></tr></thead>
        <tbody>
          {data.map(r => (
            <tr key={r.id}>
              <td><strong>{r.nombre}</strong></td>
              <td>{r.contacto || '—'}</td>
              <td className="text-muted">{r.telefono || '—'}</td>
              <td className="text-muted">{r.email || '—'}</td>
              <td>
                <div className="flex gap-1">
                  <button className="btn btn-ghost btn-sm" onClick={() => onEdit(r)}>Editar</button>
                  <button className="btn btn-danger btn-sm" onClick={() => onDelete(r)}>Eliminar</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function EmpTable({ data, onEdit }) {
  return (
    <div className="tbl-wrap">
      <table>
        <thead><tr><th>Nombre</th><th>Email</th><th>Teléfono</th><th>Cargo</th><th>Estado</th><th>Acciones</th></tr></thead>
        <tbody>
          {data.map(r => (
            <tr key={r.id}>
              <td><strong>{r.nombre} {r.apellido}</strong></td>
              <td className="text-muted">{r.email}</td>
              <td className="text-muted">{r.telefono || '—'}</td>
              <td>{r.cargo || '—'}</td>
              <td><span className={`badge ${r.activo ? 'badge-green' : 'badge-red'}`}>{r.activo ? 'Activo' : 'Inactivo'}</span></td>
              <td><button className="btn btn-ghost btn-sm" onClick={() => onEdit(r)}>Editar</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ── Modals ─────────────────────────────────────────────── */
function CatModal({ form, setForm, onSave, onClose, error, isEdit }) {
  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>{isEdit ? 'Editar categoría' : 'Nueva categoría'}</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group"><label>Nombre *</label><input value={form.nombre || ''} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} /></div>
          <div className="form-group"><label>Descripción</label><textarea rows={2} value={form.descripcion || ''} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} /></div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={onSave}>Guardar</button>
        </div>
      </div>
    </div>
  )
}

function ProvModal({ form, setForm, onSave, onClose, error, isEdit }) {
  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <h2>{isEdit ? 'Editar proveedor' : 'Nuevo proveedor'}</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group"><label>Nombre *</label><input value={form.nombre || ''} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} /></div>
          <div className="grid-2">
            <div className="form-group"><label>Contacto</label><input value={form.contacto || ''} onChange={e => setForm(f => ({ ...f, contacto: e.target.value }))} /></div>
            <div className="form-group"><label>Teléfono</label><input value={form.telefono || ''} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} /></div>
          </div>
          <div className="grid-2">
            <div className="form-group"><label>Email</label><input type="email" value={form.email || ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
            <div className="form-group"><label>Dirección</label><input value={form.direccion || ''} onChange={e => setForm(f => ({ ...f, direccion: e.target.value }))} /></div>
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

function EmpModal({ form, setForm, onSave, onClose, error, isEdit }) {
  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>{isEdit ? 'Editar empleado' : 'Nuevo empleado'}</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="grid-2">
            <div className="form-group"><label>Nombre *</label><input value={form.nombre || ''} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} /></div>
            <div className="form-group"><label>Apellido *</label><input value={form.apellido || ''} onChange={e => setForm(f => ({ ...f, apellido: e.target.value }))} /></div>
          </div>
          <div className="grid-2">
            <div className="form-group"><label>Email *</label><input type="email" value={form.email || ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
            <div className="form-group"><label>Teléfono</label><input value={form.telefono || ''} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} /></div>
          </div>
          <div className="grid-2">
            <div className="form-group"><label>Cargo</label><input value={form.cargo || ''} onChange={e => setForm(f => ({ ...f, cargo: e.target.value }))} /></div>
            <div className="form-group"><label>Estado</label>
              <select value={form.activo ? 'true' : 'false'} onChange={e => setForm(f => ({ ...f, activo: e.target.value === 'true' }))}>
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
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

/* ── Main page ──────────────────────────────────────────── */
export default function Catalogos() {
  const [tab, setTab] = useState(0)
  const [cats, setCats]   = useState([])
  const [provs, setProvs] = useState([])
  const [emps, setEmps]   = useState([])
  const [modal, setModal] = useState(null)
  const [form, setForm]   = useState({})
  const [editId, setEditId] = useState(null)
  const [error, setError] = useState('')
  const [msg, setMsg]     = useState('')

  async function load() {
    const [c, p, e] = await Promise.all([api.get('/categorias'), api.get('/proveedores'), api.get('/empleados')])
    setCats(c); setProvs(p); setEmps(e)
  }
  useEffect(() => { load() }, [])

  function openAdd()   { setForm({}); setEditId(null); setError(''); setModal('add') }
  function openEdit(r) { setForm({ ...r }); setEditId(r.id); setError(''); setModal('edit') }

  async function save() {
    setError('')
    const isEdit = modal === 'edit'
    try {
      if (tab === 0) {
        isEdit ? await api.put(`/categorias/${editId}`, form) : await api.post('/categorias', form)
      } else if (tab === 1) {
        isEdit ? await api.put(`/proveedores/${editId}`, form) : await api.post('/proveedores', form)
      } else {
        isEdit ? await api.put(`/empleados/${editId}`, form) : await api.post('/empleados', form)
      }
      setModal(null); setMsg('Guardado'); setTimeout(() => setMsg(''), 3000); load()
    } catch (err) { setError(err.message) }
  }

  async function del(r) {
    const entity = tab === 0 ? 'categorías' : tab === 1 ? 'proveedores' : 'empleados'
    if (!confirm(`¿Eliminar "${r.nombre || `${r.nombre} ${r.apellido}`}"?`)) return
    try {
      const path = ['/categorias', '/proveedores'][tab]
      await api.delete(`${path}/${r.id}`)
      setMsg('Eliminado'); setTimeout(() => setMsg(''), 3000); load()
    } catch (err) { alert(err.message) }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Catálogos</h1>
        {tab < 3 && <button className="btn btn-primary" onClick={openAdd}>+ Nuevo</button>}
      </div>

      {msg && <div className="alert alert-success">{msg}</div>}

      <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1.5rem' }}>
        {TABS.map((t, i) => (
          <button key={i} className={`btn ${tab === i ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab(i)}>{t}</button>
        ))}
      </div>

      <div className="card">
        {tab === 0 && <CatTable  data={cats}  onEdit={openEdit} onDelete={del} />}
        {tab === 1 && <ProvTable data={provs} onEdit={openEdit} onDelete={del} />}
        {tab === 2 && <EmpTable  data={emps}  onEdit={openEdit} />}
      </div>

      {modal && tab === 0 && <CatModal  form={form} setForm={setForm} onSave={save} onClose={() => setModal(null)} error={error} isEdit={modal === 'edit'} />}
      {modal && tab === 1 && <ProvModal form={form} setForm={setForm} onSave={save} onClose={() => setModal(null)} error={error} isEdit={modal === 'edit'} />}
      {modal && tab === 2 && <EmpModal  form={form} setForm={setForm} onSave={save} onClose={() => setModal(null)} error={error} isEdit={modal === 'edit'} />}
    </div>
  )
}
