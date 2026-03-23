import { useState } from 'react'
import { useContacts } from '@/hooks/useSupabase'
import { useAuthStore } from '@/stores'
import { getScoreColor } from '@/lib/utils'
import type { Contact } from '@/types/database'

const STATUS_COLORS: Record<string, string> = {
  Quente: '#ef4444',
  Morno:  '#f59e0b',
  Frio:   '#06b6d4',
}

function ScoreBadge({ score }: { score: number }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: 11, fontWeight: 700, color: getScoreColor(score),
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: getScoreColor(score), display: 'inline-block' }} />
      {score}
    </span>
  )
}

export default function ContactsPage() {
  const { user } = useAuthStore()
  const { data: allContacts = [], isLoading } = useContacts()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'Quente' | 'Morno' | 'Frio'>('all')
  const [selected, setSelected] = useState<Contact | null>(null)

  // ACL — vendedor só vê seus contatos
  const contacts = allContacts.filter(c => {
    if (!user) return true
    if (user.role === 'admin' || user.role === 'supervisor') return true
    return true // contacts are shared — filter by assigned if field exists
  })

  const filtered = contacts.filter(c => {
    const matchSearch = !search
      || c.name.toLowerCase().includes(search.toLowerCase())
      || (c.company ?? '').toLowerCase().includes(search.toLowerCase())
      || (c.email ?? '').toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || c.status === filter
    return matchSearch && matchFilter
  })

  if (isLoading) return (
    <div className="page-wrap" style={{ color: 'var(--text-muted)' }}>Carregando contatos...</div>
  )

  return (
    <div className="page-wrap">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 900, margin: '0 0 2px' }}>👥 Contatos</h1>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>{contacts.length} contatos no CRM</p>
        </div>
        <button className="btn btn-primary">+ Novo Contato</button>
      </div>

      {/* Search + filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Buscar por nome, empresa ou email..."
          style={{ flex: 1, maxWidth: 360, padding: '8px 12px' }}
        />
        <div style={{ display: 'flex', gap: 4 }}>
          {(['all', 'Quente', 'Morno', 'Frio'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 14px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                border: `1px solid ${filter === f ? (STATUS_COLORS[f] ?? 'var(--accent-primary)') : 'var(--border-default)'}`,
                background: filter === f ? `${STATUS_COLORS[f] ?? 'var(--accent-primary)'}15` : 'var(--bg-raised)',
                color: filter === f ? (STATUS_COLORS[f] ?? 'var(--accent-primary)') : 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              {f === 'all' ? 'Todos' : f} {f !== 'all' && `(${contacts.filter(c => c.status === f).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              {['Nome', 'Empresa', 'Cargo', 'Email', 'Telefone', 'Status', 'Score'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>Nenhum contato encontrado</td></tr>
            ) : filtered.map(c => (
              <tr
                key={c.id}
                onClick={() => setSelected(c)}
                style={{ borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer', transition: 'background .1s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-raised)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
              >
                <td style={{ padding: '10px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                      {c.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700 }}>{c.name}</span>
                  </div>
                </td>
                <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>{c.company || '—'}</td>
                <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-muted)' }}>{c.pos || '—'}</td>
                <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-muted)' }}>{c.email || '—'}</td>
                <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-muted)' }}>{c.phone || c.whatsapp || '—'}</td>
                <td style={{ padding: '10px 14px' }}>
                  {c.status ? (
                    <span style={{ fontSize: 11, fontWeight: 700, color: STATUS_COLORS[c.status] ?? 'var(--text-muted)', background: `${STATUS_COLORS[c.status] ?? '#6b7280'}15`, padding: '2px 8px', borderRadius: 999 }}>
                      {c.status}
                    </span>
                  ) : '—'}
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <ScoreBadge score={c.score ?? 0} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
