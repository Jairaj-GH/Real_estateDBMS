import { useState, useEffect, useCallback } from 'react'
import api from '../api/axios'

function fmt(n) {
  return Number(n).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
}

const TYPE_ICONS = {
  Apartment: '🏢', House: '🏠', Villa: '🏰', Plot: '🌿', Commercial: '🏪', Studio: '🛏️'
}

function PropertyDetailModal({ property, onClose }) {
  const [detail, setDetail] = useState(null)

  useEffect(() => {
    api.get(`/properties/${property.property_id}/`).then(r => setDetail(r.data))
  }, [property.property_id])

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()} style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)' }}>
      <div className="card" style={{ maxWidth: 800, padding: 0, overflow: 'hidden', animation: 'scaleIn 0.3s cubic-bezier(0.23, 1, 0.32, 1)', background: '#fff' }}>
        {!detail ? (
          <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" style={{ borderTopColor: 'var(--primary)' }} /></div>
        ) : (
          <>
            <div style={{ height: 300, background: 'linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0.6)), url("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800") center/cover', position: 'relative', display: 'flex', alignItems: 'flex-end', padding: '32px 40px' }}>
               <button className="btn" style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.9)', minWidth: 36, height: 36, padding: 0, borderRadius: '50%', color: '#000' }} onClick={onClose}>✕</button>
               <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#fff', letterSpacing: '0.1em', marginBottom: 4, opacity: 0.9 }}>{detail.type?.toUpperCase()} · {detail.current_status?.toUpperCase()}</div>
                  <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: '2.2rem', fontWeight: 800, color: '#fff', margin: 0 }}>{detail.address}</h2>
               </div>
            </div>

            <div style={{ padding: 40 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 24, marginBottom: 40 }}>
                {[
                  { label: 'LOCALITY', value: detail.locality },
                  { label: 'BHK', value: detail.no_of_bedroom },
                  { label: 'SIZE', value: detail.size ? `${detail.size} sq.ft` : null },
                  { label: 'PRICE', value: fmt(detail.listed_price) }
                ].map(i => (
                  <div key={i.label}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '0.05em', marginBottom: 4 }}>{i.label}</div>
                    <div style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 700 }}>{i.value || '—'}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 40 }}>
                 <div>
                    <h3 style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.05em', marginBottom: 12 }}>DESCRIPTION</h3>
                    <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '0.9rem' }}>{detail.description || 'Seamlessly integrated within its prestigious surroundings, this asset offers unrivaled elegance.'}</p>
                 </div>
                 <div>
                    <h3 style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.05em', marginBottom: 12 }}>REPRESENTATIVE</h3>
                    <div className="card" style={{ padding: 20, background: 'var(--bg-soft)', border: '1px solid #eee' }}>
                       <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.9rem' }}>{detail.agent?.name || 'Guwahati Direct'}</div>
                       <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 16 }}>{detail.agent?.contact || 'Support Representative'}</div>
                       <button className="btn btn-primary" style={{ width: '100%', fontSize: '0.75rem' }}>REQUEST BRIEFING</button>
                    </div>
                 </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function PropertyCard({ property, onClick }) {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', background: '#fff' }} onClick={onClick}>
      <div style={{ height: 200, background: 'var(--bg-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', position: 'relative' }}>
         {TYPE_ICONS[property.type] || '🏡'}
         <div style={{ position: 'absolute', top: 16, right: 16, background: 'var(--primary)', color: '#fff', fontSize: '0.6rem', fontWeight: 800, padding: '4px 12px', borderRadius: 99, boxShadow: '0 4px 8px rgba(255, 56, 92, 0.2)' }}>
            {property.current_status.toUpperCase()}
         </div>
      </div>
      <div style={{ padding: '24px 24px 16px' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>{property.locality || property.city}</div>
        <h4 style={{ color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 700, marginBottom: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{property.address}</h4>
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
           <span>{property.no_of_bedroom} BHK</span>
           <span>•</span>
           <span>{property.size} ft²</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
           <span style={{ color: 'var(--text-main)', fontSize: '1.2rem', fontWeight: 800 }}>{fmt(property.listed_price)}</span>
           <button className="btn btn-primary btn-sm" style={{ padding: '8px 16px', fontSize: '0.75rem' }}>DETAILS</button>
        </div>
      </div>
    </div>
  )
}

export default function CustomerDashboard() {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(null)
  const [meta, setMeta] = useState({ cities: [], localities: [], types: [] })
  const [filters, setFilters] = useState({
    city: 'Guwahati', locality: '', type: '', status: 'available',
    min_price: '', max_price: '', no_of_bedroom: '', search: ''
  })
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const PAGE_SIZE = 12

  useEffect(() => {
    api.get('/properties/meta/').then(r => setMeta(r.data))
  }, [])

  const fetchProps = useCallback(() => {
    setLoading(true)
    const params = {}
    Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v })
    params.page = page
    api.get('/properties/', { params })
      .then(r => {
        const d = r.data
        if (d.results) { setProperties(d.results); setTotal(d.count) }
        else { setProperties(d); setTotal(d.length) }
      })
      .finally(() => setLoading(false))
  }, [filters, page])

  useEffect(() => { fetchProps() }, [fetchProps])

  const setF = (k, v) => { setFilters(f => ({ ...f, [k]: v })); setPage(1) }
  const clearFilters = () => { setFilters({ city: '', locality: '', type: '', status: '', min_price: '', max_price: '', no_of_bedroom: '', search: '' }); setPage(1) }

  return (
    <div style={{ animation: 'fadeIn 0.8s ease-out' }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, color: 'var(--text-main)', marginBottom: 8, letterSpacing: '-0.04em' }}>Search Registry</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500 }}>Curating {total} high-density assets for your portfolio.</p>
      </div>

      <div className="card" style={{ marginBottom: 48, background: '#fff', padding: 32, border: '1px solid #ddd' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20 }}>
          <div className="form-group">
            <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '0.05em', marginBottom: 10, display: 'block' }}>WHERE</label>
            <input className="form-control" style={{ height: 48 }} placeholder="Search destinations" value={filters.search} onChange={e => setF('search', e.target.value)} />
          </div>
          <div className="form-group">
            <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '0.05em', marginBottom: 10, display: 'block' }}>BHK</label>
            <select className="form-control" style={{ height: 48 }} value={filters.no_of_bedroom} onChange={e => setF('no_of_bedroom', e.target.value)}>
              <option value="">Any BHK</option>
              {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} BHK</option>)}
            </select>
          </div>
          <div className="form-group">
            <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '0.05em', marginBottom: 10, display: 'block' }}>LOCALITY</label>
            <select className="form-control" style={{ height: 48 }} value={filters.locality} onChange={e => setF('locality', e.target.value)}>
              <option value="">All Regions</option>
              {meta.localities.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '0.05em', marginBottom: 10, display: 'block' }}>MIN BUDGET</label>
            <input type="number" className="form-control" style={{ height: 48 }} placeholder="0" value={filters.min_price} onChange={e => setF('min_price', e.target.value)} />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
             <button className="btn" style={{ height: 48, width: '100%', fontSize: '0.75rem' }} onClick={clearFilters}>RESET FILTERS</button>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" style={{ borderTopColor: 'var(--primary)' }} /></div>
      ) : properties.length === 0 ? (
        <div className="card" style={{ padding: 100, textAlign: 'center', background: '#fff', border: '1px solid #eee' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>🏡</div>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500 }}>No results found in current registry parameters.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 32 }}>
          {properties.map(p => (
            <PropertyCard key={p.property_id} property={p} onClick={() => setSelected(p)} />
          ))}
        </div>
      )}

      {selected && <PropertyDetailModal property={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
