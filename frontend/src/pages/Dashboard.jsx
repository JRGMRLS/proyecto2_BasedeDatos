import { useEffect, useState } from 'react'
import { api } from '../api'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'

function StatCard({ label, value, sub, color }) {
  return (
    <div className="card" style={{ borderTop: `3px solid ${color}` }}>
      <div style={{ color: 'var(--muted)', fontSize: '.8rem', marginBottom: '.35rem' }}>{label}</div>
      <div style={{ fontSize: '1.8rem', fontFamily: 'var(--font-head)', fontWeight: 700 }}>{value}</div>
      {sub && <div style={{ color: 'var(--muted)', fontSize: '.8rem', marginTop: '.25rem' }}>{sub}</div>}
    </div>
  )
}

const fmt = n => new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(n)

export default function Dashboard() {
  const [stats, setStats]   = useState(null)
  const [daily, setDaily]   = useState([])
  const [topProd, setTop]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/reportes/dashboard'),
      api.get('/reportes/ventas-diarias'),
      api.get('/reportes/productos-top'),
    ]).then(([s, d, p]) => {
      setStats(s)
      setDaily(d.map(r => ({ ...r, total: Number(r.total) })))
      setTop(p.slice(0, 5))
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ color: 'var(--muted)', padding: '2rem' }}>Cargando…</div>

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <span className="text-muted" style={{ fontSize: '.85rem' }}>
          {new Date().toLocaleDateString('es-GT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      </div>

      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        <StatCard label="Ventas totales"    value={stats ? parseInt(stats.ventas.total).toLocaleString() : '—'} sub="Completadas" color="var(--accent)" />
        <StatCard label="Ingresos"          value={stats ? fmt(stats.ventas.monto) : '—'} sub="Acumulado" color="var(--green)" />
        <StatCard label="Productos"         value={stats ? stats.productos.total : '—'} sub={`Stock: ${stats?.productos.stock_total}`} color="var(--blue)" />
        <StatCard label="Stock crítico"     value={stats ? stats.stock_bajo.total : '—'} sub="< 5 unidades" color="var(--red)" />
      </div>

      <div className="grid-2" style={{ gap: '1.5rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: '1.25rem', fontSize: '1rem' }}>Ventas últimos 30 días</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={daily}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#f0c04a" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f0c04a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="dia" tick={{ fontSize: 10, fill: 'var(--muted)' }}
                tickFormatter={v => v.slice(5)} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--muted)' }}
                tickFormatter={v => `Q${(v/1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8 }}
                formatter={v => [fmt(v), 'Total']}
                labelFormatter={l => `Día: ${l}`}
              />
              <Area type="monotone" dataKey="total" stroke="#f0c04a" strokeWidth={2} fill="url(#grad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1.25rem', fontSize: '1rem' }}>Top 5 productos vendidos</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
            {topProd.map((p, i) => {
              const max = topProd[0]?.total_vendido || 1
              const pct = Math.round((p.total_vendido / max) * 100)
              return (
                <div key={p.producto_id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.85rem', marginBottom: '.2rem' }}>
                    <span>{i + 1}. {p.producto}</span>
                    <span style={{ color: 'var(--accent)' }}>{p.total_vendido} uds</span>
                  </div>
                  <div style={{ background: 'var(--border)', borderRadius: 4, height: 6 }}>
                    <div style={{ width: `${pct}%`, background: 'var(--accent)', height: '100%', borderRadius: 4, transition: 'width .4s' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
