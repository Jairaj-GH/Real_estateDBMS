import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import api from '../api/axios'

function fmt(n) {
  return Number(n).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
}

function OfficeOverview() {
  const [data, setData] = useState({ sales: [], rentals: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get('/sales-report/'), api.get('/rental-report/')])
      .then(([s, r]) => { setData({ sales: s.data, rentals: r.data }); setLoading(false) })
  }, [])

  if (loading) return <div style={{ padding: 100, textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>

  const totalSalesVal = data.sales.reduce((s, a) => s + Number(a.total_revenue), 0)
  const totalRents = data.rentals.reduce((s, a) => s + a.total_rentals, 0)
  const totalAgents = data.sales.length

  return (
    <div style={{ animation: 'fadeIn 0.8s cubic-bezier(0.23, 1, 0.32, 1)' }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, color: '#1c1917', marginBottom: 8 }}>Executive Overview</h1>
        <p style={{ color: '#78350f', fontSize: '1.1rem', fontWeight: 600, fontFamily: 'Instrument Serif, serif', fontStyle: 'italic' }}>Real-time intelligence from the Guwahati elite sector.</p>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 40 }}>
        <div className="stat-card" style={{ background: '#1c1917', color: '#fff' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#a8a29e', letterSpacing: '0.2em', textTransform: 'uppercase' }}>ASSET ADVISORS</div>
          <div className="stat-value" style={{ color: 'var(--peach)' }}>{totalAgents}</div>
          <div style={{ fontSize: '0.8rem', color: '#a8a29e', fontWeight: 600 }}>Active Professional Force</div>
        </div>
        <div className="stat-card">
          <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#78350f', letterSpacing: '0.2em', textTransform: 'uppercase' }}>CAPITAL APPRECIATION</div>
          <div className="stat-value" style={{ color: '#1c1917' }}>{fmt(totalSalesVal)}</div>
          <div style={{ fontSize: '0.8rem', color: '#78716c', fontWeight: 600 }}>Gross Transactional Value</div>
        </div>
        <div className="stat-card">
          <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#3a5a40', letterSpacing: '0.2em', textTransform: 'uppercase' }}>MANAGED ESTATES</div>
          <div className="stat-value" style={{ color: '#3a5a40' }}>{totalRents}</div>
          <div style={{ fontSize: '0.8rem', color: '#78716c', fontWeight: 600 }}>Active Rental Portfolio</div>
        </div>
      </div>

      <div style={{ padding: 'clamp(32px, 8vw, 80px)', background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(30px)', borderRadius: 32, border: '1px solid rgba(255,255,255,0.8)', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: 24 }}>🏛️</div>
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 900, marginBottom: 16 }}>Proprietary Command</h2>
        <p style={{ maxWidth: 700, margin: '0 auto', color: '#78350f', fontSize: '1.1rem', lineHeight: 1.8, fontFamily: 'Instrument Serif, serif', fontStyle: 'italic' }}>
          "Success in high-end real estate is not just about locations, but about the intelligence that drives every decision."
        </p>
      </div>
    </div>
  )
}

function SalesReport() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState({})

  useEffect(() => {
    api.get('/sales-report/').then(r => { setData(r.data); setLoading(false) })
  }, [])

  const toggle = id => setExpanded(e => ({ ...e, [id]: !e[id] }))

  if (loading) return <div style={{ padding: 100, textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>

  return (
    <div style={{ animation: 'fadeIn 0.8s cubic-bezier(0.23, 1, 0.32, 1)' }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, color: '#1c1917', marginBottom: 8 }}>Revenue Intelligence</h1>
        <p style={{ color: '#78350f', fontSize: '1.1rem', fontWeight: 600, fontFamily: 'Instrument Serif, serif', fontStyle: 'italic' }}>High-performance sales portfolio analysis.</p>
      </div>

      {data.map(agent => (
        <div key={agent.agent_id} className="card" style={{ marginBottom: 24, border: 'none', background: '#fff' }}>
           <div className="card-header" style={{ cursor: 'pointer', padding: 'clamp(20px, 4vw, 32px) clamp(24px, 5vw, 48px)', border: 'none' }} onClick={() => toggle(agent.agent_id)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(12px, 3vw, 24px)', flex: 1 }}>
              <div style={{ width: 'clamp(48px, 6vw, 64px)', height: 'clamp(48px, 6vw, 64px)', borderRadius: '50%', background: '#1c1917', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.25rem', color: 'var(--peach)', fontFamily: 'Instrument Serif, serif', flexShrink: 0 }}>
                {agent.agent_name[0]}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 900, fontSize: '1.1rem', color: '#1c1917', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{agent.agent_name}</div>
                <div style={{ fontSize: '0.65rem', color: '#a8a29e', fontWeight: 800, letterSpacing: '0.1em', overflow: 'hidden', textOverflow: 'ellipsis' }}>{agent.email.toUpperCase()}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(16px, 4vw, 40px)', flexShrink: 0 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 900, fontSize: 'clamp(1.1rem, 3vw, 1.5rem)', color: '#1c1917', fontFamily: 'Instrument Serif, serif', fontStyle: 'italic' }}>{fmt(agent.total_revenue)}</div>
                <div style={{ fontSize: '0.6rem', color: '#78350f', fontWeight: 900, letterSpacing: '0.1em' }}>{agent.total_sales} CLOSURES</div>
              </div>
              <div style={{ fontSize: '1rem', color: '#1c1917', opacity: 0.3 }}>{expanded[agent.agent_id] ? '↑' : '↓'}</div>
            </div>
          </div>
          {expanded[agent.agent_id] && (
            <div style={{ padding: '0 clamp(24px, 5vw, 48px) clamp(24px, 5vw, 48px)' }}>
              <div className="table-wrap" style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid #fcfaf7' }}>
                 <table style={{ background: '#fff' }}>
                   <thead>
                     <tr style={{ background: '#fcfaf7' }}>
                       <th style={{ padding: '20px 24px', fontSize: '0.7rem', fontWeight: 900, color: '#a8a29e', letterSpacing: '0.1em' }}>ESTATE</th>
                       <th style={{ padding: '20px 24px', fontSize: '0.7rem', fontWeight: 900, color: '#a8a29e', letterSpacing: '0.1em' }}>ACQUIRER</th>
                       <th style={{ padding: '20px 24px', fontSize: '0.7rem', fontWeight: 900, color: '#a8a29e', letterSpacing: '0.1em' }}>VALUE</th>
                       <th style={{ padding: '20px 24px', fontSize: '0.7rem', fontWeight: 900, color: '#a8a29e', letterSpacing: '0.1em' }}>DOM</th>
                     </tr>
                   </thead>
                   <tbody>
                     {agent.sales.map(s => (
                       <tr key={s.sale_id} style={{ borderBottom: '1px solid #fcfaf7' }}>
                         <td style={{ padding: '20px 24px', fontWeight: 800, color: '#1c1917' }}>{s.property_address}</td>
                         <td style={{ padding: '20px 24px', color: '#57534e', fontWeight: 600 }}>{s.buyer_name}</td>
                         <td style={{ padding: '20px 24px', fontWeight: 900, color: '#1c1917', fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', fontSize: '1.2rem' }}>{fmt(s.final_price)}</td>
                         <td style={{ padding: '20px 24px', color: '#a8a29e', fontWeight: 800 }}>{s.days_on_market || 'PRIVATE'}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function RentalReport() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [locality, setLocality] = useState('')
  const [localities, setLocalities] = useState([])
  const [expanded, setExpanded] = useState({})

  useEffect(() => {
    api.get('/properties/meta/').then(r => setLocalities(r.data.localities))
  }, [])

  useEffect(() => {
    const params = locality ? { locality } : {}
    setLoading(true)
    api.get('/rental-report/', { params }).then(r => { setData(r.data); setLoading(false) })
  }, [locality])

  const toggle = id => setExpanded(e => ({ ...e, [id]: !e[id] }))

  if (loading) return <div style={{ padding: 100, textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>

  return (
    <div style={{ animation: 'fadeIn 0.8s cubic-bezier(0.23, 1, 0.32, 1)' }}>
      <div style={{ marginBottom: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 24 }}>
        <div style={{ flex: '1 1 400px' }}>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, color: '#1c1917', marginBottom: 8 }}>Estate Management</h1>
          <p style={{ color: '#78350f', fontSize: '1.1rem', fontWeight: 600, fontFamily: 'Instrument Serif, serif', fontStyle: 'italic' }}>Rental asset tracking and active lease governance.</p>
        </div>
        <div style={{ width: '100%', maxWidth: 320 }}>
          <label style={{ fontSize: '0.65rem', fontWeight: 900, color: '#78350f', letterSpacing: '0.2em', marginBottom: 12, display: 'block' }}>REGIONAL FILTER</label>
          <select className="form-control" style={{ border: 'none', background: 'rgba(255,255,255,0.6)', borderRadius: 99, height: 56 }} value={locality} onChange={e => setLocality(e.target.value)}>
            <option value="">All Guwahati Localities</option>
            {localities.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>

      {data.map(agent => (
        <div key={agent.agent_id} className="card" style={{ marginBottom: 24, border: 'none', background: '#fff' }}>
           <div className="card-header" style={{ cursor: 'pointer', padding: 'clamp(20px, 4vw, 32px) clamp(24px, 5vw, 48px)', border: 'none' }} onClick={() => toggle(agent.agent_id)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(12px, 3vw, 24px)', flex: 1 }}>
              <div style={{ width: 'clamp(48px, 6vw, 64px)', height: 'clamp(48px, 6vw, 64px)', borderRadius: '50%', background: '#3a5a40', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.25rem', color: '#fff', fontFamily: 'Instrument Serif, serif', flexShrink: 0 }}>
                {agent.agent_name[0]}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 900, fontSize: '1.1rem', color: '#1c1917', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{agent.agent_name}</div>
                <div style={{ fontSize: '0.65rem', color: '#a8a29e', fontWeight: 800, letterSpacing: '0.1em', overflow: 'hidden', textOverflow: 'ellipsis' }}>{agent.email.toUpperCase()}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(16px, 4vw, 40px)', flexShrink: 0 }}>
               <div style={{ background: 'rgba(58, 90, 64, 0.1)', color: '#3a5a40', padding: '12px 20px', borderRadius: 99, fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.1em' }}>
                 {agent.total_rentals} LEASES
               </div>
               <div style={{ fontSize: '1rem', color: '#1c1917', opacity: 0.3 }}>{expanded[agent.agent_id] ? '↑' : '↓'}</div>
            </div>
          </div>
          {expanded[agent.agent_id] && (
             <div style={{ padding: '0 clamp(24px, 5vw, 48px) clamp(24px, 5vw, 48px)' }}>
               <div className="table-wrap" style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid #fcfaf7' }}>
                 <table style={{ background: '#fff' }}>
                   <thead>
                     <tr style={{ background: '#fcfaf7' }}>
                       <th style={{ padding: '20px 24px', fontSize: '0.65rem', fontWeight: 900, color: '#a8a29e', letterSpacing: '0.1em' }}>PROPERTY</th>
                       <th style={{ padding: '20px 24px', fontSize: '0.65rem', fontWeight: 900, color: '#a8a29e', letterSpacing: '0.1em' }}>TENANT</th>
                       <th style={{ padding: '20px 24px', fontSize: '0.65rem', fontWeight: 900, color: '#a8a29e', letterSpacing: '0.1em' }}>YIELD</th>
                       <th style={{ padding: '20px 24px', fontSize: '0.65rem', fontWeight: 900, color: '#a8a29e', letterSpacing: '0.1em' }}>TENURE</th>
                     </tr>
                   </thead>
                   <tbody>
                      {agent.rents.map(r => (
                        <tr key={r.rent_id} style={{ borderBottom: '1px solid #fcfaf7' }}>
                          <td style={{ padding: '20px 24px', fontWeight: 800, color: '#1c1917' }}>{r.property_address}</td>
                          <td style={{ padding: '20px 24px', color: '#57534e', fontWeight: 600 }}>{r.tenant_name}</td>
                          <td style={{ padding: '20px 24px', fontWeight: 900, color: '#3a5a40', fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', fontSize: '1.2rem' }}>{fmt(r.monthly_rent)}<span style={{ fontSize: '0.7rem' }}>/mo</span></td>
                          <td style={{ padding: '20px 24px', color: '#a8a29e', fontWeight: 800, fontSize: '0.8rem' }}>{r.start_date.split('-')[0]} → {r.end_date.split('-')[0]}</td>
                        </tr>
                      ))}
                   </tbody>
                 </table>
               </div>
             </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default function OfficeDashboard() {
  return (
    <Routes>
      <Route index element={<OfficeOverview />} />
      <Route path="sales" element={<SalesReport />} />
      <Route path="rentals" element={<RentalReport />} />
      <Route path="*" element={<Navigate to="" replace />} />
    </Routes>
  )
}
