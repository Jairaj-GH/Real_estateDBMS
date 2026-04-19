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

  const initials = (user?.full_name || user?.email || '?')
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="layout">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="modal-overlay" 
          style={{ zIndex: 999, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)' }} 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-logo" style={{ padding: '48px 40px' }}>
          <h2 style={{ 
            fontFamily: 'Instrument Serif, serif', 
            fontSize: '2.5rem', 
            fontStyle: 'italic', 
            fontWeight: 400,
            background: 'linear-gradient(to right, #fff, var(--peach))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            RealEstate
          </h2>
          <span style={{ fontSize: '0.65rem', color: '#78350f', letterSpacing: '0.3em', marginTop: -4 }}>EST. 2026</span>
        </div>

        <nav className="sidebar-nav" style={{ padding: '0 0' }}>
          <div style={{ padding: '0 40px 20px', fontSize: '0.7rem', fontWeight: 800, color: '#44403c', letterSpacing: '0.2em' }}>NAVIGATION</div>
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

        <div className="sidebar-footer" style={{ padding: 40, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="user-chip" onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: 16 }}>
            <div className="avatar" style={{ borderRadius: '50%', width: 44, height: 44, overflow: 'hidden' }}>
              <img 
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=100&h=100" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                alt="Avatar"
              />
            </div>
            <div className="info">
              <div className="name" style={{ fontWeight: 700, fontSize: '0.9rem' }}>{user?.full_name || user?.email}</div>
              <div className="role-badge" style={{ color: '#a8a29e' }}>
                {user?.role?.toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="main-content">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <button 
              className="hamburger-btn"
              onClick={() => setMobileMenuOpen(true)}
            >
              ☰
            </button>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 400, color: '#1c1917', fontFamily: 'Instrument Serif, serif', fontStyle: 'italic' }}>
                {user?.role === 'office' && 'Intelligence Hub'}
                {user?.role === 'agent' && 'Agent Performance'}
                {user?.role === 'customer' && 'Elite Marketplace'}
                {user?.role === 'admin' && 'System Governance'}
              </h2>
              <div style={{ fontSize: '0.7rem', color: '#78350f', fontWeight: 800, letterSpacing: '0.1em', marginTop: -4 }}>GUWAHATI PORTAL</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ 
              background: 'rgba(58, 90, 64, 0.1)', 
              color: '#3a5a40', 
              padding: '8px 16px', 
              borderRadius: 99, 
              fontSize: '0.7rem', 
              fontWeight: 900, 
              letterSpacing: '0.1em',
              border: '1px solid rgba(58, 90, 64, 0.2)'
            }}>
              ● LIVE SYSTEM
            </div>
            <button 
              onClick={handleLogout}
              style={{ 
                background: '#1c1917', 
                color: '#fff', 
                padding: '12px 24px', 
                borderRadius: 99, 
                fontSize: '0.75rem', 
                fontWeight: 800, 
                border: 'none', 
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              Sign Out
            </button>
          </div>
        </header>

        <main className="page-content" onScroll={e => {
          const winScroll = e.target.scrollTop;
          const height = e.target.scrollHeight - e.target.clientHeight;
          const scrolled = (winScroll / height) * 100;
          document.getElementById("scrollBar").style.width = scrolled + "%";
        }}>
          <div id="scrollBar" className="scroll-progress-bar" style={{ 
            height: 4, 
            background: 'linear-gradient(to right, var(--primary), var(--peach))', 
            position: 'fixed', 
            top: 'var(--topbar-height)', 
            width: 0, 
            zIndex: 1001,
            transition: 'width 0.2s ease-out',
            boxShadow: '0 2px 10px var(--primary-glow)'
          }} />
          {children}
        </main>
      </div>
    </div>
  )
}
