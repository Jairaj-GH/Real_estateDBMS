import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import api from '../api/axios'

function fmt(n) {
  return Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })
}
function fmtCur(n) {
  return Number(n).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
}

// ─── SQL Console ─────────────────────────────────────────────────────────────
function SQLConsole() {
  const [query, setQuery] = useState('SELECT * FROM Property LIMIT 10;')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])
  const histRef = useRef(null)

  const runQuery = async () => {
    if (!query.trim()) return
    const isDestructive = /^\s*(DROP|TRUNCATE|DELETE\s+FROM\s+\w+\s*;?$)/i.test(query)
    if (isDestructive) {
      const ok = window.confirm('⚠️ This is a destructive operation. Are you sure?')
      if (!ok) return
    }
    setLoading(true)
    setResult(null)
    try {
      const { data } = await api.post('/admin/sql/', { query })
      setResult({ ...data, error: null })
      setHistory(h => [{ query, ts: new Date().toLocaleTimeString() }, ...h.slice(0, 19)])
    } catch (e) {
      setResult({ error: e.response?.data?.error || 'Query failed.' })
    } finally {
      setLoading(false)
    }
  }

  const PREDEFINED_QUERIES = [
    { label: 'New Rented Houses (Guwahati)', query: "SELECT address, city, construction_year, current_status FROM Property WHERE city = 'Guwahati' AND construction_year > 2023 AND current_status = 'rented';" },
    { label: 'Properties (2M - 6M)', query: "SELECT address, listed_price FROM Property WHERE city = 'Guwahati' AND listed_price BETWEEN 2000000 AND 6000000;" },
    { label: 'Rents on G.S Road (< 15k)', query: "SELECT p.address, p.locality, p.no_of_bedroom, r.monthly_rent FROM Property p JOIN Rent r ON p.property_id = r.property_id WHERE p.city = 'Guwahati' AND p.locality = 'G.S Road' AND p.no_of_bedroom >= 2 AND r.monthly_rent < 15000;" },
    { label: 'Top Agent (Sales 2023)', query: "SELECT a.name, SUM(s.final_price) AS total_sales_amount FROM Agent a JOIN Sale s ON a.agent_id = s.agent_id WHERE YEAR(s.sale_date) = 2023 GROUP BY a.agent_id, a.name ORDER BY total_sales_amount DESC LIMIT 1;" }
  ]

  const QUICK_DIRECTIVES = [ 'SELECT * FROM Property LIMIT 10;', 'SELECT * FROM Agent;', 'SELECT * FROM Sale LIMIT 10;' ]

  return (
    <div className="sql-console-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32, animation: 'fadeIn 0.8s' }}>
      <div style={{ gridColumn: 'span 1' }}>
        <div className="card" style={{ marginBottom: 32, background: 'rgba(15, 23, 42, 0.8)', padding: 0 }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ color: 'var(--accent)', fontFamily: 'Instrument Serif, serif', fontSize: '1.5rem', fontStyle: 'italic' }}>Terminal Engine</h3>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn" style={{ padding: '8px 16px', fontSize: '0.65rem' }} onClick={() => setQuery('')}>CLEAR</button>
              <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.65rem' }} onClick={runQuery} disabled={loading}>
                {loading ? 'EXECUTING…' : 'RUN QUERY'}
              </button>
            </div>
          </div>
          <div style={{ padding: 32 }}>
            <textarea
              style={{ background: 'transparent', color: '#fff', border: 'none', fontFamily: 'monospace', fontSize: '1rem', width: '100%', height: 200, resize: 'none', outline: 'none' }}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Enter SQL command sequence..."
              spellCheck={false}
            />
          </div>
        </div>

        {result && (
          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: '24px 32px', background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <h3 style={{ fontSize: '1rem', color: '#fff' }}>
                {result.error ? '⚠️ Execution Interrupted' : `Dataset Output (${result.row_count || 0} rows)`}
              </h3>
            </div>
            <div style={{ padding: result.error ? 32 : 0 }}>
              {result.error ? (
                <div style={{ background: 'rgba(220, 38, 38, 0.1)', color: '#f87171', padding: 24, borderRadius: 16, fontFamily: 'monospace', fontSize: '.9rem', border: '1px solid rgba(220, 38, 38, 0.2)' }}>
                  {result.error}
                </div>
              ) : (
                <div className="table-wrap" style={{ maxHeight: 500, overflowY: 'auto' }}>
                  <table>
                    <thead>
                      <tr>{result.columns?.map(c => <th key={c}>{c.toUpperCase()}</th>)}</tr>
                    </thead>
                    <tbody>
                      {result.rows?.map((row, i) => (
                        <tr key={i}>
                          {row.map((cell, j) => <td key={j} style={{ fontFamily: 'monospace', fontSize: '.85rem', color: 'rgba(255,255,255,0.8)' }}>{cell === null ? 'NULL' : String(cell)}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div style={{ gridColumn: 'span 1' }}>
        <div className="card" style={{ marginBottom: 24, padding: 0 }}>
          <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>Predefined Analysis</h3>
          </div>
          {PREDEFINED_QUERIES.map((q, i) => (
            <button key={i} className="nav-link" style={{ width: '100%', border: 'none', background: 'none', margin: 0, borderRadius: 0, borderBottom: '1px solid rgba(255,255,255,0.05)' }} onClick={() => setQuery(q.query)}>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.6rem', color: 'var(--accent)', fontWeight: 900 }}>QUERY {i+1}</div>
                <div style={{ fontSize: '0.8rem', color: '#fff' }}>{q.label}</div>
              </div>
            </button>
          ))}
        </div>

        {history.length > 0 && (
          <div className="card" style={{ padding: 0 }}>
             <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>Execution Log</h3>
            </div>
            <div style={{ padding: '12px 0', maxHeight: 300, overflowY: 'auto' }}>
              {history.map((h, i) => (
                <button key={i} onClick={() => setQuery(h.query)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '16px 32px', border: 'none', background: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '.6rem', color: 'var(--text-muted)' }}>{h.ts}</div>
                  <div style={{ fontSize: '.7rem', color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace' }}>{h.query.slice(0, 40)}…</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Database Stats ──────────────────────────────────────────────────────────
function DBStats() {
  const [stats, setStats] = useState(null)
  useEffect(() => { api.get('/admin/stats/').then(r => setStats(r.data)) }, [])

  if (!stats) return <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" /></div>

  const cards = [
    { icon: '🏡', label: 'TOTAL ESTATES', value: fmt(stats.total_properties) },
    { icon: '✅', label: 'AVAILABLE ASSETS', value: fmt(stats.available_properties) },
    { icon: '💰', label: 'TOTAL REVENUE', value: fmtCur(stats.total_sales_revenue), wide: true },
    { icon: '🤝', label: 'ACTIVE AGENTS', value: fmt(stats.total_agents) },
    { icon: '👤', label: 'OWNERS', value: fmt(stats.total_owners) },
    { icon: '🛒', label: 'BUYERS', value: fmt(stats.total_buyers) },
    { icon: '🟢', label: 'ACTIVE RENTS', value: fmt(stats.active_rents) },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32, animation: 'fadeIn 0.8s' }}>
      {cards.map(c => (
        <div key={c.label} className="card" style={{ padding: 40, background: c.wide ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--accent)', letterSpacing: '0.2em', marginBottom: 16 }}>{c.label}</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', color: '#fff' }}>{c.value}</div>
          <div style={{ marginTop: 20, fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', fontWeight: 800 }}>{c.icon} SECURE ASSET</div>
        </div>
      ))}
    </div>
  )
}

// ─── Table Browser ───────────────────────────────────────────────────────────
function TableBrowser() {
  const TABLES = ['Owner', 'Agent', 'Buyer', 'Tenant', 'Property', 'Sale', 'Rent']
  const [table, setTable] = useState('Property')
  const [data, setData] = useState(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    api.get(`/admin/tables/${table}/`, { params: { page } })
      .then(r => setData(r.data))
      .catch(err => {
        console.error('Table Fetch Error:', err)
        setError(err.response?.data?.error || 'Failed to connect to the database. Ensure the backend is running.')
      })
      .finally(() => setLoading(false))
  }, [table, page])

  const changeTable = t => { 
    setTable(t)
    setPage(1)
    setData(null)
    setError(null)
  }

  const renderContent = () => {
    if (loading) return (
      <div style={{ height: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <div className="spinner" />
        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Retrieving {table} Registry...</span>
      </div>
    )

    if (error) return (
      <div style={{ padding: 60, textAlign: 'center', background: 'rgba(220, 38, 38, 0.05)', borderRadius: 24, border: '1px solid rgba(220, 38, 38, 0.1)' }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>⚠️</div>
        <h3 style={{ color: '#fff', marginBottom: 8 }}>Registry Access Failed</h3>
        <p style={{ color: 'var(--text-muted)', maxWidth: 400, margin: '0 auto' }}>{error}</p>
        <button className="btn btn-primary" style={{ marginTop: 24 }} onClick={() => changeTable(table)}>RETRY CONNECTION</button>
      </div>
    )

    if (!data || !data.results || data.results.length === 0) return (
      <div style={{ padding: 60, textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: 24, border: '1px solid var(--glass-border)' }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>📁</div>
        <h3 style={{ color: '#fff', marginBottom: 8 }}>Empty Registry</h3>
        <p style={{ color: 'var(--text-muted)' }}>No records found for {table} in the current database view.</p>
      </div>
    )

    const columns = Object.keys(data.results[0])

    return (
      <div className="card" style={{ padding: 0, animation: 'fadeIn 0.5s' }}>
        <div style={{ padding: '24px 32px', background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ color: '#fff', fontSize: '1.2rem', fontFamily: 'Instrument Serif, serif', fontStyle: 'italic' }}>{data.table} Master Registry</h3>
            <div style={{ fontSize: '0.65rem', color: 'var(--accent)', fontWeight: 900, marginTop: 4 }}>DATABASE DIRECTORY ACCESS COMPLETE</div>
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800 }}>
            PAGE {page} <span style={{ opacity: 0.3 }}>/</span> {Math.ceil(data.total/data.page_size) || 1}
          </span>
        </div>
        <div className="table-wrap" style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>{columns.map(col => <th key={col}>{col.replace(/_/g, ' ')}</th>)}</tr>
            </thead>
            <tbody>
              {data.results.map((row, i) => (
                <tr key={i}>
                  {columns.map((col, j) => {
                    const val = row[col]
                    return (
                      <td key={j} style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem' }}>
                        {val === null || val === undefined ? <span style={{ opacity: 0.3 }}>—</span> : String(val)}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: 32, display: 'flex', justifyContent: 'center', gap: 24, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <button className="btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>PREVIOUS</button>
          <button className="btn" disabled={page >= Math.ceil(data.total/data.page_size)} onClick={() => setPage(p => p + 1)}>NEXT</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ animation: 'fadeIn 0.8s' }}>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 40 }}>
        {TABLES.map(t => (
          <button key={t} 
            className="btn glass-btn" 
            style={{ 
              background: table === t ? 'rgba(255,255,255,0.15)' : 'transparent', 
              borderColor: table === t ? 'var(--accent)' : 'var(--glass-border)',
              color: table === t ? '#fff' : 'var(--text-muted)',
              minWidth: 120
            }} 
            onClick={() => changeTable(t)}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="table-content-render-area">
        {renderContent()}
      </div>
    </div>
  )
}

// ─── User Management ─────────────────────────────────────────────────────────
function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', role: 'customer' })
  const [msg, setMsg] = useState(null)

  const fetchUsers = () => { api.get('/admin/users/').then(r => { setUsers(r.data); setLoading(false) }) }
  useEffect(() => { fetchUsers() }, [])

  return (
    <div style={{ animation: 'fadeIn 0.8s' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 40 }}>
        <h2 style={{ color: '#fff' }}>Personnel Directory</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>{showForm ? 'CANCEL' : 'AUTHORIZE USER'}</button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 40, padding: 40 }}>
          <form style={{ display: 'grid', gap: 24 }} onSubmit={async e => {
            e.preventDefault()
            try { await api.post('/admin/users/', form); fetchUsers(); setShowForm(false); setMsg({ type: 'success', text: 'User authorized.' }) }
            catch (e) { setMsg({ type: 'error', text: 'Authorization failed.' }) }
          }}>
            <input className="form-control" placeholder="Email" style={{ height: 60 }} value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            <input className="form-control" type="password" placeholder="Password" style={{ height: 60 }} value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
            <select className="form-control" style={{ height: 60 }} value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
              <option value="customer">Customer</option>
              <option value="agent">Agent</option>
              <option value="office">Executive</option>
              <option value="admin">Admin</option>
            </select>
            <button className="btn btn-primary" style={{ height: 60 }}>Confirm Registration</button>
          </form>
        </div>
      )}

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>IDENTITY</th><th>COMMUNICATION</th><th>CLEARANCE</th><th>STATUS</th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={{ color: '#fff', fontWeight: 700 }}>{u.full_name || 'Anonymous'}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                  <td><span style={{ fontSize: '0.7rem', padding: '4px 12px', background: 'rgba(255,255,255,0.1)', borderRadius: 99 }}>{u.role.toUpperCase()}</span></td>
                  <td><span style={{ color: u.is_active ? '#4ade80' : '#f87171' }}>{u.is_active ? 'ACTIVE' : 'SUSPENDED'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const location = useLocation()
  const path = location.pathname

  let activeComponent = <DBStats />
  let pageTitle = 'System Intelligence'

  if (path.includes('/sql')) { activeComponent = <SQLConsole />; pageTitle = 'Engine Control' }
  else if (path.includes('/users')) { activeComponent = <UserManagement />; pageTitle = 'Access Governance' }
  else if (path.includes('/tables')) { activeComponent = <TableBrowser />; pageTitle = 'Estate Registries' }

  return (
    <div style={{ animation: 'fadeIn 0.8s' }}>
      <div style={{ marginBottom: 40 }}>
      </div>

      <div className="admin-content-area">
        {activeComponent}
      </div>
    </div>
  )
}
