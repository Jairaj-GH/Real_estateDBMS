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
    color: '#1a56db' },
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
    color: '#0e9f6e' },
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
    color: '#7e3af2' },
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
    color: '#ff5a1f' },
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
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, color: 'var(--text-main)', marginBottom: 8, letterSpacing: '-0.04em' }}>ℹ️ Project Intelligence</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500 }}>Real Estate Management System – Research & Development Phase.</p>
      </div>

      {/* Project Overview */}
      <div className="card" style={{ marginBottom: 40, padding: 40 }}>
        <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.5rem', fontWeight: 800, marginBottom: 24, color: 'var(--text-main)' }}>🏡 Executive Overview</h3>
        <p style={{ lineHeight: 1.6, color: 'var(--text-muted)', marginBottom: 32, fontSize: '1rem', fontWeight: 500 }}>
          This is a full-stack Real Estate Management Intelligence platform focused on the Guwahati luxury market. 
          Integrating advanced MySQL trigger logic with a modern clean interface, it provides a seamless hub for 
          offices, agents, and elite clientele.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{ padding: 24,  borderRadius: 16 }}>
              <div style={{ fontSize: '1.8rem', marginBottom: 16 }}>{f.icon}</div>
              <div style={{ fontWeight: 800, marginBottom: 8, color: 'var(--text-main)', fontSize: '1rem' }}>{f.title}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, fontWeight: 500 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Team */}
      <div className="card" style={{ marginBottom: 40, padding: 40 }}>
        <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.5rem', fontWeight: 800, marginBottom: 32, color: 'var(--text-main)' }}>👥 Operational Personnel</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 32 }}>
          {TEAM.map(member => (
            <div key={member.name} style={{
              
              borderRadius: 20, 
              overflow: 'hidden',
              
              transition: 'all 0.3s ease'
            }}>
              <div style={{ padding: 32, background: `linear-gradient(135deg, ${member.color}EE, ${member.color}88)` }}>
                <div style={{ fontSize: '2.2rem', marginBottom: 12 }}>{member.icon}</div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}>{member.name}</div>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{member.role}</div>
              </div>
              <div style={{ padding: 24 }}>
                <ul style={{ paddingLeft: 20, margin: 0, color: 'var(--text-muted)' }}>
                  {member.contributions.map((c, i) => (
                    <li key={i} style={{ fontSize: '0.85rem', marginBottom: 10, lineHeight: 1.5, fontWeight: 500 }}>
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
        <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.5rem', fontWeight: 800, marginBottom: 32, color: 'var(--text-main)' }}>🛠️ Engineering Stack</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {TECH_STACK.map(t => (
            <div key={t.name} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16,  borderRadius: 16 }}>
              <span style={{ fontSize: '1.5rem' }}>{t.icon}</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-main)' }}>{t.name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>{t.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Database Schema Summary */}
      <div className="card" style={{ padding: 40 }}>
        <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.5rem', fontWeight: 800, marginBottom: 32, color: 'var(--text-main)' }}>🗄️ Relational Architecture</h3>
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
                  <td style={{ color: 'var(--text-main)', fontWeight: 800 }}>{row.table}</td>
                  <td><code style={{  color: 'var(--primary)', padding: '4px 8px', borderRadius: 6, fontSize: '.75rem', fontWeight: 700 }}>{row.pk}</code></td>
                  <td style={{ fontSize: '.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>{row.cols}</td>
                  <td><span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary)', background: '#fff0f0', padding: '4px 12px', borderRadius: 99, border: '1px solid #ffecec' }}>{row.rel}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 32, padding: 20,  borderRadius: 12,  fontSize: '.85rem', color: 'var(--text-main)', fontWeight: 500 }}>
          <strong style={{ color: 'var(--primary)', letterSpacing: '0.02em' }}>⚡ ACTIVE TRIGGERS:</strong> <code style={{ color: 'var(--text-muted)' }}>status_sale_sync</code> · <code style={{ color: 'var(--text-muted)' }}>overlap_prevention</code> · <code style={{ color: 'var(--text-muted)' }}>rent_lifecycle_sync</code>
        </div>
      </div>
    </div>
  )
}
