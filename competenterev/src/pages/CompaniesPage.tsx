import { useState } from 'react'
import { useCompanies } from '@/hooks/useSupabase'
import type { Company } from '@/types/database'

export default function CompaniesPage() {
  const { data: companies = [], isLoading } = useCompanies()
  const [search, setSearch] = useState('')

  const filtered = companies.filter(c =>
    !search
    || c.name.toLowerCase().includes(search.toLowerCase())
    || (c.segment ?? '').toLowerCase().includes(search.toLowerCase())
    || (c.city ?? '').toLowerCase().includes(search.toLowerCase())
  )

  if (isLoading) return (
    <div className="page-wrap" style={{ color: 'var(--text-muted)' }}>Carregando empresas...</div>
  )

  return (
    <div className="page-wrap">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 900, margin: '0 0 2px' }}>🏢 Empresas</h1>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>{companies.length} empresas no CRM</p>
        </div>
        <button className="btn btn-primary">+ Nova Empresa</button>
      </div>

      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="🔍 Buscar empresa..."
        style={{ width: '100%', maxWidth: 360, padding: '8px 12px', marginBottom: 16 }}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
        {filtered.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
            Nenhuma empresa encontrada
          </div>
        ) : filtered.map(c => (
          <div
            key={c.id}
            className="card animate-fade-in"
            style={{ padding: 16, cursor: 'pointer', transition: 'border-color .15s' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-primary)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-default)'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--bg-raised)', border: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: 'var(--accent-primary)', flexShrink: 0 }}>
                {c.name.slice(0, 2).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                {c.segment && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.segment}</div>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 14, fontSize: 11, color: 'var(--text-muted)' }}>
              {c.city && <span>📍 {c.city}{c.state ? `, ${c.state}` : ''}</span>}
              {c.phone && <span>📞 {c.phone}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
