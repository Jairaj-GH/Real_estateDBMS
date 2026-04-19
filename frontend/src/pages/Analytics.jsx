import React, { useState, useEffect } from 'react'
import api from '../api/axios'

function fmt(n) {
  return Number(n).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
}

function BarChart({ data, title, height = 300 }) {
  const maxVal = Math.max(...data.map(d => d.value), 1)
  
  return (
    <div className="card" style={{ padding: '32px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', marginBottom: 32 }}>{title}</h3>
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: 12, paddingBottom: 24 }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{ 
              width: '100%', 
              height: `${(d.value / maxVal) * 100}%`, 
              background: 'linear-gradient(to top, var(--primary), var(--peach))', 
              borderRadius: '8px 8px 4px 4px',
              transition: 'height 1s cubic-bezier(0.23, 1, 0.32, 1)',
              minHeight: 4,
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
            }} />
            <span style={{ fontSize: '0.6rem', fontWeight: 900, color: '#a8a29e', textAlign: 'center' }}>{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatCard({ label, value, trend, icon }) {
  return (
    <div className="card" style={{ padding: '32px', background: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ fontSize: '1.5rem' }}>{icon}</div>
        <div style={{ 
          fontSize: '0.7rem', 
          fontWeight: 900, 
          color: trend.startsWith('+') ? '#3a5a40' : '#991b1b',
          background: trend.startsWith('+') ? 'rgba(58, 90, 64, 0.1)' : 'rgba(153, 27, 27, 0.1)',
          padding: '4px 12px',
          borderRadius: 99
        }}>
          {trend}
        </div>
      </div>
      <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#78350f', letterSpacing: '0.2em', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', color: '#1c1917' }}>{value}</div>
    </div>
  )
}

export default function Analytics() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading for the premium feel
    setTimeout(() => setLoading(false), 800)
  }, [])

  if (loading) return <div style={{ padding: 100, textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>

  const marketData = [
    { label: 'JAN', value: 45 },
    { label: 'FEB', value: 52 },
    { label: 'MAR', value: 48 },
    { label: 'APR', value: 61 },
    { label: 'MAY', value: 55 },
    { label: 'JUN', value: 67 },
  ]

  const sectorData = [
    { label: 'ULTRA-LUX', value: 80 },
    { label: 'ESTATE', value: 40 },
    { label: 'COMMERCIAL', value: 60 },
    { label: 'PENTHOUSE', value: 30 },
  ]

  return (
    <div style={{ animation: 'fadeIn 0.8s ease-out' }}>
      <div style={{ marginBottom: 60 }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 900, color: '#1c1917', marginBottom: 12 }}>Market Intelligence</h1>
        <p style={{ color: '#78350f', fontSize: '1.2rem', fontWeight: 600, fontFamily: 'Instrument Serif, serif', fontStyle: 'italic' }}>Real-time transactional data and asset performance indicators.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32, marginBottom: 60 }}>
        <StatCard label="GROSS VOLUME" value="₹ 4.2 Cr" trend="+12.4%" icon="📈" />
        <StatCard label="ASSET TURNOVER" value="18 Days" trend="-2.1%" icon="⏱️" />
        <StatCard label="CAPITAL YIELD" value="8.2%" trend="+0.5%" icon="💎" />
        <StatCard label="CLIENT ACQUISITION" value="142" trend="+18.2%" icon="🤝" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: 32 }}>
        <BarChart title="Monthly Transactional Velocity" data={marketData} />
        <BarChart title="Sector Performance Matrix" data={sectorData} />
      </div>

      <div className="card" style={{ marginTop: 32, padding: 'clamp(32px, 8vw, 80px)', background: 'linear-gradient(135deg, #1c1917 0%, #0c0a09 100%)', color: '#fff', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: 24 }}>🧠</div>
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 900, marginBottom: 16 }}>Predictive Insights</h2>
        <p style={{ maxWidth: 800, margin: '0 auto', color: '#a8a29e', fontSize: '1.1rem', lineHeight: 1.8, fontFamily: 'Instrument Serif, serif', fontStyle: 'italic' }}>
          "Based on current market velocity in Guwahati, we anticipate a 4.2% appreciation in the core luxury sector over the next quarter. Strategic acquisition of high-rise assets is recommended."
        </p>
      </div>
    </div>
  )
}
