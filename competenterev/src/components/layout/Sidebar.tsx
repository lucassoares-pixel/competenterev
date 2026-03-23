import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore, useUIStore } from '@/stores'
import { ROLE_LABELS, ROLE_ICONS, type UserRole } from '@/types/database'
import { cn } from '@/lib/utils'

// Nav structure — mirrors nexuscrm HTML nav exactly
const NAV = [
  {
    sec: 'Operação Comercial',
    items: [
      { path: '/',          icon: '📊', label: 'Dashboard' },
      { path: '/kanban',    icon: '⚡', label: 'Pipeline Kanban' },
      { path: '/contacts',  icon: '👥', label: 'Contatos' },
      { path: '/companies', icon: '🏢', label: 'Empresas' },
      { path: '/whatsapp',  icon: '💬', label: 'WhatsApp', badge: 'wa' },
      { path: '/activities',icon: '📋', label: 'Atividades' },
      { path: '/cadencias', icon: '🔁', label: 'Cadências' },
    ],
  },
  {
    sec: 'Clientes & Pós-venda',
    items: [
      { path: '/contratos',   icon: '📝', label: 'Contratos' },
      { path: '/implantacao', icon: '🚀', label: 'Implantação' },
      { path: '/cs',          icon: '⭐', label: 'Customer Success' },
      { path: '/tickets',     icon: '🎫', label: 'Tickets' },
    ],
  },
  {
    sec: 'Financeiro & Relatórios',
    items: [
      { path: '/financeiro',  icon: '💵', label: 'Financeiro' },
      { path: '/relatorios',  icon: '📊', label: 'Relatórios' },
      { path: '/revops',      icon: '⚙️', label: 'RevOps' },
    ],
  },
  {
    sec: 'Pessoas',
    items: [
      { path: '/rh/colaboradores', icon: '👤', label: 'Colaboradores' },
      { path: '/rh/feedbacks',     icon: '💬', label: 'Feedbacks' },
      { path: '/rh/1on1',          icon: '📅', label: '1:1s' },
      { path: '/rh/pdi',           icon: '🎯', label: 'PDI' },
      { path: '/rh/painel',        icon: '📊', label: 'Painel RH' },
    ],
  },
  {
    sec: 'Configurações',
    items: [
      { path: '/config/usuarios',   icon: '👥', label: 'Usuários' },
      { path: '/config/pipelines',  icon: '⚙️', label: 'Pipelines' },
      { path: '/config/integracoes',icon: '🔌', label: 'Integrações' },
    ],
  },
]

// Role → allowed paths (subset)
const ROLE_NAV: Record<UserRole, string[]> = {
  admin:       ['*'],
  supervisor:  ['*'],
  vendedor:    ['/', '/kanban', '/contacts', '/companies', '/whatsapp', '/activities', '/cadencias'],
  sales:       ['/', '/kanban', '/contacts', '/companies', '/whatsapp', '/activities', '/cadencias'],
  sdr:         ['/', '/kanban', '/contacts', '/companies', '/whatsapp', '/activities'],
  implantador: ['/', '/implantacao', '/tickets', '/whatsapp', '/activities'],
  cs:          ['/', '/cs', '/tickets', '/whatsapp', '/contacts'],
  suporte:     ['/tickets', '/whatsapp', '/contacts'],
}

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const { toggleSidebar, sidebarOpen } = useUIStore()

  const role = user?.role as UserRole ?? 'vendedor'
  const allowedPaths = ROLE_NAV[role] ?? []
  const isAllowed = (path: string) =>
    allowedPaths.includes('*') || allowedPaths.includes(path) || path === '/'

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  return (
    <aside
      style={{
        width: sidebarOpen ? '220px' : '56px',
        transition: 'width .2s ease',
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: '16px 14px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'var(--accent-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 900, color: '#fff', flexShrink: 0,
          }}
        >
          CR
        </div>
        {sidebarOpen && (
          <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
            CompetenteRev
          </span>
        )}
        <button
          onClick={toggleSidebar}
          style={{
            marginLeft: 'auto', background: 'none', border: 'none',
            color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12, flexShrink: 0,
          }}
        >
          {sidebarOpen ? '◀' : '▶'}
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 6px' }}>
        {NAV.map((group) => {
          const visibleItems = group.items.filter((i) => isAllowed(i.path))
          if (!visibleItems.length) return null
          return (
            <div key={group.sec} style={{ marginBottom: 4 }}>
              {sidebarOpen && (
                <div
                  style={{
                    fontSize: 9, fontWeight: 800, color: 'var(--text-disabled)',
                    textTransform: 'uppercase', letterSpacing: '.8px',
                    padding: '10px 8px 4px',
                  }}
                >
                  {group.sec}
                </div>
              )}
              {visibleItems.map((item) => {
                const active = isActive(item.path)
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    title={!sidebarOpen ? item.label : undefined}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center',
                      gap: 8, padding: sidebarOpen ? '7px 10px' : '8px',
                      borderRadius: 8, border: 'none', cursor: 'pointer',
                      background: active ? 'rgba(79,127,255,.12)' : 'transparent',
                      color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
                      fontWeight: active ? 700 : 500,
                      fontSize: 12, fontFamily: 'inherit',
                      transition: 'all .12s',
                      justifyContent: sidebarOpen ? 'flex-start' : 'center',
                      marginBottom: 1,
                    }}
                    onMouseEnter={(e) => {
                      if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--bg-raised)'
                    }}
                    onMouseLeave={(e) => {
                      if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'
                    }}
                  >
                    <span style={{ fontSize: 15, flexShrink: 0 }}>{item.icon}</span>
                    {sidebarOpen && (
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.label}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )
        })}
      </nav>

      {/* Footer — user info */}
      {user && (
        <div
          style={{
            padding: '10px 8px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
              background: user.color ?? 'var(--accent-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 800, color: '#fff',
            }}
          >
            {user.initials ?? user.name.slice(0, 2).toUpperCase()}
          </div>
          {sidebarOpen && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.name}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                {ROLE_ICONS[role]} {ROLE_LABELS[role] ?? role}
              </div>
            </div>
          )}
          {sidebarOpen && (
            <button
              onClick={logout}
              title="Sair"
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14, flexShrink: 0 }}
            >
              ⎋
            </button>
          )}
        </div>
      )}
    </aside>
  )
}

