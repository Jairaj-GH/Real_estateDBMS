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

  if (loading) return <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" style={{ borderTopColor: 'var(--primary)' }} /></div>

  const totalSalesVal = data.sales.reduce((s, a) => s + Number(a.total_revenue), 0)
  const totalRents = data.rentals.reduce((s, a) => s + a.total_rentals, 0)
  const totalAgents = data.sales.length

  return (
    <div style={{ animation: 'fadeIn 0.8s ease-out' }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, color: 'var(--text-main)', marginBottom: 8, letterSpacing: '-0.04em' }}>Executive Overview</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500 }}>Real-time intelligence from the Guwahati elite sector.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 48 }}>
        <div className="card" style={{ padding: 40 }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>ASSET ADVISORS</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>{totalAgents}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Active Professional Force</div>
        </div>
        <div className="card" style={{ padding: 40 }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>CAPITAL APPRECIATION</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>{fmt(totalSalesVal)}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Gross Transactional Value</div>
        </div>
        <div className="card" style={{ padding: 40 }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>MANAGED ESTATES</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>{totalRents}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Active Rental Portfolio</div>
        </div>
      </div>

      <div className="card" style={{ padding: '48px',  color: 'var(--text-main)', textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 20 }}>🏛️</div>
        <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.5rem', fontWeight: 800, marginBottom: 16 }}>Proprietary Command</h2>
        <p style={{ maxWidth: 700, margin: '0 auto', color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.6, fontWeight: 500 }}>
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

  if (loading) return <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" style={{ borderTopColor: 'var(--primary)' }} /></div>

  return (
    <div style={{ animation: 'fadeIn 0.8s ease-out' }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, color: 'var(--text-main)', marginBottom: 8, letterSpacing: '-0.04em' }}>Revenue Intelligence</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500 }}>High-performance sales portfolio analysis.</p>
      </div>

      {data.map(agent => (
        <div key={agent.agent_id} className="card" style={{ marginBottom: 24, padding: 0 }}>
           <div style={{ cursor: 'pointer', padding: '32px 40px',  display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={() => toggle(agent.agent_id)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem', color: '#fff' }}>
                {agent.agent_name[0]}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-main)' }}>{agent.agent_name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>{agent.email.toUpperCase()}</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>{fmt(agent.total_revenue)}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 800 }}>{agent.total_sales} CLOSURES</div>
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
                          <td style={{ color: 'var(--text-main)', fontWeight: 700 }}>{s.property_address}</td>
                          <td style={{ color: 'var(--text-muted)' }}>{s.buyer_name}</td>
                          <td style={{ color: 'var(--text-main)', fontWeight: 800, fontSize: '1.1rem' }}>{fmt(s.final_price)}</td>
                          <td style={{ color: 'var(--text-muted)' }}>{s.days_on_market || '—'}</td>
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

  if (loading) return <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" style={{ borderTopColor: 'var(--primary)' }} /></div>

  return (
    <div style={{ animation: 'fadeIn 0.8s ease-out' }}>
      <div style={{ marginBottom: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 20 }}>
        <div>
          <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, color: 'var(--text-main)', marginBottom: 8, letterSpacing: '-0.04em' }}>Estate Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500 }}>Rental asset tracking and active lease governance.</p>
        </div>
        <div style={{ width: '100%', maxWidth: 280 }}>
          <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '0.05em', marginBottom: 10, display: 'block' }}>LOCALITY</label>
          <select className="form-control" style={{ height: 48 }} value={locality} onChange={e => setLocality(e.target.value)}>
            <option value="">All Regions</option>
            {localities.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>

      {data.map(agent => (
        <div key={agent.agent_id} className="card" style={{ marginBottom: 24, padding: 0 }}>
           <div style={{ cursor: 'pointer', padding: '32px 40px',  display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={() => toggle(agent.agent_id)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem', color: '#fff' }}>
                {agent.agent_name[0]}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-main)' }}>{agent.agent_name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>{agent.email.toUpperCase()}</div>
              </div>
            </div>
            <div style={{ background: 'var(--primary)', color: '#fff', padding: '8px 16px', borderRadius: 12, fontSize: '0.7rem', fontWeight: 800 }}>
               {agent.total_rentals} LEASES
            </div>
          </div>
          {expanded[agent.agent_id] && (
             <div style={{ padding: 40, borderTop: '1px solid #eee' }}>
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
                           <td style={{ color: 'var(--text-main)', fontWeight: 700 }}>{r.property_address}</td>
                           <td style={{ color: 'var(--text-muted)' }}>{r.tenant_name}</td>
                           <td style={{ color: 'var(--text-main)', fontWeight: 800, fontSize: '1.1rem' }}>{fmt(r.monthly_rent)}<span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>/mo</span></td>
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
