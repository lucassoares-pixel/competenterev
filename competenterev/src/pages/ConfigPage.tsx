import { useState } from 'react'
import { useUsers } from '@/hooks/useSupabase'
import { useAuthStore } from '@/stores'
import { ROLE_LABELS, ROLE_COLORS, ROLE_ICONS, type UserRole } from '@/types/database'

type ConfigTab = 'usuarios' | 'pipelines' | 'integracoes' | 'whatsapp'

export default function ConfigPage() {
  const { user } = useAuthStore()
  const [tab, setTab] = useState<ConfigTab>('usuarios')
  const { data: users = [], isLoading } = useUsers()

  // Only admin can access config
  if (user?.role !== 'admin' && user?.role !== 'supervisor') {
    return (
      <div className="page-wrap" style={{ textAlign: 'center', paddingTop: 60 }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
        <div style={{ fontSize: 16, fontWeight: 700 }}>Acesso restrito</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>Apenas administradores podem acessar as configurações.</div>
      </div>
    )
  }

  const tabs: { id: ConfigTab; icon: string; label: string }[] = [
    { id: 'usuarios',     icon: '👥', label: 'Usuários' },
    { id: 'pipelines',    icon: '⚙️', label: 'Pipelines' },
    { id: 'integracoes',  icon: '🔌', label: 'Integrações' },
    { id: 'whatsapp',     icon: '💬', label: 'WhatsApp' },
  ]

  return (
    <div className="page-wrap">
      <h1 style={{ fontSize: 20, fontWeight: 900, marginBottom: 20 }}>⚙️ Configurações</h1>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 0 }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '8px 16px', background: 'none', border: 'none',
              borderBottom: `2px solid ${tab === t.id ? 'var(--accent-primary)' : 'transparent'}`,
              color: tab === t.id ? 'var(--accent-primary)' : 'var(--text-muted)',
              fontWeight: tab === t.id ? 800 : 500, fontSize: 12,
              cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6,
              marginBottom: -1,
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Usuarios tab */}
      {tab === 'usuarios' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{users.length} usuários ativos</span>
            <button className="btn btn-primary btn-sm">+ Novo Usuário</button>
          </div>
          <div className="card" style={{ overflow: 'hidden' }}>
            {isLoading ? (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>Carregando...</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    {['Usuário', 'Email', 'Papel', 'Departamento', 'Status'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => {
                    const role = u.role as UserRole
                    const color = ROLE_COLORS[role] ?? '#6b7280'
                    return (
                      <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                            <div style={{ width: 30, height: 30, borderRadius: '50%', background: u.color ?? color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                              {u.initials ?? u.name.slice(0, 2).toUpperCase()}
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 700 }}>{u.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-muted)' }}>{u.email || '—'}</td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color, background: `${color}15`, padding: '2px 8px', borderRadius: 999 }}>
                            {ROLE_ICONS[role]} {ROLE_LABELS[role] ?? role}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-muted)' }}>{u.departamento || '—'}</td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: u.active ? '#10b981' : '#ef4444', background: u.active ? 'rgba(16,185,129,.1)' : 'rgba(239,68,68,.1)', padding: '2px 8px', borderRadius: 999 }}>
                            {u.active ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Other tabs */}
      {tab !== 'usuarios' && (
        <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>
            {tabs.find(t => t.id === tab)?.icon}
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
            {tabs.find(t => t.id === tab)?.label}
          </div>
          <div style={{ fontSize: 12 }}>Configurações desta seção em breve.</div>
        </div>
      )}
    </div>
  )
}
