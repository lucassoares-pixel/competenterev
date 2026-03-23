import { useNavigate } from 'react-router-dom'
import { useDeals } from '@/hooks/useSupabase'
import { BRLk } from '@/lib/utils'

interface HubItem {
  id: string
  icon: string
  title: string
  desc: string
  path: string
}

interface HubGroup {
  label: string
  color: string
  bg: string
  items: HubItem[]
}

const GRUPOS: HubGroup[] = [
  {
    label: '📊 Dashboards Executivos',
    color: '#10b981', bg: 'rgba(16,185,129,.08)',
    items: [
      { id: 'dash', icon: '🎯', title: 'Dashboard Principal', desc: 'Receita, pipeline e prospecção consolidados', path: '/' },
      { id: 'kanban', icon: '⚡', title: 'Pipeline Kanban', desc: 'Visualização e gestão do funil de vendas', path: '/kanban' },
    ],
  },
  {
    label: '📈 CRM — Vendas',
    color: '#4f7fff', bg: 'rgba(79,127,255,.08)',
    items: [
      { id: 'contacts', icon: '👥', title: 'Contatos', desc: 'Gestão de leads e contatos', path: '/contacts' },
      { id: 'companies', icon: '🏢', title: 'Empresas', desc: 'Contas e empresas do CRM', path: '/companies' },
      { id: 'activities', icon: '📋', title: 'Atividades', desc: 'Tarefas, reuniões e ligações', path: '/activities' },
    ],
  },
  {
    label: '📄 Contratos & Financeiro',
    color: '#7c3aed', bg: 'rgba(124,58,237,.08)',
    items: [
      { id: 'contratos', icon: '📝', title: 'Contratos', desc: 'MRR, contratos ativos e setup', path: '/contratos' },
      { id: 'financeiro', icon: '💵', title: 'Financeiro', desc: 'Receita, vencimentos e fluxo', path: '/financeiro' },
    ],
  },
  {
    label: '🤝 Pós-venda',
    color: '#06b6d4', bg: 'rgba(6,182,212,.08)',
    items: [
      { id: 'implantacao', icon: '🚀', title: 'Implantação', desc: 'Acompanhamento de clientes em implantação', path: '/implantacao' },
      { id: 'cs', icon: '⭐', title: 'Customer Success', desc: 'Carteira, health scores e expansão', path: '/cs' },
      { id: 'tickets', icon: '🎫', title: 'Tickets', desc: 'Suporte e SLA', path: '/tickets' },
    ],
  },
]

export default function RelatoriosPage() {
  const navigate = useNavigate()
  const { data: deals = [] } = useDeals()

  const active = deals.filter(d => d.stage !== 'Fechado Ganho' && d.stage !== 'Fechado Perdido')
  const won = deals.filter(d => d.stage === 'Fechado Ganho')
  const pipeline = active.reduce((s, d) => s + (d.value ?? 0), 0)
  const mrrWon = won.reduce((s, d) => s + (d.value ?? 0), 0)
  const conv = deals.length ? Math.round(won.length / deals.length * 100) : 0

  return (
    <div className="page-wrap">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 900, margin: '0 0 4px' }}>📊 Central de Relatórios</h1>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>Todos os módulos e dashboards em um só lugar</p>
      </div>

      {/* Quick stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 28 }}>
        {[
          ['💰', 'Pipeline', BRLk(pipeline), `${active.length} abertos`, '#4f7fff'],
          ['✅', 'Ganhos',   BRLk(mrrWon),   `${won.length} fechamentos`, '#10b981'],
          ['📈', 'Conversão', `${conv}%`,     'ganhos / total', '#f59e0b'],
          ['📋', 'Total',    String(deals.length), 'negócios', 'var(--text-secondary)'],
        ].map(([icon, label, val, sub, color]) => (
          <div key={label} className="card" style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span>{icon}</span>
              <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px' }}>{label}</span>
            </div>
            <div style={{ fontSize: 20, fontWeight: 900, color: color as string }}>{val}</div>
            <div style={{ fontSize: 11, color: 'var(--text-disabled)', marginTop: 2 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Groups */}
      {GRUPOS.map(g => (
        <div key={g.label} style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 4, height: 20, borderRadius: 2, background: g.color }} />
            <span style={{ fontSize: 13, fontWeight: 800 }}>{g.label}</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
            <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>{g.items.length} módulos</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
            {g.items.map(item => (
              <div
                key={item.id}
                onClick={() => navigate(item.path)}
                className="animate-fade-in"
                style={{
                  background: g.bg, border: `1px solid ${g.color}30`,
                  borderRadius: 12, padding: '14px 16px', cursor: 'pointer',
                  transition: 'all .18s ease',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.borderColor = g.color
                  el.style.transform = 'translateY(-2px)'
                  el.style.boxShadow = '0 4px 16px rgba(0,0,0,.25)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.borderColor = `${g.color}30`
                  el.style.transform = 'translateY(0)'
                  el.style.boxShadow = 'none'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 20 }}>{item.icon}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: g.color }}>→</span>
                </div>
                <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 4 }}>{item.title}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
