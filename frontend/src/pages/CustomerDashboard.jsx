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
      <div className="modal" style={{ maxWidth: 760 }}>
        <div className="modal-header">
          <h3>🏡 {property.address}</h3>
          <button className="btn btn-secondary btn-sm btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {!detail ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : (
            <>
              {/* Hero */}
              <div style={{ height: 180, background: 'linear-gradient(135deg,#e0e7ff,#dbeafe)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', marginBottom: 20, position: 'relative' }}>
                {TYPE_ICONS[detail.property_type] || '🏡'}
                <span className={`status-badge status-${detail.current_status}`} style={{ position: 'absolute', top: 12, right: 12 }}>
                  {detail.current_status}
                </span>
              </div>

              {/* Info Grid */}
              <div className="detail-info-grid" style={{ marginBottom: 20 }}>
                {[
                  { label: 'City', value: detail.city },
                  { label: 'Locality', value: detail.locality },
                  { label: 'Type', value: detail.property_type },
                  { label: 'Bedrooms', value: detail.bedrooms ? `${detail.bedrooms} BHK` : '—' },
                  { label: 'Bathrooms', value: detail.bathrooms || '—' },
                  { label: 'Size', value: detail.size_sqft ? `${detail.size_sqft} sq.ft` : '—' },
                  { label: 'Built Year', value: detail.construction_year || '—' },
                  { label: 'Listed Price', value: detail.listed_price ? fmt(detail.listed_price) : '—' },
                  { label: 'Owner', value: detail.owner?.name },
                  { label: 'Agent', value: detail.agent?.name || '—' },
                  { label: 'Agent Contact', value: detail.agent?.contact || '—' },
                  { label: 'Listed On', value: detail.listed_date || '—' },
                ].map(i => (
                  <div key={i.label} className="info-item">
                    <div className="label">{i.label}</div>
                    <div className="value">{i.value || '—'}</div>
                  </div>
                ))}
              </div>

              {detail.description && (
                <div style={{ padding: 14, background: 'var(--gray-50)', borderRadius: 8, marginBottom: 16 }}>
                  <div style={{ fontWeight: 600, fontSize: '.8rem', color: 'var(--gray-500)', marginBottom: 6 }}>DESCRIPTION</div>
                  <p style={{ fontSize: '.9rem', lineHeight: 1.6 }}>{detail.description}</p>
                </div>
              )}

              {detail.active_rent && (
                <div className="alert alert-warning">
                  <div>
                    <strong>🔑 Active Rental</strong><br />
                    Tenant: {detail.active_rent.tenant_name} · Rent: {fmt(detail.active_rent.monthly_rent)}/mo<br />
                    Period: {detail.active_rent.start_date} → {detail.active_rent.end_date}
                  </div>
                </div>
              )}

              {detail.sale_info && (
                <div className="alert alert-info">
                  <div>
                    <strong>💰 Sale Information</strong><br />
                    Buyer: {detail.sale_info.buyer_name} · Price: {fmt(detail.sale_info.final_price)}<br />
                    Date: {detail.sale_info.sale_date}
                  </div>
                </div>
              )}

              {detail.current_status === 'available' && (
                <div className="alert alert-success">
                  ✅ This property is <strong>available</strong>. Contact the agent to schedule a visit.
                  {detail.agent && <><br />📞 {detail.agent.name}: {detail.agent.contact}</>}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function PropertyCard({ property, onClick }) {
  return (
    <div className="property-card" onClick={onClick}>
      <div className="property-card-img">
        {TYPE_ICONS[property.property_type] || '🏡'}
        <span className={`status-badge status-${property.current_status}`}>{property.current_status}</span>
      </div>
      <div className="property-card-body">
        <h4>{property.address}</h4>
        <p className="locality">📍 {property.locality ? `${property.locality}, ` : ''}{property.city}</p>
        <div className="property-card-meta">
          {property.bedrooms > 0 && <span>🛏 {property.bedrooms} BHK</span>}
          {property.bathrooms > 0 && <span>🚿 {property.bathrooms}</span>}
          {property.size_sqft && <span>📐 {property.size_sqft} sq.ft</span>}
          {property.property_type && <span>{TYPE_ICONS[property.property_type] || '🏡'} {property.property_type}</span>}
        </div>
        <div className="property-card-footer">
          <span className="property-price">{property.listed_price ? fmt(property.listed_price) : 'Price on request'}</span>
          <span style={{ fontSize: '.75rem', color: 'var(--gray-400)' }}>{property.construction_year ? `Built ${property.construction_year}` : ''}</span>
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
    city: 'Guwahati', locality: '', property_type: '', status: 'available',
    min_price: '', max_price: '', bedrooms: '', search: ''
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
  const clearFilters = () => { setFilters({ city: '', locality: '', property_type: '', status: '', min_price: '', max_price: '', bedrooms: '', search: '' }); setPage(1) }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div>
      <div className="page-header">
        <h1>🔍 Find Your Perfect Property</h1>
        <p>Browsing {total} propert{total === 1 ? 'y' : 'ies'} in Guwahati & beyond</p>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="filter-bar-inner">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Search</label>
            <input className="form-control" placeholder="Address, locality…" value={filters.search} onChange={e => setF('search', e.target.value)} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">City</label>
            <select className="form-control" value={filters.city} onChange={e => setF('city', e.target.value)}>
              <option value="">All Cities</option>
              {meta.cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Locality</label>
            <select className="form-control" value={filters.locality} onChange={e => setF('locality', e.target.value)}>
              <option value="">All Areas</option>
              {meta.localities.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Type</label>
            <select className="form-control" value={filters.property_type} onChange={e => setF('property_type', e.target.value)}>
              <option value="">All Types</option>
              {meta.types.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Status</label>
            <select className="form-control" value={filters.status} onChange={e => setF('status', e.target.value)}>
              <option value="">All</option>
              <option value="available">Available</option>
              <option value="rented">Rented</option>
              <option value="sold">Sold</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Bedrooms</label>
            <select className="form-control" value={filters.bedrooms} onChange={e => setF('bedrooms', e.target.value)}>
              <option value="">Any</option>
              {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} BHK</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Min Price (₹)</label>
            <input type="number" className="form-control" placeholder="1000000" value={filters.min_price} onChange={e => setF('min_price', e.target.value)} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Max Price (₹)</label>
            <input type="number" className="form-control" placeholder="20000000" value={filters.max_price} onChange={e => setF('max_price', e.target.value)} />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={clearFilters}>Clear All</button>
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : properties.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🏘️</div>
          <p>No properties found matching your criteria.</p>
          <button className="btn btn-outline" style={{ marginTop: 12 }} onClick={clearFilters}>Clear Filters</button>
        </div>
      ) : (
        <>
          <div className="property-grid">
            {properties.map(p => (
              <PropertyCard key={p.property_id} property={p} onClick={() => setSelected(p)} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const pg = page <= 4 ? i + 1 : page + i - 3
                if (pg < 1 || pg > totalPages) return null
                return (
                  <button key={pg} className={pg === page ? 'active' : ''} onClick={() => setPage(pg)}>{pg}</button>
                )
              })}
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
            </div>
          )}
        </>
      )}

      {selected && <PropertyDetailModal property={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
