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

  const QUICK_QUERIES = [
    'SELECT * FROM Property LIMIT 10;',
    'SELECT * FROM Agent;',
    'SELECT * FROM Sale ORDER BY sale_date DESC LIMIT 10;',
    'SELECT * FROM Rent WHERE start_date <= CURDATE() AND end_date >= CURDATE();',
    'SELECT a.name, COUNT(s.sale_id) AS total_sales, SUM(s.final_price) AS revenue FROM Agent a LEFT JOIN Sale s ON a.agent_id = s.agent_id GROUP BY a.agent_id, a.name;',
    'SELECT p.city, COUNT(*) AS count, AVG(p.listed_price) AS avg_price FROM Property p GROUP BY p.city;',
  ]

  return (
    <div className="sql-console-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--page-padding)', animation: 'fadeIn 0.8s cubic-bezier(0.23, 1, 0.32, 1)' }}>
      <div style={{ gridColumn: 'span 1' }}>
        <div className="card" style={{ marginBottom: 32, border: 'none', background: '#1c1917', borderRadius: 24, overflow: 'hidden' }}>
          <div className="card-header" style={{ background: '#262626', padding: '24px clamp(24px, 4vw, 32px)', border: 'none', flexWrap: 'wrap', gap: 16 }}>
            <h3 style={{ color: 'var(--peach)', display: 'flex', alignItems: 'center', gap: 12, margin: 0, fontFamily: 'Instrument Serif, serif', fontSize: '1.5rem', fontStyle: 'italic' }}>
              <span style={{ opacity: 0.7 }}>$</span> Terminal Engine
            </h3>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn" style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.05)', color: '#a8a29e', border: 'none', borderRadius: 12, fontWeight: 800, fontSize: '0.7rem' }} onClick={() => setQuery('')}>CLEAR</button>
              <button className="btn" style={{ padding: '10px 20px', background: 'var(--peach)', color: '#1c1917', border: 'none', borderRadius: 12, fontWeight: 900, fontSize: '0.7rem' }} onClick={runQuery} disabled={loading}>
                {loading ? 'EXECUTING…' : 'RUN QUERY'}
              </button>
            </div>
          </div>
          <div style={{ padding: 'clamp(20px, 4vw, 32px)' }}>
            <textarea
              className="sql-textarea"
              style={{ background: 'transparent', color: '#e7e5e4', border: 'none', fontFamily: 'monospace', fontSize: '1rem', width: '100%', height: 200, resize: 'none', outline: 'none' }}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') runQuery() }}
              placeholder="Enter SQL command sequence..."
              spellCheck={false}
            />
            <div style={{ fontSize: '.65rem', color: '#57534e', marginTop: 24, fontWeight: 800, letterSpacing: '0.1em' }}>
              CMD + ENTER TO EXECUTE · DESTRUCTIVE OPERATIONS REQUIRE AUTHORIZATION
            </div>
          </div>
        </div>

        {result && (
          <div className="card" style={{ border: 'none', background: '#fff', borderRadius: 24, overflow: 'hidden' }}>
            <div className="card-header" style={{ padding: '24px clamp(24px, 4vw, 32px)', background: '#fcfaf7' }}>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.25rem', margin: 0 }}>
                {result.error ? '⚠️ Execution Interrupted' : result.type === 'select' ? `Dataset: ${result.row_count} Entries` : 'Command Successful'}
              </h3>
            </div>
            <div style={{ padding: result.error ? 'clamp(20px, 4vw, 32px)' : 0 }}>
              {result.error ? (
                <div style={{ background: '#fef2f2', color: '#991b1b', padding: 24, borderRadius: 16, fontFamily: 'monospace', fontSize: '.9rem', border: '1px solid #fee2e2' }}>
                  {result.error}
                </div>
              ) : result.type === 'select' ? (
                result.row_count === 0 ? (
                  <div style={{ padding: 60, textAlign: 'center' }}>
                    <p style={{ fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', fontSize: '1.2rem', color: '#78350f' }}>Query returned an empty set.</p>
                  </div>
                ) : (
                  <div className="table-wrap" style={{ maxHeight: 500, overflowY: 'auto' }}>
                    <table>
                      <thead>
                        <tr style={{ background: '#fcfaf7' }}>{result.columns.map(c => <th key={c} style={{ fontSize: '0.65rem', fontWeight: 900, color: '#a8a29e', letterSpacing: '0.1em' }}>{c.toUpperCase()}</th>)}</tr>
                      </thead>
                      <tbody>
                        {result.rows.map((row, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid #fcfaf7' }}>
                            {row.map((cell, j) => (
                              <td key={j} style={{ fontFamily: 'monospace', fontSize: '.85rem', color: '#1c1917', padding: '16px 24px' }}>
                                {cell === null ? <span style={{ color: '#d6d3d1' }}>NULL</span> : String(cell)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              ) : (
                <div style={{ margin: 32, padding: 24, background: '#f0fdf4', color: '#166534', borderRadius: 16, fontWeight: 800, border: '1px solid #dcfce7' }}>
                  {result.message}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div style={{ gridColumn: 'span 1' }}>
        <div className="card" style={{ marginBottom: 24, borderRadius: 24, border: 'none' }}>
          <div className="card-header" style={{ padding: '24px 32px' }}>
            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', margin: 0 }}>Quick Directives</h3>
          </div>
          <div style={{ padding: '12px 0' }}>
            {QUICK_QUERIES.map((q, i) => (
              <button
                key={i}
                onClick={() => setQuery(q)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left', padding: '16px 32px',
                  border: 'none', background: 'none', cursor: 'pointer', fontSize: '.7rem',
                  color: '#57534e', borderBottom: '1px solid #fcfaf7',
                  fontFamily: 'monospace', lineHeight: 1.5,
                  transition: 'all .2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#fcfaf7'; e.currentTarget.style.color = '#1c1917'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#57534e'; }}
              >
                {q.length > 50 ? q.slice(0, 50) + '…' : q}
              </button>
            ))}
          </div>
        </div>

        {history.length > 0 && (
          <div className="card" style={{ borderRadius: 24, border: 'none' }}>
            <div className="card-header" style={{ padding: '24px 32px' }}>
               <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', margin: 0 }}>Execution Log</h3>
            </div>
            <div style={{ padding: '12px 0', maxHeight: 350, overflowY: 'auto' }} ref={histRef}>
              {history.map((h, i) => (
                <button
                  key={i}
                  onClick={() => setQuery(h.query)}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left', padding: '16px 32px',
                    border: 'none', background: 'none', cursor: 'pointer',
                    borderBottom: '1px solid #fcfaf7',
                  }}
                >
                  <div style={{ fontSize: '.6rem', color: '#a8a29e', fontWeight: 900, marginBottom: 4 }}>{h.ts}</div>
                  <div style={{ fontSize: '.7rem', color: '#57534e', fontFamily: 'monospace', lineHeight: 1.4 }}>
                    {h.query.length > 40 ? h.query.slice(0, 40) + '…' : h.query}
                  </div>
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

  useEffect(() => {
    api.get('/admin/stats/').then(r => setStats(r.data))
  }, [])

  if (!stats) return <div style={{ padding: 100, textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>

  const cards = [
    { icon: '🏡', label: 'TOTAL ESTATES', value: fmt(stats.total_properties), color: '#1c1917' },
    { icon: '✅', label: 'AVAILABLE ASSETS', value: fmt(stats.available_properties), color: '#3a5a40' },
    { icon: '💰', label: 'TRANSACTIONAL REVENUE', value: fmtCur(stats.total_sales_revenue), color: '#78350f', wide: true },
    { icon: '🤝', label: 'AUTHORIZED AGENTS', value: fmt(stats.total_agents), color: '#1c1917' },
    { icon: '👤', label: 'REGISTERED OWNERS', value: fmt(stats.total_owners), color: '#1c1917' },
    { icon: '🛒', label: 'ELITE BUYERS', value: fmt(stats.total_buyers), color: '#1c1917' },
    { icon: '🏘️', label: 'MANAGED TENANTS', value: fmt(stats.total_tenants), color: '#1c1917' },
    { icon: '🟢', label: 'ACTIVE CHARTERS', value: fmt(stats.active_rents), color: '#3a5a40' },
  ]

  return (
    <div style={{ animation: 'fadeIn 0.8s cubic-bezier(0.23, 1, 0.32, 1)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: 'clamp(16px, 3vw, 32px)' }}>
        {cards.map(c => (
          <div key={c.label} className="stat-card" style={{ background: c.wide ? '#1c1917' : '#fff', color: c.wide ? '#fff' : '#1c1917', border: 'none', padding: 'clamp(24px, 5vw, 40px)', borderRadius: 24 }}>
            <div style={{ fontSize: '0.6rem', fontWeight: 900, color: c.wide ? '#a8a29e' : '#78350f', letterSpacing: '0.2em', marginBottom: 16 }}>{c.label}</div>
            <div className="stat-value" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontFamily: 'Instrument Serif, serif', fontStyle: 'italic' }}>{c.value}</div>
            <div style={{ marginTop: 20, fontSize: '0.75rem', color: c.wide ? 'var(--peach)' : '#3a5a40', fontWeight: 800 }}>{c.icon} Intelligence Verified</div>
          </div>
        ))}
      </div>
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

  useEffect(() => {
    setLoading(true)
    api.get(`/admin/tables/${table}/`, { params: { page } })
      .then(r => setData(r.data))
      .finally(() => setLoading(false))
  }, [table, page])

  const changeTable = t => { setTable(t); setPage(1); setData(null) }

  return (
    <div style={{ animation: 'fadeIn 0.8s cubic-bezier(0.23, 1, 0.32, 1)' }}>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 32 }}>
        {TABLES.map(t => (
          <button
            key={t}
            className="btn"
            style={{ 
              padding: '10px 20px', 
              borderRadius: 99, 
              border: 'none', 
              background: table === t ? '#1c1917' : 'rgba(255,255,255,0.6)', 
              color: table === t ? 'var(--peach)' : '#57534e',
              fontWeight: 800,
              fontSize: '0.7rem',
              letterSpacing: '0.05em'
            }}
            onClick={() => changeTable(t)}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: 100, textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
      ) : data ? (
        <div className="card" style={{ border: 'none', background: '#fff', borderRadius: 32, overflow: 'hidden' }}>
          <div className="card-header" style={{ padding: '24px clamp(24px, 5vw, 48px)', background: '#fcfaf7', flexWrap: 'wrap', gap: 16 }}>
            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.25rem', margin: 0 }}>
              {data.table} Registry
              <span style={{ marginLeft: 16, fontSize: '0.6rem', fontWeight: 900, background: '#1c1917', color: 'var(--peach)', padding: '4px 10px', borderRadius: 99 }}>{data.total} RECORDS</span>
            </h3>
            <span style={{ fontSize: '.75rem', color: '#a8a29e', fontWeight: 800 }}>Portfolio Page {data.page} of {Math.ceil(data.total / data.page_size)}</span>
          </div>
          <div className="table-wrap">
            {data.results.length === 0 ? (
              <div style={{ padding: 80, textAlign: 'center' }}><p style={{ fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', fontSize: '1.2rem' }}>No entries found in this registry.</p></div>
            ) : (
              <table>
                <thead>
                  <tr style={{ background: '#fcfaf7' }}>
                    {Object.keys(data.results[0]).map(col => <th key={col} style={{ fontSize: '0.6rem', fontWeight: 900, color: '#a8a29e', letterSpacing: '0.1em' }}>{col.toUpperCase()}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {data.results.map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #fcfaf7' }}>
                      {Object.values(row).map((val, j) => (
                        <td key={j} style={{ padding: '16px 24px', color: '#1c1917', fontWeight: 600, fontSize: '0.8rem' }}>
                          {val === null || val === undefined ? <span style={{ color: '#d6d3d1' }}>—</span> : String(val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {Math.ceil(data.total / data.page_size) > 1 && (
            <div className="pagination" style={{ padding: '24px clamp(24px, 5vw, 48px)', borderTop: '1px solid #fcfaf7', justifyContent: 'center', gap: 24 }}>
              <button className="btn" style={{ padding: '8px 16px', background: '#fcfaf7', color: '#1c1917', border: 'none', borderRadius: 12, fontWeight: 800, fontSize: '0.7rem' }} disabled={page === 1} onClick={() => setPage(p => p - 1)}>PREVIOUS</button>
              <span style={{ fontWeight: 900, fontSize: '0.7rem', color: '#a8a29e' }}>{page} / {Math.ceil(data.total / data.page_size)}</span>
              <button className="btn" style={{ padding: '8px 16px', background: '#fcfaf7', color: '#1c1917', border: 'none', borderRadius: 12, fontWeight: 800, fontSize: '0.7rem' }} disabled={page >= Math.ceil(data.total / data.page_size)} onClick={() => setPage(p => p + 1)}>NEXT</button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}

// ─── User Management ─────────────────────────────────────────────────────────
function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', first_name: '', last_name: '', role: 'customer', agent_id: '' })
  const [msg, setMsg] = useState(null)

  const fetchUsers = () => {
    setLoading(true)
    api.get('/admin/users/').then(r => { setUsers(r.data); setLoading(false) })
  }

  useEffect(() => { fetchUsers() }, [])

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const createUser = async e => {
    e.preventDefault()
    try {
      await api.post('/admin/users/', form)
      setMsg({ type: 'success', text: `Identity confirmed. User ${form.email} added to systems.` })
      setShowForm(false)
      setForm({ email: '', password: '', first_name: '', last_name: '', role: 'customer', agent_id: '' })
      fetchUsers()
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Authorization failed. Creation rejected.' })
    }
  }

  const toggleActive = async (userId, isActive) => {
    await api.patch(`/admin/users/${userId}/`, { is_active: !isActive })
    fetchUsers()
  }

  const deleteUser = async userId => {
    if (!window.confirm('Terminate this identity? This action is irreversible.')) return
    await api.delete(`/admin/users/${userId}/`)
    fetchUsers()
  }

  const changeRole = async (userId, role) => {
    await api.patch(`/admin/users/${userId}/`, { role })
    fetchUsers()
  }

  return (
    <div style={{ animation: 'fadeIn 0.8s cubic-bezier(0.23, 1, 0.32, 1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40, flexWrap: 'wrap', gap: 24 }}>
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 900, margin: 0 }}>Personnel Directory</h2>
        <button className="btn" style={{ padding: '12px 24px', background: '#1c1917', color: 'var(--peach)', border: 'none', borderRadius: 12, fontWeight: 900, fontSize: '0.7rem' }} onClick={() => setShowForm(!showForm)}>
          {showForm ? 'CANCEL OPERATION' : 'AUTHORIZE NEW USER'}
        </button>
      </div>

      {msg && <div className={`alert alert-${msg.type === 'success' ? 'success' : 'error'}`} style={{ marginBottom: 32, borderRadius: 16 }}>{msg.text}</div>}

      {showForm && (
        <div className="card" style={{ marginBottom: 40, border: 'none', background: '#fff', padding: 'clamp(24px, 5vw, 48px)', borderRadius: 32 }}>
          <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', marginBottom: 32 }}>Security Credentials</h3>
          <form onSubmit={createUser} style={{ display: 'grid', gap: 24 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
              <div className="form-group">
                <label style={{ fontSize: '0.6rem', fontWeight: 900, color: '#78350f', letterSpacing: '0.1em', marginBottom: 12, display: 'block' }}>GIVEN NAME</label>
                <input className="form-control" style={{ border: 'none', background: '#fcfaf7', height: 60, borderRadius: 12 }} value={form.first_name} onChange={e => setF('first_name', e.target.value)} />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.6rem', fontWeight: 900, color: '#78350f', letterSpacing: '0.1em', marginBottom: 12, display: 'block' }}>FAMILY NAME</label>
                <input className="form-control" style={{ border: 'none', background: '#fcfaf7', height: 60, borderRadius: 12 }} value={form.last_name} onChange={e => setF('last_name', e.target.value)} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
              <div className="form-group">
                <label style={{ fontSize: '0.6rem', fontWeight: 900, color: '#78350f', letterSpacing: '0.1em', marginBottom: 12, display: 'block' }}>EMAIL ADDRESS *</label>
                <input type="email" className="form-control" style={{ border: 'none', background: '#fcfaf7', height: 60, borderRadius: 12 }} required value={form.email} onChange={e => setF('email', e.target.value)} />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.6rem', fontWeight: 900, color: '#78350f', letterSpacing: '0.1em', marginBottom: 12, display: 'block' }}>ACCESS CIPHER *</label>
                <input type="password" className="form-control" style={{ border: 'none', background: '#fcfaf7', height: 60, borderRadius: 12 }} required value={form.password} onChange={e => setF('password', e.target.value)} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
              <div className="form-group">
                <label style={{ fontSize: '0.6rem', fontWeight: 900, color: '#78350f', letterSpacing: '0.1em', marginBottom: 12, display: 'block' }}>ASSIGNED ROLE *</label>
                <select className="form-control" style={{ border: 'none', background: '#fcfaf7', height: 60, borderRadius: 12 }} value={form.role} onChange={e => setF('role', e.target.value)}>
                  <option value="customer">Customer</option>
                  <option value="agent">Professional Agent</option>
                  <option value="office">Executive Office</option>
                  <option value="admin">System Administrator</option>
                </select>
              </div>
              {form.role === 'agent' && (
                <div className="form-group">
                  <label style={{ fontSize: '0.6rem', fontWeight: 900, color: '#78350f', letterSpacing: '0.1em', marginBottom: 12, display: 'block' }}>AGENT LINKAGE ID</label>
                  <input type="number" className="form-control" style={{ border: 'none', background: '#fcfaf7', height: 60, borderRadius: 12 }} value={form.agent_id} onChange={e => setF('agent_id', e.target.value)} placeholder="0" />
                </div>
              )}
            </div>
            <button type="submit" className="btn btn-primary" style={{ height: 64, marginTop: 16 }}>Confirm Identity Creation</button>
          </form>
        </div>
      )}

      {loading ? <div style={{ padding: 100, textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div> : (
        <div className="card" style={{ border: 'none', background: '#fff', borderRadius: 32, overflow: 'hidden' }}>
          <div className="card-header" style={{ padding: '24px clamp(24px, 5vw, 48px)', background: '#fcfaf7' }}>
            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.25rem', margin: 0 }}>Registry of Personnel <span style={{ marginLeft: 16, fontSize: '0.6rem', fontWeight: 900, background: '#1c1917', color: 'var(--peach)', padding: '4px 10px', borderRadius: 99 }}>{users.length} IDENTITIES</span></h3>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr style={{ background: '#fcfaf7' }}>
                  <th style={{ fontSize: '0.6rem', fontWeight: 900, color: '#a8a29e', letterSpacing: '0.1em' }}>IDENTITY</th>
                  <th style={{ fontSize: '0.6rem', fontWeight: 900, color: '#a8a29e', letterSpacing: '0.1em' }}>COMMUNICATION</th>
                  <th style={{ fontSize: '0.6rem', fontWeight: 900, color: '#a8a29e', letterSpacing: '0.1em' }}>CLEARANCE</th>
                  <th style={{ fontSize: '0.6rem', fontWeight: 900, color: '#a8a29e', letterSpacing: '0.1em' }}>STATUS</th>
                  <th style={{ fontSize: '0.6rem', fontWeight: 900, color: '#a8a29e', letterSpacing: '0.1em' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #fcfaf7' }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#1c1917', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.9rem', color: 'var(--peach)', fontFamily: 'Instrument Serif, serif', flexShrink: 0 }}>
                          {(u.full_name || u.email)[0].toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 800, color: '#1c1917', fontSize: '0.85rem' }}>{u.full_name || 'Anonymous Identity'}</span>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '.8rem', color: '#57534e' }}>{u.email}</td>
                    <td>
                      <select
                        className="form-control"
                        style={{ border: 'none', background: '#fcfaf7', padding: '6px 12px', borderRadius: 8, fontSize: '.7rem', fontWeight: 800, width: 'auto' }}
                        value={u.role}
                        onChange={e => changeRole(u.id, e.target.value)}
                      >
                        <option value="customer">Customer</option>
                        <option value="agent">Agent</option>
                        <option value="office">Executive</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>
                      <span style={{ 
                        padding: '4px 12px', 
                        borderRadius: 99, 
                        fontSize: '0.6rem', 
                        fontWeight: 900, 
                        letterSpacing: '0.05em',
                        background: u.is_active ? 'rgba(58, 90, 64, 0.1)' : 'rgba(153, 27, 27, 0.1)',
                        color: u.is_active ? '#3a5a40' : '#991b1b'
                      }}>
                        {u.is_active ? 'VERIFIED' : 'SUSPENDED'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn" style={{ background: 'none', color: '#1c1917', fontWeight: 800, fontSize: '0.65rem', padding: 4 }} onClick={() => toggleActive(u.id, u.is_active)}>
                          {u.is_active ? 'SUSPEND' : 'RESTORE'}
                        </button>
                        <button className="btn" style={{ background: 'none', color: '#991b1b', fontWeight: 800, fontSize: '0.65rem', padding: 4 }} onClick={() => deleteUser(u.id)}>TERMINATE</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Admin Dashboard Main ─────────────────────────────────────────────────────
export default function AdminDashboard() {
  const location = useLocation()
  const path = location.pathname

  // Determine active component based on path
  let activeComponent = <DBStats />
  let pageTitle = 'System Intelligence'
  let pageSubtitle = 'Comprehensive governance console for Guwahati elite assets.'

  if (path.includes('/sql')) {
    activeComponent = <SQLConsole />
    pageTitle = 'Engine Control'
    pageSubtitle = 'Direct interface for core database operations.'
  } else if (path.includes('/users')) {
    activeComponent = <UserManagement />
    pageTitle = 'Access Governance'
    pageSubtitle = 'Personnel directory and identity management protocols.'
  } else if (path.includes('/tables')) {
    activeComponent = <TableBrowser />
    pageTitle = 'Estate Registries'
    pageSubtitle = 'Detailed inspection of system database structures.'
  }

  return (
    <div style={{ animation: 'fadeIn 0.8s cubic-bezier(0.23, 1, 0.32, 1)' }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 900, color: '#1c1917', marginBottom: 8, letterSpacing: '-0.02em' }}>
           {pageTitle}
        </h1>
        <p style={{ color: '#78350f', fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', fontWeight: 600, fontFamily: 'Instrument Serif, serif', fontStyle: 'italic' }}>{pageSubtitle}</p>
      </div>

      <div className="admin-content-area">
        {activeComponent}
      </div>
    </div>
  )
}
