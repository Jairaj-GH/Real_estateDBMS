import React, { useState, useEffect, useCallback, useMemo } from 'react'
import api from '../api/axios'
import p1 from '../assets/p1.png'
import p2 from '../assets/p2.png'
import p3 from '../assets/p3.png'

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

  if (!detail) return (
    <div className="modal-overlay" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)' }}>
      <div className="spinner" />
    </div>
  )

  return (
    <div className="modal-overlay" onClick={onClose} style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(20px)' }}>
      <div className="modal card" onClick={e => e.stopPropagation()} style={{ maxWidth: 1000, borderRadius: 40 }}>
        <div className="modal-header" style={{ padding: '32px 48px', borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'transparent' }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', margin: 0, color: '#fff' }}>Estate Analysis</h2>
          <button className="btn" onClick={onClose} style={{ padding: 12, minWidth: 44, height: 44 }}>✕</button>
        </div>
        <div className="modal-body" style={{ padding: '48px' }}>
          <div className="detail-grid">
            <div style={{ borderRadius: 24, overflow: 'hidden', height: 400, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <img 
                src={p1} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                alt="Property"
              />
            </div>
            <div>
              <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '3rem', fontWeight: 900, marginBottom: 16, color: '#fff' }}>{detail.address}</h1>
              <p style={{ color: 'var(--accent)', fontSize: '1.2rem', fontWeight: 600, fontStyle: 'italic', marginBottom: 32 }}>{detail.locality?.toUpperCase()} · {detail.city?.toUpperCase()}</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 40 }}>
                <div style={{ padding: 24, background: 'rgba(255,255,255,0.05)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 8 }}>VALUATION</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', color: '#fff' }}>{fmt(detail.listed_price)}</div>
                </div>
                <div style={{ padding: 24, background: 'rgba(255,255,255,0.05)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 8 }}>DIMENSIONS</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff' }}>{detail.size} <span style={{ fontSize: '0.8rem' }}>SQFT</span></div>
                </div>
              </div>

              <div style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
                {detail.description || 'No additional description provided for this elite asset.'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const PropertyCard = React.memo(({ property, onClick }) => {
  const images = [p1, p2, p3]
  const displayImage = images[property.property_id % images.length]

  return (
    <div className="card" onClick={onClick} style={{ 
      padding: 16, 
      cursor: 'pointer',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ 
        height: 280, 
        background: 'rgba(255,255,255,0.05)', 
        borderRadius: 24, 
        position: 'relative',
        overflow: 'hidden'
      }}>
        <img 
          src={displayImage} 
          alt={property.address}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)' }}
        />
        <div style={{ position: 'absolute', top: 24, right: 24, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: '#fff' }}>
          {TYPE_ICONS[property.type] || '🏡'}
        </div>
        <div style={{ position: 'absolute', bottom: 24, left: 24, background: property.current_status === 'available' ? '#4ade80' : '#f87171', color: '#000', padding: '8px 20px', borderRadius: 99, fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {property.current_status}
        </div>
      </div>
      <div style={{ padding: '24px 12px 12px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h4 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', fontWeight: 900, marginBottom: 4, color: '#fff' }}>{property.address}</h4>
        <p style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 700, letterSpacing: '0.05em', marginBottom: 20 }}>{property.locality?.toUpperCase() || 'GUWAHATI'}</p>
        
        <div style={{ display: 'flex', gap: 16, marginBottom: 24, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 20, marginTop: 'auto' }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)' }}>{property.no_of_bedroom || '3'} BED</span>
          <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)' }}>•</span>
          <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)' }}>{property.size || '2400'} SQFT</span>
          <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)' }}>•</span>
          <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)' }}>{(property.type || 'Asset').toUpperCase()}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '1.4rem', fontWeight: 900, fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', color: '#fff' }}>{property.listed_price ? fmt(property.listed_price) : 'Price Request'}</span>
          <div className="btn" style={{ width: 44, height: 44, padding: 0, borderRadius: '50%', background: '#fff', color: '#000' }}>→</div>
        </div>
      </div>
    </div>
  )
})

export default function Marketplace() {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(null)
  const [meta, setMeta] = useState({ cities: [], localities: [], types: [] })
  const [filters, setFilters] = useState({
    city: 'Guwahati', locality: '', type: '', status: 'available',
    min_price: '', max_price: '', no_of_bedroom: '', search: ''
  })
  const [searchTerm, setSearchTerm] = useState(filters.search)

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(f => ({ ...f, search: searchTerm }))
      setPage(1)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const setF = (k, v) => { setFilters(f => ({ ...f, [k]: v })); setPage(1) }
  const clearFilters = () => { 
    setSearchTerm('')
    setFilters({ city: '', locality: '', type: '', status: 'available', min_price: '', max_price: '', no_of_bedroom: '', search: '' })
    setPage(1) 
  }
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

  const propertyGrid = useMemo(() => {
    if (loading) return null
    if (properties.length === 0) return (
      <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
        <div style={{ fontSize: '4rem', marginBottom: 24 }}>🏜️</div>
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.5rem', fontWeight: 900, marginBottom: 16 }}>No Assets Found</h2>
        <p style={{ color: '#78350f', fontSize: '1.2rem', fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', maxWidth: 500, margin: '0 auto' }}>
          We couldn't find any properties matching your current criteria.
        </p>
        <button className="btn btn-primary" style={{ marginTop: 40 }} onClick={() => setFilters({
          city: 'Guwahati', locality: '', type: '', status: 'available',
          min_price: '', max_price: '', no_of_bedroom: '', search: ''
        })}>RESET FILTERS</button>
      </div>
    )

    return properties.map(p => (
      <PropertyCard key={p.property_id} property={p} onClick={() => setSelected(p)} />
    ))
  }, [properties, loading])

  return (
    <div style={{ animation: 'fadeIn 0.8s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 60, flexWrap: 'wrap', gap: 32 }}>
        <div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 900, color: '#1c1917', lineHeight: 1, marginBottom: 12 }}>Elite Marketplace</h1>
          <p style={{ color: '#78350f', fontSize: '1.2rem', fontWeight: 600, fontFamily: 'Instrument Serif, serif', fontStyle: 'italic' }}>Curated collection of prestigious real estate assets.</p>
        </div>
        <div style={{ 
          background: 'rgba(58, 90, 64, 0.1)', 
          color: '#3a5a40', 
          padding: '12px 24px', 
          borderRadius: 99, 
          fontSize: '0.7rem', 
          fontWeight: 900, 
          letterSpacing: '0.1em',
          border: '1px solid rgba(58, 90, 64, 0.2)'
        }}>
          ● LIVE SYSTEM
        </div>
      </div>

      <div className="card" style={{ padding: 'clamp(24px, 4vw, 40px)', marginBottom: 60, background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.5)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24, alignItems: 'flex-end' }}>
          <div className="form-group">
            <label style={{ fontSize: '0.6rem', fontWeight: 900, color: '#a8a29e', letterSpacing: '0.2em', marginBottom: 12, display: 'block' }}>SEARCH QUERY</label>
            <input
              type="text"
              className="form-control"
              style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.05)', height: 52, borderRadius: 12 }}
              placeholder="Locality, address..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label style={{ fontSize: '0.6rem', fontWeight: 900, color: '#a8a29e', letterSpacing: '0.2em', marginBottom: 12, display: 'block' }}>PROPERTY TYPE</label>
            <select
              className="form-control"
              style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.05)', height: 52, borderRadius: 12 }}
              value={filters.type}
              onChange={e => setFilters({ ...filters, type: e.target.value })}
            >
              <option value="">All Types</option>
              {meta.types.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label style={{ fontSize: '0.6rem', fontWeight: 900, color: '#a8a29e', letterSpacing: '0.2em', marginBottom: 12, display: 'block' }}>BEDROOMS</label>
            <select
              className="form-control"
              style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.05)', height: 52, borderRadius: 12 }}
              value={filters.no_of_bedroom}
              onChange={e => setFilters({ ...filters, no_of_bedroom: e.target.value })}
            >
              <option value="">Any</option>
              {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} BHK</option>)}
            </select>
          </div>
          <div className="form-group">
            <label style={{ fontSize: '0.6rem', fontWeight: 900, color: '#a8a29e', letterSpacing: '0.2em', marginBottom: 12, display: 'block' }}>MAXIMUM BUDGET</label>
            <input
              type="number"
              className="form-control"
              style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.05)', height: 52, borderRadius: 12 }}
              placeholder="Any price"
              value={filters.max_price}
              onChange={e => setFilters({ ...filters, max_price: e.target.value })}
            />
          </div>
          <button className="btn btn-primary" style={{ height: 52, borderRadius: 12, fontSize: '0.7rem' }}>DISCOVER RESULTS</button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 100, textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto' }} />
          <p style={{ marginTop: 24, fontSize: '0.8rem', fontWeight: 900, color: '#78350f', letterSpacing: '0.1em' }}>SYNCHRONIZING ASSETS…</p>
        </div>
      ) : (
        <div className="property-grid">
          {propertyGrid}
        </div>
      )}

      {selected && <PropertyDetailModal property={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
