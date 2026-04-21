import { useEffect, useState } from 'react'
import { api } from '../api'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell
} from 'recharts'

const fmt = n => `Q${Number(n).toLocaleString('es-GT', { minimumFractionDigits: 2 })}`

function exportCSV(data, filename) {
  if (!data.length) return
  const keys = Object.keys(data[0])
  const csv = [
    keys.join(','),
    ...data.map(row => keys.map(k => {
      const v = row[k] ?? ''
      return typeof v === 'string' && v.includes(',') ? `"${v}"` : v
    }).join(','))
  ].join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

const TABS = ['Ventas por empleado', 'Productos top', 'Inventario', 'Clientes frecuentes']

export default function Reportes() {
  const [tab, setTab]         = useState(0)
  const [empData, setEmp]     = useState([])
  const [topData, setTop]     = useState([])
  const [invData, setInv]     = useState([])
  const [frecData, setFrec]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/reportes/ventas-por-empleado'),
      api.get('/reportes/productos-top'),
      api.get('/reportes/inventario-categoria'),
      api.get('/reportes/clientes-frecuentes'),
    ]).then(([e, t, i, f]) => {
      setEmp(e); setTop(t); setInv(i); setFrec(f)
      setLoading(false)
    })
  }, [])

  if (loading) return <div style={{ color: 'var(--muted)' }}>Cargando…</div>

  const allData = [empData, topData, invData, frecData]
  const allNames = ['ventas_por_empleado', 'productos_top', 'inventario_categoria', 'clientes_frecuentes']

  return (
    <div>
      <div className="page-header">
        <h1>Reportes</h1>
        <button className="btn btn-ghost" onClick={() => exportCSV(allData[tab], `${allNames[tab]}.csv`)}>
          ↓ Exportar CSV
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {TABS.map((t, i) => (
          <button key={i} className={`btn ${tab === i ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setTab(i)}>{t}</button>
        ))}
      </div>

      {/* Reporte 1: Ventas por empleado */}
      {tab === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <h3 style={{ marginBottom: '1.25rem', fontSize: '1rem' }}>Ventas por empleado — GROUP BY + HAVING</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={empData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="empleado" tick={{ fontSize: 11, fill: 'var(--muted)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--muted)' }} tickFormatter={v => `Q${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8 }}
                  formatter={v => [fmt(v), 'Total']} />
                <Bar dataKey="total_ventas" radius={[4,4,0,0]}>
                  {empData.map((_, i) => <Cell key={i} fill={i % 2 === 0 ? 'var(--accent)' : 'var(--accent2)'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card">
            <div className="tbl-wrap">
              <table>
                <thead><tr><th>Empleado</th><th>Cargo</th><th>Ventas</th><th>Total</th><th>Promedio</th><th>Máximo</th></tr></thead>
                <tbody>
                  {empData.map(r => (
                    <tr key={r.id}>
                      <td><strong>{r.empleado}</strong></td>
                      <td className="text-muted">{r.cargo}</td>
                      <td><span className="badge badge-blue">{r.num_ventas}</span></td>
                      <td className="text-accent">{fmt(r.total_ventas)}</td>
                      <td className="text-muted">{fmt(r.promedio_venta)}</td>
                      <td>{fmt(r.venta_max)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Reporte 2: Productos top */}
      {tab === 1 && (
        <div className="card">
          <h3 style={{ marginBottom: '1.25rem', fontSize: '1rem' }}>Productos más vendidos — VIEW v_productos_mas_vendidos</h3>
          <div className="tbl-wrap">
            <table>
              <thead><tr><th>#</th><th>Producto</th><th>Categoría</th><th>Unidades vendidas</th><th>Ingresos</th></tr></thead>
              <tbody>
                {topData.map((r, i) => (
                  <tr key={r.producto_id}>
                    <td className="text-muted">{i + 1}</td>
                    <td><strong>{r.producto}</strong></td>
                    <td><span className="badge badge-blue">{r.categoria}</span></td>
                    <td>{r.total_vendido}</td>
                    <td className="text-accent">{fmt(r.ingresos_total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reporte 3: Inventario */}
      {tab === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <h3 style={{ marginBottom: '1.25rem', fontSize: '1rem' }}>Valor de inventario por categoría — VIEW v_inventario_categoria</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={invData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--muted)' }} tickFormatter={v => `Q${(v/1000).toFixed(0)}k`} />
                <YAxis dataKey="categoria" type="category" tick={{ fontSize: 11, fill: 'var(--muted)' }} width={90} />
                <Tooltip contentStyle={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8 }}
                  formatter={v => [fmt(v), 'Valor']} />
                <Bar dataKey="valor_inventario" fill="var(--blue)" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card">
            <div className="tbl-wrap">
              <table>
                <thead><tr><th>Categoría</th><th>Productos</th><th>Stock total</th><th>Valor inventario</th></tr></thead>
                <tbody>
                  {invData.map(r => (
                    <tr key={r.categoria_id}>
                      <td><strong>{r.categoria}</strong></td>
                      <td>{r.num_productos}</td>
                      <td>{r.stock_total}</td>
                      <td className="text-accent">{fmt(r.valor_inventario)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Reporte 4: Clientes frecuentes */}
      {tab === 3 && (
        <div className="card">
          <h3 style={{ marginBottom: '1.25rem', fontSize: '1rem' }}>Clientes frecuentes — Subquery EXISTS + correlacionado</h3>
          <div className="tbl-wrap">
            <table>
              <thead><tr><th>Cliente</th><th>Email</th><th>Teléfono</th><th>Compras</th><th>Total gastado</th></tr></thead>
              <tbody>
                {frecData.map(r => (
                  <tr key={r.id}>
                    <td><strong>{r.cliente}</strong></td>
                    <td className="text-muted">{r.email || '—'}</td>
                    <td className="text-muted">{r.telefono || '—'}</td>
                    <td><span className="badge badge-green">{r.total_compras}</span></td>
                    <td className="text-accent">{fmt(r.total_gastado)}</td>
                  </tr>
                ))}
                {frecData.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--muted)', padding: '2rem' }}>Sin clientes frecuentes aún</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
