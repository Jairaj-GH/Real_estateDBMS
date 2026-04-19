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
    <div>
      <div className="page-header">
        <h1>ℹ️ About This Project</h1>
        <p>Real Estate Management System – Academic Project</p>
      </div>

      {/* Project Overview */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header"><h3>🏡 Project Overview</h3></div>
        <div className="card-body">
          <p style={{ lineHeight: 1.8, color: 'var(--gray-600)', marginBottom: 16 }}>
            This is a full-stack Real Estate Management System inspired by platforms like <strong>Zillow</strong>,{' '}
            <strong>99acres</strong>, and <strong>Realtor.com</strong>. It provides a comprehensive platform for
            real estate offices, agents, customers, and database administrators operating in Guwahati and surrounding areas.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{ padding: 16, background: 'var(--gray-50)', borderRadius: 8, border: '1px solid var(--gray-200)' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{f.icon}</div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{f.title}</div>
                <div style={{ fontSize: '.82rem', color: 'var(--gray-500)', lineHeight: 1.5 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header"><h3>👥 Team Contributions</h3></div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {TEAM.map(member => (
              <div key={member.name} style={{
                border: '1px solid var(--gray-200)', borderRadius: 10, overflow: 'hidden',
                boxShadow: 'var(--shadow-sm)',
              }}>
                <div style={{ padding: '20px 20px 16px', background: member.color, color: '#fff' }}>
                  <div style={{ fontSize: '2rem', marginBottom: 8 }}>{member.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>{member.name}</div>
                  <div style={{ fontSize: '.8rem', opacity: .85 }}>{member.role}</div>
                </div>
                <div style={{ padding: 16 }}>
                  <ul style={{ paddingLeft: 16, margin: 0 }}>
                    {member.contributions.map((c, i) => (
                      <li key={i} style={{ fontSize: '.82rem', color: 'var(--gray-600)', marginBottom: 6, lineHeight: 1.5 }}>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tech Stack */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header"><h3>🛠️ Technology Stack</h3></div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {TECH_STACK.map(t => (
              <div key={t.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: 'var(--gray-50)', borderRadius: 8, border: '1px solid var(--gray-200)' }}>
                <span style={{ fontSize: '1.4rem' }}>{t.icon}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '.875rem' }}>{t.name}</div>
                  <div style={{ fontSize: '.72rem', color: 'var(--gray-500)' }}>{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Database Schema Summary */}
      <div className="card">
        <div className="card-header"><h3>🗄️ Database Schema</h3></div>
        <div className="card-body">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Table</th>
                  <th>Primary Key</th>
                  <th>Key Columns</th>
                  <th>Relationships</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { table: 'Owner', pk: 'owner_id', cols: 'name, contact, email, address', rel: '1:N → Property' },
                  { table: 'Agent', pk: 'agent_id', cols: 'name, contact, email, rating, license_number', rel: '1:N → Property, Sale, Rent' },
                  { table: 'Buyer', pk: 'buyer_id', cols: 'name, contact, email, budget', rel: '1:N → Sale' },
                  { table: 'Tenant', pk: 'tenant_id', cols: 'name, contact, email, monthly_income', rel: '1:N → Rent' },
                  { table: 'Property', pk: 'property_id', cols: 'address, locality, city, type, bedrooms, listed_price, current_status', rel: 'N:1 → Owner, Agent' },
                  { table: 'Sale', pk: 'sale_id', cols: 'sale_date, final_price, days_on_market', rel: 'N:1 → Property, Buyer, Agent' },
                  { table: 'Rent', pk: 'rent_id', cols: 'start_date, end_date, monthly_rent', rel: 'N:1 → Property, Tenant, Agent' },
                ].map(row => (
                  <tr key={row.table}>
                    <td><strong>{row.table}</strong></td>
                    <td><code style={{ background: 'var(--gray-100)', padding: '2px 6px', borderRadius: 4, fontSize: '.78rem' }}>{row.pk}</code></td>
                    <td style={{ fontSize: '.8rem', color: 'var(--gray-600)' }}>{row.cols}</td>
                    <td><span className="badge badge-blue">{row.rel}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 16, padding: 14, background: 'var(--primary-light)', borderRadius: 8, fontSize: '.82rem', color: 'var(--primary-dark)' }}>
            <strong>⚡ Active Triggers:</strong> <code>update_status_after_sale_insert</code> · <code>update_status_after_sale_delete</code> · <code>prevent_overlap_rent_insert</code> · <code>update_status_after_rent_insert</code> · <code>update_status_after_rent_delete</code>
          </div>
        </div>
      </div>
    </div>
  )
}
