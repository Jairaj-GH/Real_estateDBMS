import React, { useState, useEffect } from 'react'
import api from '../api/axios'

function fmt(n) {
  return Number(n).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
}
function fmtShort(n) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)} Cr`
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)} L`
  return fmt(n)
}
const MONTHS = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const COLORS = ['#FF385C', '#00A699', '#FC642D', '#484848', '#767676', '#E07912', '#6B5CE7', '#0CA789', '#E74C5E', '#3B82F6', '#F59E0B', '#10B981', '#8B5CF6', '#EC4899', '#14B8A6']

// ── KPI Card ────────────────────────────────────────────
function KpiCard({ label, value, sub, icon, color }) {
  return (
    <div className="card" style={{ padding: '28px 32px',   display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '1.6rem' }}>{icon}</span>
        {sub && (
          <span style={{
            fontSize: '0.7rem', fontWeight: 800, padding: '3px 10px', borderRadius: 99,
            background: color === 'green' ? '#f0fdf4' : color === 'red' ? '#fef2f2' : '#f0f9ff',
            color: color === 'green' ? '#166534' : color === 'red' ? '#991b1b' : '#0c4a6e',
            border: `1px solid ${color === 'green' ? '#bbf7d0' : color === 'red' ? '#fee2e2' : '#bae6fd'}` }}>{sub}</span>
        )}
      </div>
      <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.03em' }}>{value}</div>
    </div>
  )
}

// ── Horizontal Bar Chart ────────────────────────────────
function HBarChart({ data, title, formatValue, subtitle }) {
  const maxVal = Math.max(...data.map(d => d.value), 1)
  return (
    <div className="card" style={{ padding: '28px 32px' }}>
      <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.1rem', fontWeight: 800, marginBottom: 4, color: 'var(--text-main)' }}>{title}</h3>
      {subtitle && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 20, fontWeight: 500 }}>{subtitle}</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 110, minWidth: 110, fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.label}</div>
            <div style={{ flex: 1, background: '#f5f5f5', borderRadius: 6, height: 28, overflow: 'hidden', position: 'relative' }}>
              <div style={{
                width: `${Math.max((d.value / maxVal) * 100, 2)}%`,
                height: '100%',
                background: `linear-gradient(90deg, ${COLORS[i % COLORS.length]}, ${COLORS[i % COLORS.length]}cc)`,
                borderRadius: 6,
                transition: 'width 1.2s cubic-bezier(0.23, 1, 0.32, 1)',
                display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 8 }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                  {formatValue ? formatValue(d.value) : d.value}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Vertical Bar Chart ──────────────────────────────────
function VBarChart({ data, title, formatValue, subtitle }) {
  const maxVal = Math.max(...data.map(d => d.value), 1)
  const barCount = data.length
  // Ensure minimum bar width of 48px, allowing scroll for many items
  const needsScroll = barCount > 8
  return (
    <div className="card" style={{ padding: '28px 32px',   display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.1rem', fontWeight: 800, marginBottom: 4, color: 'var(--text-main)' }}>{title}</h3>
      {subtitle && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 20, fontWeight: 500 }}>{subtitle}</p>}
      <div style={{ flex: 1, overflowX: needsScroll ? 'auto' : 'hidden', paddingBottom: needsScroll ? 8 : 0 }}>
        <div style={{
          display: 'flex', alignItems: 'flex-end', gap: 6, paddingTop: 24, minHeight: 200,
          minWidth: needsScroll ? barCount * 64 : 'auto' }}>
          {data.map((d, i) => (
            <div key={i} style={{ flex: needsScroll ? '0 0 56px' : 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.55rem', fontWeight: 800, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                {formatValue ? formatValue(d.value) : d.value}
              </span>
              <div style={{
                width: '100%', maxWidth: 48,
                height: `${Math.max((d.value / maxVal) * 100, 3)}%`,
                background: `linear-gradient(to top, ${COLORS[i % COLORS.length]}, ${COLORS[i % COLORS.length]}99)`,
                borderRadius: '6px 6px 2px 2px',
                transition: 'height 1.2s cubic-bezier(0.23, 1, 0.32, 1)',
                minHeight: 4,
                boxShadow: `0 4px 12px ${COLORS[i % COLORS.length]}30` }} />
              <span style={{ fontSize: '0.58rem', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'center', whiteSpace: 'nowrap', maxWidth: 56, overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Donut Chart ─────────────────────────────────────────
function DonutChart({ data, title, subtitle }) {
  const total = data.reduce((s, d) => s + d.count, 0)
  let cumAngle = 0
  const segments = data.map((d, i) => {
    const angle = (d.count / total) * 360
    const seg = { ...d, angle, startAngle: cumAngle, color: COLORS[i % COLORS.length] }
    cumAngle += angle
    return seg
  })

  const toRad = a => (a - 90) * (Math.PI / 180)
  const arcPath = (cx, cy, r, start, end) => {
    const sA = toRad(start), eA = toRad(end)
    const x1 = cx + r * Math.cos(sA), y1 = cy + r * Math.sin(sA)
    const x2 = cx + r * Math.cos(eA), y2 = cy + r * Math.sin(eA)
    const large = end - start > 180 ? 1 : 0
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`
  }

  return (
    <div className="card" style={{ padding: '28px 32px' }}>
      <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.1rem', fontWeight: 800, marginBottom: 4, color: 'var(--text-main)' }}>{title}</h3>
      {subtitle && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 16, fontWeight: 500 }}>{subtitle}</p>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>
        <svg viewBox="0 0 200 200" style={{ width: 160, height: 160, flexShrink: 0 }}>
          {segments.map((s, i) => (
            <path key={i} d={arcPath(100, 100, 70, s.startAngle, s.startAngle + Math.max(s.angle - 1, 0.5))}
              fill="none" stroke={s.color} strokeWidth="24" strokeLinecap="round" />
          ))}
          <text x="100" y="96" textAnchor="middle" style={{ fontSize: 28, fontWeight: 800, fill: 'var(--text-main)' }}>{total}</text>
          <text x="100" y="116" textAnchor="middle" style={{ fontSize: 10, fontWeight: 600, fill: '#888' }}>TOTAL</text>
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
          {segments.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.8rem' }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: s.color, flexShrink: 0 }} />
              <span style={{ fontWeight: 700, color: 'var(--text-main)', flex: 1 }}>{s.type || s.status || s.label}</span>
              <span style={{ fontWeight: 800, color: 'var(--text-muted)' }}>{s.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main Analytics Page ─────────────────────────────────
export default function Analytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get('/analytics/')
      .then(r => { setData(r.data); setLoading(false) })
      .catch(e => { setError(e.response?.data?.detail || 'Failed to load analytics.'); setLoading(false) })
  }, [])

  if (loading) return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <div className="spinner" style={{ borderTopColor: 'var(--primary)' }} />
      <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>Loading analytics...</span>
    </div>
  )

  if (error) return (
    <div style={{ padding: 80, textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', marginBottom: 16 }}>⚠️</div>
      <h3 style={{ color: 'var(--text-main)', fontWeight: 800, marginBottom: 8 }}>Analytics Unavailable</h3>
      <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{error}</p>
    </div>
  )

  const { kpi, agent_performance, year_trend, monthly_trend, property_types, city_breakdown, status_breakdown, recent_transactions, price_distribution } = data

  // Prepare chart data
  const agentChartData = agent_performance.slice(0, 10).map(a => ({ label: a.name.split(' ')[0], value: a.revenue }))
  const yearChartData = year_trend.map(y => ({ label: String(y.year), value: y.count }))
  const monthlyChartData = monthly_trend.slice(-12).map(m => ({ label: `${MONTHS[m.month]}'${String(m.year).slice(-2)}`, value: m.revenue }))
  const cityChartData = city_breakdown.map(c => ({ label: c.city, value: c.count }))
  const priceChartData = price_distribution.map(p => ({ label: p.label, value: p.count }))

  return (
    <div style={{ animation: 'fadeIn 0.8s ease-out' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, color: 'var(--text-main)', marginBottom: 8, letterSpacing: '-0.04em' }}>Market Intelligence</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', fontWeight: 500 }}>Real-time analytics powered by live database records.</p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 32 }}>
        <KpiCard label="Total Revenue" value={fmtShort(kpi.total_revenue)} sub={`${kpi.total_sales} deals`} icon="💰" color="green" />
        <KpiCard label="Avg Deal Size" value={fmtShort(kpi.avg_deal_size)} sub={`${kpi.avg_days_on_market}d avg`} icon="📊" color="blue" />
        <KpiCard label="Active Rentals" value={kpi.active_rents} sub={`${kpi.total_properties} total`} icon="🔑" color="green" />
        <KpiCard label="Available Properties" value={kpi.available_properties} sub={`of ${kpi.total_properties}`} icon="🏡" color="blue" />
      </div>

      {/* Agent Performance + Year Trend */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', gap: 20, marginBottom: 20 }}>
        <HBarChart
          title="Top Agent Performance"
          subtitle="Ranked by total sales revenue"
          data={agentChartData}
          formatValue={v => fmtShort(v)}
        />
        <VBarChart
          title="Year-wise Transactions"
          subtitle="Number of sales per year"
          data={yearChartData}
        />
      </div>

      {/* Monthly Revenue + Property Types */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', gap: 20, marginBottom: 20 }}>
        <VBarChart
          title="Monthly Revenue"
          subtitle="Sales revenue by month"
          data={monthlyChartData}
          formatValue={v => fmtShort(v)}
        />
        <DonutChart
          title="Property Types"
          subtitle="Distribution across all listings"
          data={property_types}
        />
      </div>

      {/* City Breakdown + Status + Price */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 20, marginBottom: 20 }}>
        <HBarChart
          title="City-wise Properties"
          subtitle="Number of listings per city"
          data={cityChartData}
        />
        <DonutChart
          title="Property Status"
          subtitle="Available vs Sold vs Rented"
          data={status_breakdown}
        />
        <VBarChart
          title="Price Distribution"
          subtitle="Properties by price range"
          data={priceChartData}
        />
      </div>

      {/* Recent Transactions Table */}
      <div className="card" style={{ padding: 0,   marginBottom: 20 }}>
        <div style={{ padding: '24px 32px', borderBottom: '1px solid #eee' }}>
          <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>Recent Transactions</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: 2 }}>Last {recent_transactions.length} recorded sales</p>
        </div>
        <div className="table-wrap" style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>PROPERTY</th>
                <th>CITY</th>
                <th>BUYER</th>
                <th>AGENT</th>
                <th>DATE</th>
                <th>PRICE</th>
                <th>DOM</th>
              </tr>
            </thead>
            <tbody>
              {recent_transactions.map((t, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 700, color: 'var(--text-main)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.address}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{t.city}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{t.buyer}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{t.agent}</td>
                  <td style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{t.date}</td>
                  <td style={{ fontWeight: 800, color: 'var(--text-main)' }}>{fmtShort(t.price)}</td>
                  <td style={{ color: 'var(--text-muted)', textAlign: 'center' }}>{t.days_on_market}d</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Agent Details Table */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '24px 32px', borderBottom: '1px solid #eee' }}>
          <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>Agent Leaderboard</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: 2 }}>Top {agent_performance.length} agents ranked by total revenue</p>
        </div>
        <div className="table-wrap" style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>AGENT</th>
                <th>SALES</th>
                <th>RENTALS</th>
                <th>REVENUE</th>
                <th>ACHIEVEMENTS</th>
                <th>RATING</th>
              </tr>
            </thead>
            <tbody>
              {agent_performance.map((a, i) => (
                <tr key={a.agent_id}>
                  <td style={{ fontWeight: 800, color: i < 3 ? 'var(--primary)' : 'var(--text-muted)', fontSize: '0.9rem' }}>{i + 1}</td>
                  <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>{a.name}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{a.sales_count}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{a.rental_count}</td>
                  <td style={{ fontWeight: 800, color: 'var(--text-main)' }}>{fmtShort(a.revenue)}</td>
                  <td style={{ textAlign: 'center' }}>
                     <span style={{ 
                       background: 'var(--primary)', color: '#fff', 
                       padding: '4px 12px', borderRadius: 20, fontSize: '0.7rem', 
                       fontWeight: 800, letterSpacing: '0.05em' 
                     }}>
                       {a.achievements || 0}
                     </span>
                  </td>                  <td>
                    <span style={{
                      fontWeight: 800, fontSize: '0.75rem', padding: '3px 10px', borderRadius: 99,
                      background: a.rating >= 4 ? '#f0fdf4' : a.rating >= 3 ? '#fffbeb' : '#fef2f2',
                      color: a.rating >= 4 ? '#166534' : a.rating >= 3 ? '#92400e' : '#991b1b',
                      border: `1px solid ${a.rating >= 4 ? '#bbf7d0' : a.rating >= 3 ? '#fde68a' : '#fecaca'}` }}>
                      ★ {a.rating.toFixed(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
