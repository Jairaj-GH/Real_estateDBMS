const TEAM = [
  {
    name: 'Team Member 1',
    role: 'Database Designer',
    contributions: [
      'Designed the complete MySQL schema (Owner, Agent, Buyer, Tenant, Property, Sale, Rent)',
      'Created all triggers for automatic status updates and overlap prevention',
      'Defined indexes for optimized query performance',
      'Wrote sample data and seed scripts for testing',
    ],
    icon: '🗄️',
    color: '#1a56db',
  },
  {
    name: 'Team Member 2',
    role: 'Backend Developer',
    contributions: [
      'Built Django REST Framework API with JWT authentication',
      'Implemented role-based permissions (office, agent, customer, admin)',
      'Created all API endpoints for properties, sales, rents, reports',
      'Integrated raw SQL console for admin use',
    ],
    icon: '⚙️',
    color: '#0e9f6e',
  },
  {
    name: 'Team Member 3',
    role: 'Frontend Developer',
    contributions: [
      'Developed full React SPA with React Router and Axios',
      'Built responsive property search and filter UI for customers',
      'Designed agent dashboard for marking properties sold/rented',
      'Implemented office reporting with expandable agent sections',
    ],
    icon: '🎨',
    color: '#7e3af2',
  },
  {
    name: 'Team Member 4',
    role: 'Testing & Documentation',
    contributions: [
      'Wrote comprehensive README with setup instructions',
      'Tested all trigger scenarios (overlap detection, status updates)',
      'Validated role-based access control for all four user types',
      'Prepared demo data and user accounts for evaluation',
    ],
    icon: '📋',
    color: '#ff5a1f',
  },
]

const TECH_STACK = [
  { name: 'Django 4.2', desc: 'Python web framework (backend)', icon: '🐍' },
  { name: 'Django REST Framework', desc: 'RESTful API layer', icon: '🔌' },
  { name: 'MySQL 8', desc: 'Relational database with triggers', icon: '🗄️' },
  { name: 'React 18', desc: 'Frontend JavaScript library', icon: '⚛️' },
  { name: 'Vite', desc: 'Fast frontend build tool', icon: '⚡' },
  { name: 'JWT (simplejwt)', desc: 'Stateless authentication tokens', icon: '🔐' },
  { name: 'Axios', desc: 'HTTP client for API calls', icon: '🌐' },
  { name: 'React Router v6', desc: 'Client-side routing', icon: '🗺️' },
]

const FEATURES = [
  { icon: '🏢', title: 'Office Interface', desc: 'Agent-wise sales and rental performance reports with expandable detail views.' },
  { icon: '🤝', title: 'Agent Interface', desc: 'Mark properties as sold or rented with buyer/tenant management and inline addition.' },
  { icon: '🔍', title: 'Customer Portal', desc: 'Search and filter properties by city, locality, type, price range, and availability.' },
  { icon: '💻', title: 'Admin SQL Console', desc: 'Execute any SQL query directly in the browser with syntax highlighting and history.' },
  { icon: '🔒', title: 'Role-Based Access', desc: 'Four distinct roles: office staff, agent, customer, and admin – each with scoped permissions.' },
  { icon: '⚡', title: 'Trigger Integration', desc: 'MySQL triggers automatically handle status updates and prevent overlapping rent periods.' },
]

export default function About() {
  return (
    <div style={{ animation: 'fadeIn 0.8s ease-out' }}>
      <div style={{ marginBottom: 60 }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 900, color: '#fff', marginBottom: 12 }}>ℹ️ Project Intelligence</h1>
        <p style={{ color: 'var(--accent)', fontSize: '1.2rem', fontWeight: 600, fontFamily: 'Instrument Serif, serif', fontStyle: 'italic' }}>Real Estate Management System – Research & Development Phase.</p>
      </div>

      {/* Project Overview */}
      <div className="card" style={{ marginBottom: 40, padding: 40 }}>
        <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', marginBottom: 24, color: '#fff' }}>🏡 Executive Overview</h3>
        <p style={{ lineHeight: 1.8, color: 'rgba(255,255,255,0.7)', marginBottom: 40, fontSize: '1.1rem' }}>
          This is a full-stack Real Estate Management Intelligence platform focused on the Guwahati luxury market. 
          Integrating advanced MySQL trigger logic with a modern glassy interface, it provides a seamless hub for 
          offices, agents, and elite clientele.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{ padding: 24, background: 'rgba(255,255,255,0.05)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '2rem', marginBottom: 16 }}>{f.icon}</div>
              <div style={{ fontWeight: 800, marginBottom: 8, color: '#fff', fontSize: '1rem', letterSpacing: '0.02em' }}>{f.title}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Team */}
      <div className="card" style={{ marginBottom: 40, padding: 40 }}>
        <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', marginBottom: 32, color: '#fff' }}>👥 Operational Personnel</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 32 }}>
          {TEAM.map(member => (
            <div key={member.name} style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: 24, 
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.05)',
              transition: 'transform 0.4s ease'
            }}>
              <div style={{ padding: 32, background: `linear-gradient(135deg, ${member.color}88, ${member.color}22)` }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>{member.icon}</div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}>{member.name}</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 900, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{member.role}</div>
              </div>
              <div style={{ padding: 24 }}>
                <ul style={{ paddingLeft: 20, margin: 0, color: 'rgba(255,255,255,0.6)' }}>
                  {member.contributions.map((c, i) => (
                    <li key={i} style={{ fontSize: '0.85rem', marginBottom: 10, lineHeight: 1.5 }}>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="card" style={{ marginBottom: 40, padding: 40 }}>
        <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', marginBottom: 32, color: '#fff' }}>🛠️ Engineering Stack</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {TECH_STACK.map(t => (
            <div key={t.name} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, background: 'rgba(255,255,255,0.05)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ fontSize: '1.5rem' }}>{t.icon}</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#fff' }}>{t.name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Database Schema Summary */}
      <div className="card" style={{ padding: 40 }}>
        <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', marginBottom: 32, color: '#fff' }}>🗄️ Relational Architecture</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>TABLE IDENTIFIER</th>
                <th>PRIMARY KEY</th>
                <th>ATTRIBUTES</th>
                <th>RELATIONS</th>
              </tr>
            </thead>
            <tbody>
              {[
                { table: 'Owner', pk: 'owner_id', cols: 'name, phone, email', rel: '1:N → Property' },
                { table: 'Agent', pk: 'agent_id', cols: 'name, contact, email, rating', rel: '1:N → Property, Sale, Rent' },
                { table: 'Buyer', pk: 'buyer_id', cols: 'name, phone, email', rel: '1:N → Sale' },
                { table: 'Tenant', pk: 'tenant_id', cols: 'name, phone, email', rel: '1:N → Rent' },
                { table: 'Property', pk: 'property_id', cols: 'address, locality, city, type, size, price, status', rel: 'N:1 → Owner, Agent' },
                { table: 'Sale', pk: 'property_id', cols: 'sale_date, final_price, dom', rel: '1:1 → Property, N:1 → Buyer' },
                { table: 'Rent', pk: 'id', cols: 'start_date, end_date, monthly_rent', rel: 'N:1 → Property, Tenant' },
              ].map(row => (
                <tr key={row.table}>
                  <td style={{ color: '#fff', fontWeight: 800 }}>{row.table}</td>
                  <td><code style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--accent)', padding: '4px 8px', borderRadius: 6, fontSize: '.75rem' }}>{row.pk}</code></td>
                  <td style={{ fontSize: '.8rem', color: 'rgba(255,255,255,0.6)' }}>{row.cols}</td>
                  <td><span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--primary)', background: 'rgba(139, 92, 246, 0.1)', padding: '4px 12px', borderRadius: 99, border: '1px solid rgba(139, 92, 246, 0.2)' }}>{row.rel}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 32, padding: 20, background: 'rgba(139, 92, 246, 0.1)', borderRadius: 16, border: '1px solid rgba(139, 92, 246, 0.2)', fontSize: '.85rem', color: '#fff' }}>
          <strong style={{ color: 'var(--accent)', letterSpacing: '0.05em' }}>⚡ ACTIVE TRIGGERS:</strong> <code style={{ color: 'rgba(255,255,255,0.7)' }}>status_sale_sync</code> · <code style={{ color: 'rgba(255,255,255,0.7)' }}>overlap_prevention</code> · <code style={{ color: 'rgba(255,255,255,0.7)' }}>rent_lifecycle_sync</code>
        </div>
      </div>
    </div>
  )
}
