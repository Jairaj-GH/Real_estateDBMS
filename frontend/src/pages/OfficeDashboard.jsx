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

  if (loading) return <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" /></div>

  const totalSalesVal = data.sales.reduce((s, a) => s + Number(a.total_revenue), 0)
  const totalRents = data.rentals.reduce((s, a) => s + a.total_rentals, 0)
  const totalAgents = data.sales.length

  return (
    <div style={{ animation: 'fadeIn 0.8s ease-out' }}>
      <div style={{ marginBottom: 60 }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 900, color: '#fff', marginBottom: 12 }}>Executive Overview</h1>
        <p style={{ color: 'var(--accent)', fontSize: '1.2rem', fontWeight: 600, fontFamily: 'Instrument Serif, serif', fontStyle: 'italic' }}>Real-time intelligence from the Guwahati elite sector.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32, marginBottom: 60 }}>
        <div className="card" style={{ padding: 40, background: 'rgba(139, 92, 246, 0.15)' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--accent)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 16 }}>ASSET ADVISORS</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff', fontFamily: 'Instrument Serif, serif', fontStyle: 'italic' }}>{totalAgents}</div>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Active Professional Force</div>
        </div>
        <div className="card" style={{ padding: 40 }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 16 }}>CAPITAL APPRECIATION</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff', fontFamily: 'Instrument Serif, serif', fontStyle: 'italic' }}>{fmt(totalSalesVal)}</div>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Gross Transactional Value</div>
        </div>
        <div className="card" style={{ padding: 40 }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 16 }}>MANAGED ESTATES</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff', fontFamily: 'Instrument Serif, serif', fontStyle: 'italic' }}>{totalRents}</div>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Active Rental Portfolio</div>
        </div>
      </div>

      <div className="card" style={{ padding: 'clamp(32px, 8vw, 80px)', background: 'rgba(0,0,0,0.4)', color: '#fff', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: 24 }}>🏛️</div>
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 900, marginBottom: 16 }}>Proprietary Command</h2>
        <p style={{ maxWidth: 700, margin: '0 auto', color: 'var(--accent)', fontSize: '1.2rem', lineHeight: 1.8, fontFamily: 'Instrument Serif, serif', fontStyle: 'italic' }}>
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

  if (loading) return <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" /></div>

  return (
    <div style={{ animation: 'fadeIn 0.8s ease-out' }}>
      <div style={{ marginBottom: 60 }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 900, color: '#fff', marginBottom: 12 }}>Revenue Intelligence</h1>
        <p style={{ color: 'var(--accent)', fontSize: '1.2rem', fontWeight: 600, fontFamily: 'Instrument Serif, serif', fontStyle: 'italic' }}>High-performance sales portfolio analysis.</p>
      </div>

      {data.map(agent => (
        <div key={agent.agent_id} className="card" style={{ marginBottom: 32, padding: 0 }}>
           <div style={{ cursor: 'pointer', padding: 40, background: 'rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={() => toggle(agent.agent_id)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.5rem', color: 'var(--accent)', fontFamily: 'Instrument Serif, serif' }}>
                {agent.agent_name[0]}
              </div>
              <div>
                <div style={{ fontWeight: 900, fontSize: '1.2rem', color: '#fff' }}>{agent.agent_name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800 }}>{agent.email.toUpperCase()}</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 900, fontSize: '1.5rem', color: '#fff', fontFamily: 'Instrument Serif, serif', fontStyle: 'italic' }}>{fmt(agent.total_revenue)}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--accent)', fontWeight: 900 }}>{agent.total_sales} CLOSURES</div>
            </div>
          </div>
          {expanded[agent.agent_id] && (
            <div style={{ padding: 40, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="table-wrap">
                 <table>
                   <thead>
                     <tr>
                       <th>ESTATE</th>
                       <th>ACQUIRER</th>
                       <th>VALUE</th>
                       <th>DOM</th>
                     </tr>
                   </thead>
                   <tbody>
                     {agent.sales.map(s => (
                       <tr key={s.property}>
                         <td style={{ color: '#fff', fontWeight: 800 }}>{s.property_address}</td>
                         <td style={{ color: 'rgba(255,255,255,0.7)' }}>{s.buyer_name}</td>
                         <td style={{ color: '#fff', fontWeight: 900, fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', fontSize: '1.4rem' }}>{fmt(s.final_price)}</td>
                         <td style={{ color: 'var(--text-muted)' }}>{s.days_on_market || 'PRIVATE'}</td>
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

  if (loading) return <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" /></div>

  return (
    <div style={{ animation: 'fadeIn 0.8s ease-out' }}>
      <div style={{ marginBottom: 60, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 900, color: '#fff', marginBottom: 12 }}>Estate Management</h1>
          <p style={{ color: 'var(--accent)', fontSize: '1.2rem', fontWeight: 600, fontFamily: 'Instrument Serif, serif', fontStyle: 'italic' }}>Rental asset tracking and active lease governance.</p>
        </div>
        <div style={{ width: '100%', maxWidth: 320 }}>
          <label style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--accent)', letterSpacing: '0.2em', marginBottom: 12, display: 'block' }}>REGIONAL FILTER</label>
          <select className="form-control" style={{ height: 56, background: 'rgba(255,255,255,0.05)' }} value={locality} onChange={e => setLocality(e.target.value)}>
            <option value="">All Guwahati Localities</option>
            {localities.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>

      {data.map(agent => (
        <div key={agent.agent_id} className="card" style={{ marginBottom: 32, padding: 0 }}>
           <div style={{ cursor: 'pointer', padding: 40, background: 'rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={() => toggle(agent.agent_id)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.5rem', color: 'var(--accent)', fontFamily: 'Instrument Serif, serif' }}>
                {agent.agent_name[0]}
              </div>
              <div>
                <div style={{ fontWeight: 900, fontSize: '1.2rem', color: '#fff' }}>{agent.agent_name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800 }}>{agent.email.toUpperCase()}</div>
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '12px 24px', borderRadius: 99, fontSize: '0.7rem', fontWeight: 900 }}>
               {agent.total_rentals} LEASES
            </div>
          </div>
          {expanded[agent.agent_id] && (
             <div style={{ padding: 40, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
               <div className="table-wrap">
                 <table>
                   <thead>
                     <tr>
                       <th>PROPERTY</th>
                       <th>TENANT</th>
                       <th>YIELD</th>
                       <th>TENURE</th>
                     </tr>
                   </thead>
                   <tbody>
                      {agent.rents.map(r => (
                        <tr key={r.id}>
                          <td style={{ color: '#fff', fontWeight: 800 }}>{r.property_address}</td>
                          <td style={{ color: 'rgba(255,255,255,0.7)' }}>{r.tenant_name}</td>
                          <td style={{ color: '#fff', fontWeight: 900, fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', fontSize: '1.4rem' }}>{fmt(r.monthly_rent)}<span style={{ fontSize: '0.7rem' }}>/mo</span></td>
                          <td style={{ color: 'var(--text-muted)' }}>{r.start_date.split('-')[0]} → {r.end_date.split('-')[0]}</td>
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
