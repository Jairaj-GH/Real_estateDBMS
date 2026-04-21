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
    { label: 'Intelligence Leads', icon: '📬', to: '/agent/notifications' },
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
  office: '#064e3b',  /* Deep Emerald */
  agent: '#7f1d1d',   /* Maroon */
  customer: '#92400e', /* Amber Brown */
  admin: '#1e3a8a',    /* Royal Blue */
}

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)

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
      {sidebarOpen && (
        <div 
          className="modal-overlay" 
          style={{ zIndex: 999, background: 'rgba(0,0,0,0.1)', backdropFilter: 'blur(4px)' }} 
          className="mobile-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`sidebar ${sidebarOpen ? 'active' : ''}`} style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="sidebar-logo" style={{ padding: '40px 40px' }}>
          <h2 style={{ 
            fontFamily: 'Inter, sans-serif', 
            fontSize: '1.8rem', 
            fontWeight: 800,
            color: 'var(--primary)',
            letterSpacing: '-0.03em',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <span style={{ fontSize: '2rem' }}>🏡</span>
            Market
          </h2>
          <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.2em', display: 'block', marginTop: 4, fontWeight: 700 }}>EST. 2026</span>
        </div>

        <nav className="sidebar-nav" style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ padding: '0 40px 12px', fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>MENU</div>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
               end={item.to.split('/').length <= 2}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              onClick={() => {
                if (window.innerWidth <= 1024) setSidebarOpen(false)
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
              <span style={{ letterSpacing: '0.01em' }}>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer" style={{ padding: 32 }}>
          <div 
            className="user-chip" 
            style={{ 
              background: 'var(--bg-soft)', 
              border: '1px solid rgba(0,0,0,0.05)', 
              padding: 12,
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            <div className="avatar" style={{ borderRadius: '50%', width: 40, height: 40, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.1)' }}>
              <img 
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=100&h=100" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                alt="Avatar"
              />
            </div>
            <div className="info">
              <div className="name" style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)' }}>{user?.full_name || 'Executive'}</div>
              <div className="role-badge" style={{ color: 'var(--primary)', fontSize: '0.65rem', fontWeight: 800 }}>
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
              style={{ 
                padding: 12, 
                width: 44, 
                height: 44, 
                background: sidebarOpen ? 'rgba(255,255,255,0.1)' : 'transparent',
                borderColor: sidebarOpen ? 'var(--accent)' : 'var(--glass-border)'
              }}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰
            </button>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                {user?.role === 'office' && 'Intelligence Hub'}
                {user?.role === 'agent' && 'Agent Performance'}
                {user?.role === 'customer' && 'Elite Marketplace'}
                {user?.role === 'admin' && 'System Governance'}
              </h2>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ 
              background: 'rgba(74, 222, 128, 0.1)', 
              color: '#166534', 
              padding: '6px 14px', 
              borderRadius: 99, 
              fontSize: '0.65rem', 
              fontWeight: 800, 
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              border: '1px solid rgba(74, 222, 128, 0.2)'
            }}>
              <span style={{ color: '#22c55e' }}>●</span> LIVE SYSTEM
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
