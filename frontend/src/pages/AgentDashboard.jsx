import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

function fmt(n) {
  return Number(n).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
}

function AgentOverview({ data }) {
  return (
    <div style={{ animation: 'fadeIn 0.8s ease-out' }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, color: 'var(--text-main)', marginBottom: 8, letterSpacing: '-0.04em' }}>Agent Intelligence</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500 }}>Your personal performance metrics and daily briefing.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 48 }}>
        <div className="card" style={{ padding: 40 }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>TOTAL CLOSURES</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>{data?.sales.length || 0}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>High Conversion Ratio</div>
        </div>
        <div className="card" style={{ padding: 40 }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>MONTHLY TARGET</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>75%</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Performance Benchmark</div>
        </div>
        <div className="card" style={{ padding: 40 }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>MANAGED PORTFOLIO</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>{data?.rents.length || 0}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Active Asset Tracking</div>
        </div>
      </div>

      <div className="card" style={{ padding: '48px',  color: 'var(--text-main)', textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 20 }}>📈</div>
        <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.5rem', fontWeight: 800, marginBottom: 16 }}>Productivity Briefing</h2>
        <p style={{ maxWidth: 700, margin: '0 auto', color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.6, fontWeight: 500 }}>
          "Your current trajectory is outpacing market averages. Continue to focus on high-yield closures this quarter."
        </p>
      </div>
    </div>
  )
}

function MyAchievements({ data }) {
  if (!data) return <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" /></div>
  return (
    <div style={{ animation: 'fadeIn 0.8s ease-out' }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, color: 'var(--text-main)', marginBottom: 8, letterSpacing: '-0.04em' }}>Achievement Portfolio</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500 }}>A detailed historical record of your successful mandates.</p>
      </div>

      <div className="card" style={{ padding: 0 }}>
         <div style={{ padding: '32px 40px', borderBottom: '1px solid #eee' }}>
            <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>Sales Transactions</h3>
         </div>
         <div className="table-wrap">
           {data.sales.length === 0 ? <div className="empty-state" style={{ padding: 80, textAlign: 'center' }}><p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No sales records found.</p></div> : (
             <table>
               <thead>
                 <tr>
                   <th>ESTATE</th>
                   <th>ACQUIRER</th>
                   <th>DATE</th>
                   <th>VALUE</th>
                 </tr>
               </thead>
               <tbody>
                  {data.sales.map(s => (
                    <tr key={s.property}>
                      <td style={{ color: 'var(--text-main)', fontWeight: 700 }}>{s.property_address}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{s.buyer_name}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{s.sale_date}</td>
                      <td style={{ color: 'var(--text-main)', fontWeight: 800, fontSize: '1.1rem' }}>{fmt(s.final_price)}</td>
                    </tr>
                  ))}
               </tbody>
             </table>
           )}
         </div>
      </div>
    </div>
  )
}

function MarkSold({ agentId, onUpdate }) {
  const [properties, setProperties] = useState([])
  const [buyers, setBuyers] = useState([])
  const [form, setForm] = useState({ property: '', buyer: '', sale_date: new Date().toISOString().split('T')[0], final_price: '', days_on_market: '' })
  const [newBuyer, setNewBuyer] = useState({ show: false, name: '', contact: '', email: '', budget: '' })
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    api.get('/properties/?status=available').then(r => setProperties(r.data.results || r.data))
    api.get('/buyers/').then(r => setBuyers(r.data.results || r.data))
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const addBuyer = async () => {
    try {
      const { data } = await api.post('/buyers/', newBuyer)
      setBuyers(b => [...b, data])
      setForm(f => ({ ...f, buyer: data.buyer_id }))
      setNewBuyer({ show: false, name: '', contact: '', email: '', budget: '' })
      setMsg({ type: 'success', text: `Confirmed: "${data.name}" added to the elite directory.` })
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.email?.[0] || 'Verification failed.' })
    }
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setMsg(null)
    try {
      // Auto-calculate days_on_market from listed_date
      const prop = properties.find(p => p.property_id == form.property)
      let dom = form.days_on_market
      if (!dom && prop?.listed_date) {
        const listed = new Date(prop.listed_date)
        const sold = new Date(form.sale_date)
        dom = Math.max(1, Math.round((sold - listed) / (1000 * 60 * 60 * 24)))
      }
      if (!dom) dom = 1

      await api.post('/sales/', { ...form, days_on_market: Number(dom), agent: agentId })
      setMsg({ type: 'success', text: 'Mandate successfully executed and recorded.' })
      setForm({ property: '', buyer: '', sale_date: new Date().toISOString().split('T')[0], final_price: '', days_on_market: '' })
      onUpdate?.()
      // Refresh available properties
      api.get('/properties/?status=available').then(r => setProperties(r.data.results || r.data))
    } catch (e) {
      const d = e.response?.data
      let errMsg = 'Execution failed.'
      if (d) {
        if (d.error) errMsg = d.error
        else if (typeof d === 'object') errMsg = Object.entries(d).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | ')
      }
      setMsg({ type: 'error', text: errMsg })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ animation: 'fadeIn 0.8s' }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, color: 'var(--text-main)', marginBottom: 8, letterSpacing: '-0.04em' }}>Record Mandate</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500 }}>Finalize a property sale and record the transaction value.</p>
      </div>

      <div className="card" style={{ padding: 40 }}>
        {msg && <div style={{ marginBottom: 32, padding: '16px', borderRadius: 12, background: msg.type === 'success' ? '#f0fdf4' : '#fef2f2', color: msg.type === 'success' ? '#166534' : '#991b1b', border: `1px solid ${msg.type === 'success' ? '#bbf7d0' : '#fee2e2'}`, fontSize: '0.9rem', fontWeight: 500 }}>{msg.text}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 24 }}>
          <div className="form-group">
            <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '0.05em', marginBottom: 10, display: 'block' }}>SUBJECT ESTATE</label>
            <select className="form-control" style={{ height: 64 }} value={form.property} onChange={e => {
               const p = properties.find(x => x.property_id == e.target.value);
               set('property', e.target.value);
               if(p) set('final_price', p.listed_price);
            }} required>
              <option value="">Select available property...</option>
              {properties.map(p => <option key={p.property_id} value={p.property_id}>{p.address} — {fmt(p.listed_price)}</option>)}
            </select>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '0.05em' }}>ACQUIRER DETAILS</label>
              <button type="button" style={{ fontSize: '0.75rem', padding: 0, color: 'var(--primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setNewBuyer(n => ({ ...n, show: !n.show }))}>
                {newBuyer.show ? 'Return to Directory' : 'Register New Acquirer'}
              </button>
            </div>
            {!newBuyer.show ? (
              <select className="form-control" style={{ height: 48 }} value={form.buyer} onChange={e => set('buyer', e.target.value)} required>
                <option value="">Select from directory...</option>
                {buyers.map(b => <option key={b.buyer_id} value={b.buyer_id}>{b.name} — {b.email}</option>)}
              </select>
            ) : (
              <div style={{ padding: 24,  borderRadius: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <input className="form-control" style={{ height: 44 }} placeholder="Legal Full Name" value={newBuyer.name} onChange={e => setNewBuyer(n => ({ ...n, name: e.target.value }))} />
                  <input className="form-control" style={{ height: 44 }} placeholder="Contact" value={newBuyer.contact} onChange={e => setNewBuyer(n => ({ ...n, contact: e.target.value }))} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16 }}>
                  <input className="form-control" style={{ height: 44 }} placeholder="Email" value={newBuyer.email} onChange={e => setNewBuyer(n => ({ ...n, email: e.target.value }))} />
                  <button type="button" className="btn btn-primary" style={{ height: 44, fontSize: '0.8rem' }} onClick={addBuyer}>Register</button>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div className="form-group">
              <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '0.05em', marginBottom: 10, display: 'block' }}>CLOSURE DATE</label>
              <input type="date" className="form-control" style={{ height: 48 }} value={form.sale_date} onChange={e => set('sale_date', e.target.value)} required />
            </div>
            <div className="form-group">
              <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '0.05em', marginBottom: 10, display: 'block' }}>FINAL VALUE</label>
              <input type="number" className="form-control" style={{ height: 48 }} value={form.final_price} onChange={e => set('final_price', e.target.value)} required />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ height: 56, fontSize: '1rem' }}>
            {loading ? 'EXECUTING...' : 'AUTHORIZE TRANSACTION'}
          </button>
        </form>
      </div>
    </div>
  )
}

function MarkRented({ agentId, onUpdate }) {
  const [properties, setProperties] = useState([])
  const [tenants, setTenants] = useState([])
  const [form, setForm] = useState({ property: '', tenant: '', start_date: new Date().toISOString().split('T')[0], end_date: '', monthly_rent: '' })
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    api.get('/properties/?status=available').then(r => setProperties(r.data.results || r.data))
    api.get('/tenants/').then(r => setTenants(r.data.results || r.data))
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/rents/', { ...form, agent: agentId })
      setMsg({ type: 'success', text: 'Charter agreement successfully secured.' })
      setForm({ property: '', tenant: '', start_date: new Date().toISOString().split('T')[0], end_date: '', monthly_rent: '' })
      onUpdate?.()
      api.get('/properties/?status=available').then(r => setProperties(r.data.results || r.data))
    } catch (e) {
      const d = e.response?.data
      let errMsg = 'Charter rejected.'
      if (d) {
        if (d.error) errMsg = d.error
        else if (typeof d === 'object') errMsg = Object.entries(d).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | ')
      }
      setMsg({ type: 'error', text: errMsg })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ animation: 'fadeIn 0.8s' }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, color: 'var(--text-main)', marginBottom: 8, letterSpacing: '-0.04em' }}>Secure Charter</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500 }}>Establish a new rental agreement for managed assets.</p>
      </div>

      <div className="card" style={{ padding: 40 }}>
        {msg && <div style={{ marginBottom: 32, padding: '16px', borderRadius: 12, background: msg.type === 'success' ? '#f0fdf4' : '#fef2f2', color: msg.type === 'success' ? '#166534' : '#991b1b', border: `1px solid ${msg.type === 'success' ? '#bbf7d0' : '#fee2e2'}`, fontSize: '0.9rem', fontWeight: 500 }}>{msg.text}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 24 }}>
           <div className="form-group">
            <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '0.05em', marginBottom: 10, display: 'block' }}>TARGET ESTATE</label>
            <select className="form-control" style={{ height: 64 }} value={form.property} onChange={e => set('property', e.target.value)} required>
              <option value="">Select estate for charter...</option>
              {properties.map(p => <option key={p.property_id} value={p.property_id}>{p.address}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--accent)', letterSpacing: '0.2em', marginBottom: 12, display: 'block' }}>TENANT IDENTITY</label>
            <select className="form-control" style={{ height: 64 }} value={form.tenant} onChange={e => set('tenant', e.target.value)} required>
              <option value="">Authorize tenant selection...</option>
              {tenants.map(t => <option key={t.tenant_id} value={t.tenant_id}>{t.name} — {t.email}</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
            <div className="form-group">
              <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '0.05em', marginBottom: 10, display: 'block' }}>COMMENCEMENT</label>
              <input type="date" className="form-control" style={{ height: 48 }} value={form.start_date} onChange={e => set('start_date', e.target.value)} required />
            </div>
            <div className="form-group">
              <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '0.05em', marginBottom: 10, display: 'block' }}>EXPIRATION</label>
              <input type="date" className="form-control" style={{ height: 48 }} value={form.end_date} onChange={e => set('end_date', e.target.value)} required />
            </div>
            <div className="form-group">
              <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '0.05em', marginBottom: 10, display: 'block' }}>MONTHLY YIELD</label>
              <input type="number" className="form-control" style={{ height: 48 }} value={form.monthly_rent} onChange={e => set('monthly_rent', e.target.value)} required />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ height: 56, marginTop: 12, fontSize: '1rem' }}>
            {loading ? 'PROCESSING...' : 'AUTHORIZE CHARTER AGREEMENT'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function AgentDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)

  const loadData = () => {
    if(user?.agent_id) api.get('/my-transactions/').then(r => setData(r.data))
  }

  useEffect(() => { loadData() }, [user?.agent_id])

  if (!user?.agent_id) {
    return (
      <div style={{ padding: '80px 40px', textAlign: 'center', animation: 'fadeIn 1s' }}>
        <div style={{ fontSize: '4rem', marginBottom: 20 }}>🛡️</div>
        <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: '2rem', fontWeight: 800, marginBottom: 16, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>Restricted Access</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500, maxWidth: 500, margin: '0 auto' }}>
          This account has not been authorized as a professional agent. Please contact system governance for credentials.
        </p>
      </div>
    )
  }

  return (
    <Routes>
      <Route index element={<AgentOverview data={data} />} />
      <Route path="sell" element={<MarkSold agentId={user.agent_id} onUpdate={loadData} />} />
      <Route path="rent" element={<MarkRented agentId={user.agent_id} onUpdate={loadData} />} />
      <Route path="transactions" element={<MyAchievements data={data} />} />
      <Route path="*" element={<Navigate to="" replace />} />
    </Routes>
  )
}
