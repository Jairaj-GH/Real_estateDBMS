import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV_CONFIG = {
  common: [
    { label: 'Marketplace', icon: '🏪', to: '/marketplace' },
    { label: 'Analytics', icon: '📈', to: '/analytics', restricted: ['customer'] },
  ],
  office: [
    { label: 'Office Home', icon: '🏢', to: '/office' },
    { label: 'Sales Portfolio', icon: '💰', to: '/office/sales' },
    { label: 'Rental Assets', icon: '🏠', to: '/office/rentals' },
  ],
  agent: [
    { label: 'My Briefing', icon: '📋', to: '/agent' },
    { label: 'Close Sale', icon: '✅', to: '/agent/sell' },
    { label: 'Register Rent', icon: '🔑', to: '/agent/rent' },
    { label: 'Achievements', icon: '🏆', to: '/agent/transactions' },
  ],
  customer: [
    { label: 'Property Feed', icon: '🔍', to: '/marketplace' },
  ],
  admin: [
    { label: 'Admin Hub', icon: '🛡️', to: '/admin' },
    { label: 'SQL Console', icon: '💻', to: '/admin/sql' },
    { label: 'Users', icon: '👥', to: '/admin/users' },
    { label: 'Tables', icon: '🗃️', to: '/admin/tables' },
  ],
}

const ROLE_COLORS = {
  office: '#3a5a40',  /* Forest Moss */
  agent: '#8e443d',   /* Deep Sienna */
  customer: '#b8860b', /* Muted Gold */
  admin: '#991b1b',    /* Dark Crimson */
}

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const roleNav = NAV_CONFIG[user?.role] || []
  const commonNav = NAV_CONFIG.common.filter(item => !item.restricted || !item.restricted.includes(user?.role))
  const navItems = [...roleNav, ...commonNav]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="layout">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="modal-overlay" 
          style={{ zIndex: 999, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)' }} 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`} style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="sidebar-logo" style={{ padding: '48px 40px' }}>
          <h2 style={{ 
            fontFamily: 'Instrument Serif, serif', 
            fontSize: '2.5rem', 
            fontStyle: 'italic', 
            fontWeight: 400,
            color: '#fff'
          }}>
            RealEstate
          </h2>
          <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.3em', display: 'block', marginTop: 4 }}>EST. 2026</span>
        </div>

        <nav className="sidebar-nav" style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ padding: '0 40px 20px', fontSize: '0.7rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.2em' }}>NAVIGATION</div>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to.split('/').length <= 2}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
              <span style={{ letterSpacing: '0.01em' }}>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer" style={{ padding: 40 }}>
          <div 
            className="user-chip" 
            onClick={handleLogout} 
            style={{ 
              background: 'rgba(255,255,255,0.05)', 
              border: '1px solid rgba(255,255,255,0.1)', 
              padding: 16,
              borderRadius: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            <div className="avatar" style={{ borderRadius: '50%', width: 44, height: 44, overflow: 'hidden', border: '2px solid rgba(255,255,255,0.2)' }}>
              <img 
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=100&h=100" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                alt="Avatar"
              />
            </div>
            <div className="info">
              <div className="name" style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>{user?.full_name || 'Executive'}</div>
              <div className="role-badge" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', fontWeight: 800 }}>
                {user?.role?.toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="main-content">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, flex: 1 }}>
            <button 
              className="hamburger-btn btn"
              style={{ padding: 12, width: 44, height: 44 }}
              onClick={() => setMobileMenuOpen(true)}
            >
              ☰
            </button>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 400, color: '#fff', fontFamily: 'Instrument Serif, serif', fontStyle: 'italic' }}>
                {user?.role === 'office' && 'Intelligence Hub'}
                {user?.role === 'agent' && 'Agent Performance'}
                {user?.role === 'customer' && 'Elite Marketplace'}
                {user?.role === 'admin' && 'System Governance'}
              </h2>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.1)', 
              color: '#fff', 
              padding: '8px 16px', 
              borderRadius: 99, 
              fontSize: '0.7rem', 
              fontWeight: 900, 
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <span style={{ color: '#4ade80' }}>●</span> LIVE SYSTEM
            </div>
            <button 
              onClick={handleLogout}
              className="btn btn-primary"
              style={{ padding: '12px 24px' }}
            >
              Sign Out
            </button>
          </div>
        </header>

        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  )
}
