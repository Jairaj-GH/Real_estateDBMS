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
      <div style={{ marginBottom: 'clamp(32px, 8vw, 60px)' }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2.5rem, 6vw, 3.5rem)', fontWeight: 900, color: '#1c1917', marginBottom: 8 }}>Agent Intelligence</h1>
        <p style={{ color: '#78350f', fontSize: 'clamp(1rem, 2.5vw, 1.1rem)', fontWeight: 600, fontFamily: 'Instrument Serif, serif', fontStyle: 'italic' }}>Your personal performance metrics and daily briefing.</p>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32, marginBottom: 60 }}>
        <div className="stat-card" style={{ background: 'var(--primary)', color: '#fff' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>TOTAL CLOSURES</div>
          <div className="stat-value">{data?.sales.length || 0}</div>
          <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>High Conversion Ratio</div>
        </div>
        <div className="stat-card">
          <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#78350f', letterSpacing: '0.2em', textTransform: 'uppercase' }}>MONTHLY TARGET</div>
          <div className="stat-value" style={{ color: '#1c1917' }}>75%</div>
          <div style={{ fontSize: '0.85rem', color: '#78716c', fontWeight: 600 }}>Performance Benchmark</div>
        </div>
        <div className="stat-card">
          <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#3a5a40', letterSpacing: '0.2em', textTransform: 'uppercase' }}>MANAGED PORTFOLIO</div>
          <div className="stat-value" style={{ color: '#3a5a40' }}>{data?.rents.length || 0}</div>
          <div style={{ fontSize: '0.85rem', color: '#78716c', fontWeight: 600 }}>Active Asset Tracking</div>
        </div>
      </div>

      <div style={{ padding: 'clamp(32px, 8vw, 80px)', background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(30px)', borderRadius: 32, border: '1px solid rgba(255,255,255,0.8)', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: 24 }}>📈</div>
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 900, marginBottom: 16 }}>Productivity Briefing</h2>
        <p style={{ maxWidth: 700, margin: '0 auto', color: '#78350f', fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', lineHeight: 1.8, fontFamily: 'Instrument Serif, serif', fontStyle: 'italic' }}>
          "Your current trajectory is outpacing market averages. Continue to focus on high-yield closures this quarter."
        </p>
      </div>
    </div>
  )
}

function MyAchievements({ data }) {
  if (!data) return <div style={{ padding: 100, textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
  return (
    <div style={{ animation: 'fadeIn 0.8s ease-out' }}>
      <div style={{ marginBottom: 'clamp(32px, 8vw, 60px)' }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2.5rem, 6vw, 3.5rem)', fontWeight: 900, color: '#1c1917', marginBottom: 8 }}>Achievement Portfolio</h1>
        <p style={{ color: '#78350f', fontSize: 'clamp(1rem, 2.5vw, 1.1rem)', fontWeight: 600, fontFamily: 'Instrument Serif, serif', fontStyle: 'italic' }}>A detailed historical record of your successful mandates.</p>
      </div>

      <div className="card" style={{ border: 'none', background: '#fff', borderRadius: 32, overflow: 'hidden' }}>
         <div className="card-header" style={{ padding: '32px 48px', borderBottom: '1px solid #fcfaf7' }}>
            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', fontWeight: 900 }}>Sales Transactions</h3>
         </div>
         <div className="table-wrap">
           {data.sales.length === 0 ? <div className="empty-state" style={{ padding: 80, textAlign: 'center' }}><p style={{ fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', fontSize: '1.2rem' }}>No sales records found in your portfolio.</p></div> : (
             <table style={{ margin: 0 }}>
               <thead>
                 <tr style={{ background: '#fcfaf7' }}>
                   <th style={{ padding: '24px 32px', fontSize: '0.7rem', fontWeight: 900, color: '#a8a29e', letterSpacing: '0.1em' }}>ESTATE</th>
                   <th style={{ padding: '24px 32px', fontSize: '0.7rem', fontWeight: 900, color: '#a8a29e', letterSpacing: '0.1em' }}>ACQUIRER</th>
                   <th style={{ padding: '24px 32px', fontSize: '0.7rem', fontWeight: 900, color: '#a8a29e', letterSpacing: '0.1em' }}>DATE</th>
                   <th style={{ padding: '24px 32px', fontSize: '0.7rem', fontWeight: 900, color: '#a8a29e', letterSpacing: '0.1em' }}>VALUE</th>
                 </tr>
               </thead>
               <tbody>
                 {data.sales.map(s => (
                   <tr key={s.sale_id} style={{ borderBottom: '1px solid #fcfaf7' }}>
                     <td style={{ padding: '24px 32px', fontWeight: 900, color: '#1c1917' }}>{s.property_address}</td>
                     <td style={{ padding: '24px 32px', color: '#57534e', fontWeight: 600 }}>{s.buyer_name}</td>
                     <td style={{ padding: '24px 32px', color: '#a8a29e', fontWeight: 800 }}>{s.sale_date}</td>
                     <td style={{ padding: '24px 32px', fontWeight: 900, color: '#1c1917', fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', fontSize: '1.4rem' }}>{fmt(s.final_price)}</td>
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
      setMsg({ type: 'error', text: e.response?.data?.email?.[0] || 'Verification failed. Please review credentials.' })
    }
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setMsg(null)
    try {
      await api.post('/sales/', { ...form, agent: agentId })
      setMsg({ type: 'success', text: '🏺 Mandate successfully executed and recorded.' })
      setForm({ property: '', buyer: '', sale_date: new Date().toISOString().split('T')[0], final_price: '', days_on_market: '' })
      onUpdate?.()
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.error || 'Execution failed. Record rejected.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ animation: 'fadeIn 0.8s cubic-bezier(0.23, 1, 0.32, 1)' }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, color: '#1c1917', marginBottom: 8 }}>Record Mandate</h1>
        <p style={{ color: '#78350f', fontSize: '1.1rem', fontWeight: 600, fontFamily: 'Instrument Serif, serif', fontStyle: 'italic' }}>Finalize a property sale and record the transaction value.</p>
      </div>

      <div className="card" style={{ border: 'none', background: '#fff', borderRadius: 32, padding: 'clamp(24px, 5vw, 48px)' }}>
        {msg && <div className={`alert alert-${msg.type === 'success' ? 'success' : 'error'}`} style={{ marginBottom: 40, borderRadius: 16 }}>{msg.text}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 32 }}>
          <div className="form-group">
            <label style={{ fontSize: '0.65rem', fontWeight: 900, color: '#78350f', letterSpacing: '0.2em', marginBottom: 12, display: 'block' }}>SUBJECT ESTATE</label>
            <select className="form-control" style={{ border: 'none', background: '#fcfaf7', height: 64, borderRadius: 16 }} value={form.property} onChange={e => {
               const p = properties.find(x => x.property_id == e.target.value);
               set('property', e.target.value);
               if(p) set('final_price', p.listed_price);
            }} required>
              <option value="">Select available property...</option>
              {properties.map(p => <option key={p.property_id} value={p.property_id}>{p.address} — {fmt(p.listed_price)}</option>)}
            </select>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
              <label style={{ fontSize: '0.65rem', fontWeight: 900, color: '#78350f', letterSpacing: '0.2em', margin: 0 }}>ACQUIRER DETAILS</label>
              <button type="button" className="btn" style={{ background: 'none', color: 'var(--primary)', fontWeight: 800, fontSize: '0.7rem', padding: 0 }} onClick={() => setNewBuyer(n => ({ ...n, show: !n.show }))}>
                {newBuyer.show ? 'Return to Directory' : 'Register New Acquirer'}
              </button>
            </div>
            {!newBuyer.show ? (
              <select className="form-control" style={{ border: 'none', background: '#fcfaf7', height: 64, borderRadius: 16 }} value={form.buyer} onChange={e => set('buyer', e.target.value)} required>
                <option value="">Select from directory...</option>
                {buyers.map(b => <option key={b.buyer_id} value={b.buyer_id}>{b.name} — {b.email}</option>)}
              </select>
            ) : (
              <div style={{ padding: 'clamp(20px, 4vw, 40px)', background: '#fcfaf7', borderRadius: 24, border: '1px solid rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24, marginBottom: 24 }}>
                  <input className="form-control" style={{ border: 'none', background: '#fff' }} placeholder="Legal Full Name" value={newBuyer.name} onChange={e => setNewBuyer(n => ({ ...n, name: e.target.value }))} />
                  <input className="form-control" style={{ border: 'none', background: '#fff' }} placeholder="Contact Vector" value={newBuyer.contact} onChange={e => setNewBuyer(n => ({ ...n, contact: e.target.value }))} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24, marginBottom: 32 }}>
                  <input className="form-control" style={{ border: 'none', background: '#fff' }} placeholder="Electronic Mail" value={newBuyer.email} onChange={e => setNewBuyer(n => ({ ...n, email: e.target.value }))} />
                  <input className="form-control" style={{ border: 'none', background: '#fff' }} placeholder="Allocated Capital" type="number" value={newBuyer.budget} onChange={e => setNewBuyer(n => ({ ...n, budget: e.target.value }))} />
                </div>
                <button type="button" className="btn btn-primary" onClick={addBuyer}>Authorize Registration</button>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 24 }}>
            <div className="form-group">
              <label style={{ fontSize: '0.65rem', fontWeight: 900, color: '#78350f', letterSpacing: '0.2em', marginBottom: 12, display: 'block' }}>CLOSURE DATE</label>
              <input type="date" className="form-control" style={{ border: 'none', background: '#fcfaf7', height: 64, borderRadius: 16 }} value={form.sale_date} onChange={e => set('sale_date', e.target.value)} required />
            </div>
            <div className="form-group">
              <label style={{ fontSize: '0.65rem', fontWeight: 900, color: '#78350f', letterSpacing: '0.2em', marginBottom: 12, display: 'block' }}>TRANSACTIONAL VALUE</label>
              <input type="number" className="form-control" style={{ border: 'none', background: '#fcfaf7', height: 64, borderRadius: 16 }} value={form.final_price} onChange={e => set('final_price', e.target.value)} required />
            </div>
            <div className="form-group">
              <label style={{ fontSize: '0.65rem', fontWeight: 900, color: '#78350f', letterSpacing: '0.2em', marginBottom: 12, display: 'block' }}>MARKET EXPOSURE</label>
              <input type="number" className="form-control" style={{ border: 'none', background: '#fcfaf7', height: 64, borderRadius: 16 }} placeholder="Days" value={form.days_on_market} onChange={e => set('days_on_market', e.target.value)} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ height: 72, fontSize: '1rem', marginTop: 16 }}>
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
      setMsg({ type: 'success', text: '🔑 Charter agreement successfully secured.' })
      setForm({ property: '', tenant: '', start_date: new Date().toISOString().split('T')[0], end_date: '', monthly_rent: '' })
      onUpdate?.()
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.error || 'Validation failed. Charter rejected.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ animation: 'fadeIn 0.8s cubic-bezier(0.23, 1, 0.32, 1)' }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, color: '#1c1917', marginBottom: 8 }}>Secure Charter</h1>
        <p style={{ color: '#78350f', fontSize: '1.1rem', fontWeight: 600, fontFamily: 'Instrument Serif, serif', fontStyle: 'italic' }}>Establish a new rental agreement for managed assets.</p>
      </div>

      <div className="card" style={{ border: 'none', background: '#fff', borderRadius: 32, padding: 'clamp(24px, 5vw, 48px)' }}>
        {msg && <div className={`alert alert-${msg.type === 'success' ? 'success' : 'error'}`} style={{ marginBottom: 40, borderRadius: 16 }}>{msg.text}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 32 }}>
           <div className="form-group">
            <label style={{ fontSize: '0.65rem', fontWeight: 900, color: '#3a5a40', letterSpacing: '0.2em', marginBottom: 12, display: 'block' }}>TARGET ESTATE</label>
            <select className="form-control" style={{ border: 'none', background: '#fcfaf7', height: 64, borderRadius: 16 }} value={form.property} onChange={e => set('property', e.target.value)} required>
              <option value="">Select estate for charter...</option>
              {properties.map(p => <option key={p.property_id} value={p.property_id}>{p.address}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label style={{ fontSize: '0.65rem', fontWeight: 900, color: '#3a5a40', letterSpacing: '0.2em', marginBottom: 12, display: 'block' }}>TENANT IDENTITY</label>
            <select className="form-control" style={{ border: 'none', background: '#fcfaf7', height: 64, borderRadius: 16 }} value={form.tenant} onChange={e => set('tenant', e.target.value)} required>
              <option value="">Authorize tenant selection...</option>
              {tenants.map(t => <option key={t.tenant_id} value={t.tenant_id}>{t.name} — {t.email}</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 24 }}>
            <div className="form-group">
              <label style={{ fontSize: '0.65rem', fontWeight: 900, color: '#3a5a40', letterSpacing: '0.2em', marginBottom: 12, display: 'block' }}>COMMENCEMENT</label>
              <input type="date" className="form-control" style={{ border: 'none', background: '#fcfaf7', height: 64, borderRadius: 16 }} value={form.start_date} onChange={e => set('start_date', e.target.value)} required />
            </div>
            <div className="form-group">
              <label style={{ fontSize: '0.65rem', fontWeight: 900, color: '#3a5a40', letterSpacing: '0.2em', marginBottom: 12, display: 'block' }}>EXPIRATION</label>
              <input type="date" className="form-control" style={{ border: 'none', background: '#fcfaf7', height: 64, borderRadius: 16 }} value={form.end_date} onChange={e => set('end_date', e.target.value)} required />
            </div>
            <div className="form-group">
              <label style={{ fontSize: '0.65rem', fontWeight: 900, color: '#3a5a40', letterSpacing: '0.2em', marginBottom: 12, display: 'block' }}>MONTHLY YIELD</label>
              <input type="number" className="form-control" style={{ border: 'none', background: '#fcfaf7', height: 64, borderRadius: 16 }} value={form.monthly_rent} onChange={e => set('monthly_rent', e.target.value)} required />
            </div>
          </div>
          <button type="submit" className="btn" style={{ height: 72, fontSize: '1rem', marginTop: 16, background: '#3a5a40', color: '#fff' }}>
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
      <div style={{ padding: 100, textAlign: 'center', animation: 'fadeIn 1s' }}>
        <div style={{ fontSize: '5rem', marginBottom: 24 }}>🛡️</div>
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.5rem', fontWeight: 900, marginBottom: 16 }}>Restricted Access</h2>
        <p style={{ color: '#78350f', fontSize: '1.2rem', fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', maxWidth: 500, margin: '0 auto' }}>
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
