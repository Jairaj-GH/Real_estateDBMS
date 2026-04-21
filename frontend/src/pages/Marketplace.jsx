import React, { useState, useEffect, useCallback, useMemo } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
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
  const [inquiryType, setInquiryType] = useState(null) // 'buy' or 'rent'
  const [msg, setMsg] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    api.get(`/properties/${property.property_id}/`).then(r => setDetail(r.data))
  }, [property.property_id])

  const submitInquiry = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    const formData = new FormData(e.target)
    const payload = {
      property: property.property_id,
      inquiry_type: inquiryType,
      customer_name: formData.get('name'),
      customer_email: formData.get('email'),
      customer_phone: formData.get('phone'),
      message: formData.get('message'),
      start_date: formData.get('start_date'),
      end_date: formData.get('end_date'),
      monthly_rent: formData.get('monthly_rent_val'),
    }
    try {
      await api.post('/inquiries/', payload)
      setMsg('Your interest has been successfully recorded. The agent will contact you shortly.')
      setTimeout(() => { setInquiryType(null); setMsg(null); onClose() }, 3000)
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.detail || 'Failed to submit interest. Please try again.'
      setMsg(errorMsg)
    } finally {
      setSubmitting(false)
    }
  }

  if (!detail) return (
    <div className="modal-overlay" style={{ background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(10px)' }}>
      <div className="spinner" style={{ borderTopColor: 'var(--primary)' }} />
    </div>
  )

  return (
    <div className="modal-overlay" onClick={onClose} style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)' }}>
      <div className="modal card" onClick={e => e.stopPropagation()} style={{ maxWidth: 1000, borderRadius: 32, overflowY: 'auto', maxHeight: '90vh' }}>
        <div className="modal-header" style={{ padding: '24px 40px', borderBottom: '1px solid rgba(0,0,0,0.05)', background: 'transparent', position: 'sticky', top: 0, zIndex: 10, background: '#fff' }}>
          <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.5rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>Property Details</h2>
          <button className="btn" onClick={onClose} style={{ padding: 8, minWidth: 40, height: 40, borderRadius: '50%' }}>✕</button>
        </div>
        <div className="modal-body" style={{ padding: '40px' }}>
          <div className="detail-grid">
            <div style={{ borderRadius: 20, overflow: 'hidden', height: 400,  border: '1px solid rgba(0,0,0,0.05)' }}>
              <img 
                src={p1} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                alt="Property"
              />
            </div>
            <div>
              <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: '2.5rem', fontWeight: 800, marginBottom: 12, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>{detail.address}</h1>
              <p style={{ color: 'var(--primary)', fontSize: '1rem', fontWeight: 700, marginBottom: 32 }}>{detail.locality?.toUpperCase()} · {detail.city?.toUpperCase()}</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>
                <div style={{ padding: 20,  borderRadius: 16, border: '1px solid rgba(0,0,0,0.02)' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: 4 }}>VALUATION</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>{fmt(detail.listed_price)}</div>
                </div>
                <div style={{ padding: 20,  borderRadius: 16, border: '1px solid rgba(0,0,0,0.02)' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: 4 }}>DIMENSIONS</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>{detail.size} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>SQFT</span></div>
                </div>
              </div>

              {detail.agent && (
                <div style={{ padding: 24, borderRadius: 20, background: '#f8fafc', border: '1px solid #e2e8f0', marginBottom: 32 }}>
                   <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 16 }}>LISTING AGENT</div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>{detail.agent.name[0]}</div>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{detail.agent.name}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{detail.agent.email} · {detail.agent.contact}</div>
                      </div>
                   </div>
                </div>
              )}

              {!inquiryType ? (
                <div style={{ display: 'flex', gap: 16 }}>
                  <button className="btn btn-primary" style={{ flex: 1, height: 56, fontSize: '1rem' }} onClick={() => setInquiryType('buy')}>I WANT TO BUY</button>
                  <button className="btn" style={{ flex: 1, height: 56, fontSize: '1rem', border: '2px solid var(--primary)', color: 'var(--primary)' }} onClick={() => setInquiryType('rent')}>I WANT TO RENT</button>
                </div>
              ) : (
                <div style={{ animation: 'slideUp 0.4s' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                     <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Inquire to {inquiryType === 'buy' ? 'Buy' : 'Rent'}</h3>
                     <button className="btn" onClick={() => setInquiryType(null)} style={{ fontSize: '0.8rem', padding: '4px 12px' }}>Back</button>
                   </div>
                   
                   {msg ? (
                     <div style={{ padding: 20, borderRadius: 12, background: msg.includes('success') ? '#f0fdf4' : '#fef2f2', color: msg.includes('success') ? '#166534' : '#991b1b', fontWeight: 500 }}>{msg}</div>
                   ) : (
                     <form onSubmit={submitInquiry} style={{ display: 'grid', gap: 12 }}>
                        <div style={{ padding: 16, background: '#fefce8', border: '1px solid #fef08a', borderRadius: 12, marginBottom: 8 }}>
                           <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#854d0e', marginBottom: 4 }}>TOTAL PROPERTY VALUE</div>
                           <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#854d0e' }}>{fmt(detail.listed_price)}</div>
                        </div>

                        <input name="name" className="form-control" placeholder="Your Name" defaultValue={user?.full_name} required />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                          <input name="email" className="form-control" placeholder="Email" defaultValue={user?.email} required />
                          <input name="phone" className="form-control" placeholder="Phone" required />
                        </div>

                        {inquiryType === 'rent' && (
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, animation: 'fadeIn 0.3s' }}>
                            <div>
                               <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>START DATE</label>
                               <input type="date" name="start_date" className="form-control" required />
                            </div>
                            <div>
                               <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>END DATE</label>
                               <input type="date" name="end_date" className="form-control" required />
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                               <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>AUTO-CALCULATED MONTHLY RENT (1% of Value)</label>
                               <input 
                                 type="text" 
                                 name="monthly_rent" 
                                 className="form-control" 
                                 style={{ background: '#f1f5f9', fontWeight: 700 }}
                                 value={fmt(detail.listed_price * 0.01)} 
                                 readOnly 
                               />
                               <input type="hidden" name="monthly_rent_val" value={detail.listed_price * 0.01} />
                            </div>
                          </div>
                        )}

                        <textarea name="message" className="form-control" placeholder="Special requirements (optional)" style={{ minHeight: 80 }}></textarea>
                        <button type="submit" className="btn btn-primary" style={{ height: 48 }} disabled={submitting}>
                          {submitting ? 'SUBMITTING...' : 'SUBMIT INTEREST'}
                        </button>
                     </form>
                   )}
                </div>
              )}
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
        height: 240, 
         
        borderRadius: 16, 
        position: 'relative',
        overflow: 'hidden'
      }}>
        <img 
          src={displayImage} 
          alt={property.address}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)' }}
        />
        <div style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', color: 'var(--text-main)', border: '1px solid rgba(0,0,0,0.05)' }}>
          {TYPE_ICONS[property.type] || '🏡'}
        </div>
        <div style={{ position: 'absolute', bottom: 16, left: 16, background: property.current_status === 'available' ? '#4ade80' : '#f87171', color: '#fff', padding: '6px 16px', borderRadius: 99, fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          {property.current_status}
        </div>
      </div>
      <div style={{ padding: '20px 8px 8px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h4 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.1rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-main)' }}>{property.address}</h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: 16 }}>{property.locality || 'GUWAHATI'}</p>
        
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, borderTop: '1px solid rgba(0,0,0,0.03)', paddingTop: 16, marginTop: 'auto' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{property.no_of_bedroom || '3'} BED</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>•</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{property.size || '2400'} SQFT</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>{property.listed_price ? fmt(property.listed_price) : 'Price Request'}</span>
          <div className="btn" style={{ width: 40, height: 40, padding: 0, borderRadius: '50%', background: 'var(--primary)', color: '#fff', border: 'none' }}>→</div>
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
      <div className="empty-state" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 0' }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>🏡</div>
        <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.8rem', fontWeight: 800, marginBottom: 8, color: 'var(--text-main)' }}>No Results Found</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: 400, margin: '0 auto' }}>
          Try adjusting your search or filters to find what you're looking for.
        </p>
        <button className="btn btn-primary" style={{ marginTop: 32 }} onClick={clearFilters}>RESET FILTERS</button>
      </div>
    )

    return properties.map(p => (
      <PropertyCard key={p.property_id} property={p} onClick={() => setSelected(p)} />
    ))
  }, [properties, loading])

  return (
    <div style={{ animation: 'fadeIn 0.8s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 8 }}>Elite Marketplace</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500 }}>Discover curated prestigious real estate assets.</p>
        </div>
        <div style={{ 
          background: 'rgba(74, 222, 128, 0.1)', 
          color: '#166534', 
          padding: '8px 20px', 
          borderRadius: 99, 
          fontSize: '0.65rem', 
          fontWeight: 800, 
          border: '1px solid rgba(74, 222, 128, 0.2)'
        }}>
          ● LIVE SYSTEM
        </div>
      </div>

      <div className="card" style={{ padding: '32px', marginBottom: 48 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20, alignItems: 'flex-end' }}>
          <div className="form-group">
            <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '0.05em', marginBottom: 10, display: 'block' }}>WHERE</label>
            <input
              type="text"
              className="form-control"
              style={{ height: 48, borderRadius: 12 }}
              placeholder="Search destinations"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '0.05em', marginBottom: 10, display: 'block' }}>TYPE</label>
            <select
              className="form-control"
              style={{ height: 48, borderRadius: 12 }}
              value={filters.type}
              onChange={e => setFilters({ ...filters, type: e.target.value })}
            >
              <option value="">All property types</option>
              {meta.types.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '0.05em', marginBottom: 10, display: 'block' }}>BHK</label>
            <select
              className="form-control"
              style={{ height: 48, borderRadius: 12 }}
              value={filters.no_of_bedroom}
              onChange={e => setFilters({ ...filters, no_of_bedroom: e.target.value })}
            >
              <option value="">Any BHK</option>
              {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} BHK</option>)}
            </select>
          </div>
          <div className="form-group">
            <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '0.05em', marginBottom: 10, display: 'block' }}>BUDGET</label>
            <input
              type="number"
              className="form-control"
              style={{ height: 48, borderRadius: 12 }}
              placeholder="Max price"
              value={filters.max_price}
              onChange={e => setFilters({ ...filters, max_price: e.target.value })}
            />
          </div>
          <button className="btn btn-primary" style={{ height: 48, borderRadius: 12, padding: '0 24px' }}>SEARCH</button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 100, textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto', borderTopColor: 'var(--primary)' }} />
          <p style={{ marginTop: 24, fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>Searching for elite stays…</p>
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
