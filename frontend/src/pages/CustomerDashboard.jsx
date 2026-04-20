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
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="card" style={{ maxWidth: 800, padding: 0, overflow: 'hidden', animation: 'scaleIn 0.3s cubic-bezier(0.23, 1, 0.32, 1)' }}>
        {!detail ? (
          <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" /></div>
        ) : (
          <>
            <div style={{ height: 300, background: 'linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0.8)), url("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800") center/cover', position: 'relative', display: 'flex', alignItems: 'flex-end', padding: 40 }}>
               <button className="btn btn-sm" style={{ position: 'absolute', top: 24, right: 24, background: 'rgba(0,0,0,0.5)', minWidth: 40, padding: 0 }} onClick={onClose}>✕</button>
               <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--accent)', letterSpacing: '0.2em', marginBottom: 8 }}>{detail.type?.toUpperCase()} · {detail.current_status?.toUpperCase()}</div>
                  <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.5rem', color: '#fff', margin: 0 }}>{detail.address}</h2>
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
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 900, letterSpacing: '0.1em', marginBottom: 4 }}>{i.label}</div>
                    <div style={{ fontSize: '1.2rem', color: '#fff', fontWeight: 700, fontFamily: 'Instrument Serif, serif', fontStyle: 'italic' }}>{i.value || '—'}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 40 }}>
                <div>
                   <h3 style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--accent)', letterSpacing: '0.1em', marginBottom: 16 }}>DESCRIPTION</h3>
                   <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '0.95rem' }}>{detail.description || 'No description provided for this exclusive estate.'}</p>
                </div>
                <div>
                   <h3 style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--accent)', letterSpacing: '0.1em', marginBottom: 16 }}>REPRESENTATIVE</h3>
                   <div className="card" style={{ padding: 20, background: 'rgba(255,255,255,0.05)' }}>
                      <div style={{ fontWeight: 800, color: '#fff', fontSize: '0.9rem' }}>{detail.agent?.name || 'Guwahati Direct'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{detail.agent?.contact || 'Access Denied'}</div>
                      <button className="btn btn-primary" style={{ width: '100%', marginTop: 16, fontSize: '0.65rem' }}>REQUEST BRIEFING</button>
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
    <div className="card" style={{ padding: 0, overflow: 'hidden', transition: 'transform 0.3s' }} onClick={onClick}>
      <div style={{ height: 200, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', position: 'relative' }}>
         {TYPE_ICONS[property.type] || '🏡'}
         <div style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(139, 92, 246, 0.8)', color: '#fff', fontSize: '0.6rem', fontWeight: 900, padding: '4px 10px', borderRadius: 99, letterSpacing: '0.1em' }}>
            {property.current_status.toUpperCase()}
         </div>
      </div>
      <div style={{ padding: 32 }}>
        <div style={{ fontSize: '0.6rem', color: 'var(--accent)', fontWeight: 900, letterSpacing: '0.1em', marginBottom: 8 }}>{property.locality?.toUpperCase() || property.city?.toUpperCase()}</div>
        <h4 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: 16, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{property.address}</h4>
        <div style={{ display: 'flex', gap: 16, marginBottom: 24, fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>
           <span>🛏 {property.no_of_bedroom} BHK</span>
           <span>📏 {property.size} ft²</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <span style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 900, fontFamily: 'Instrument Serif, serif', fontStyle: 'italic' }}>{fmt(property.listed_price)}</span>
           <button className="btn btn-sm">VIEW</button>
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
      <div style={{ marginBottom: 60 }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 900, color: '#fff', marginBottom: 12 }}>Search Registry</h1>
        <p style={{ color: 'var(--accent)', fontSize: '1.2rem', fontWeight: 600, fontFamily: 'Instrument Serif, serif', fontStyle: 'italic' }}>Curating {total} high-density assets for your portfolio.</p>
      </div>

      <div className="card" style={{ marginBottom: 60, background: 'rgba(0,0,0,0.3)', padding: 40 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
          <div className="form-group">
            <label style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--accent)', letterSpacing: '0.1em', marginBottom: 12, display: 'block' }}>QUERY</label>
            <input className="form-control" style={{ height: 56 }} placeholder="Address, locality…" value={filters.search} onChange={e => setF('search', e.target.value)} />
          </div>
          <div className="form-group">
            <label style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--accent)', letterSpacing: '0.1em', marginBottom: 12, display: 'block' }}>BHK</label>
            <select className="form-control" style={{ height: 56 }} value={filters.no_of_bedroom} onChange={e => setF('no_of_bedroom', e.target.value)}>
              <option value="">Any</option>
              {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} BHK</option>)}
            </select>
          </div>
          <div className="form-group">
            <label style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--accent)', letterSpacing: '0.1em', marginBottom: 12, display: 'block' }}>LOCALITY</label>
            <select className="form-control" style={{ height: 56 }} value={filters.locality} onChange={e => setF('locality', e.target.value)}>
              <option value="">All Regions</option>
              {meta.localities.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--accent)', letterSpacing: '0.1em', marginBottom: 12, display: 'block' }}>VALUATION (MIN)</label>
            <input type="number" className="form-control" style={{ height: 56 }} placeholder="0" value={filters.min_price} onChange={e => setF('min_price', e.target.value)} />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
             <button className="btn" style={{ height: 56, width: '100%' }} onClick={clearFilters}>RESET FILTERS</button>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" /></div>
      ) : properties.length === 0 ? (
        <div className="card" style={{ padding: 100, textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 24 }}>🌫️</div>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', fontFamily: 'Instrument Serif, serif' }}>No results found in current registry parameters.</p>
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
