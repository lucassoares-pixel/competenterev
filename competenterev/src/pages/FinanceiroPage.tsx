import { useDeals } from '@/hooks/useSupabase'
import { BRL, BRLk } from '@/lib/utils'

export default function FinanceiroPage() {
  const { data: deals = [], isLoading } = useDeals()

  const won = deals.filter(d => d.stage === 'Fechado Ganho')
  const mrr = won.reduce((s, d) => s + (d.value ?? 0), 0)
  const lost = deals.filter(d => d.stage === 'Fechado Perdido')
  const mrrLost = lost.reduce((s, d) => s + (d.value ?? 0), 0)

  // MRR por mês (últimos 6 meses)
  const months: Record<string, number> = {}
  won.forEach(d => {
    const m = (d.created_at ?? '').slice(0, 7)
    if (m) months[m] = (months[m] ?? 0) + (d.value ?? 0)
  })
  const monthEntries = Object.entries(months).sort().slice(-6)
  const maxMrr = Math.max(...monthEntries.map(([, v]) => v), 1)

  if (isLoading) return <div className="page-wrap" style={{ color: 'var(--text-muted)' }}>Carregando...</div>

  return (
    <div className="page-wrap">
      <h1 style={{ fontSize: 20, fontWeight: 900, marginBottom: 20 }}>💵 Financeiro</h1>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 24 }}>
        {[
          ['💰', 'MRR Total',    BRLk(mrr),        `${won.length} contratos`, '#10b981'],
          ['📉', 'Churn MRR',   BRLk(mrrLost),     `${lost.length} perdidos`, '#ef4444'],
          ['📊', 'Ticket Médio', won.length ? BRL(mrr / won.length) : 'R$ 0', 'por contrato', '#4f7fff'],
          ['📈', 'NRR',          mrr > 0 ? `${Math.round((mrr - mrrLost) / Math.max(mrr, 1) * 100)}%` : '—', 'net revenue', '#8b5cf6'],
        ].map(([icon, label, val, sub, color]) => (
          <div key={label as string} className="card" style={{ padding: '16px 18px' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
              <span>{icon}</span>
              <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px' }}>{label}</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: color as string }}>{val}</div>
            <div style={{ fontSize: 11, color: 'var(--text-disabled)', marginTop: 3 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* MRR por mês */}
      <div className="card" style={{ padding: 20, marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 16 }}>📊 MRR por mês (fechamentos)</div>
        {monthEntries.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>Nenhum dado disponível</div>
        ) : (
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', height: 120 }}>
            {monthEntries.map(([month, val]) => (
              <div key={month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 700 }}>{BRLk(val)}</span>
                <div style={{
                  width: '100%', background: 'var(--accent-primary)',
                  borderRadius: '4px 4px 0 0',
                  height: `${Math.round((val / maxMrr) * 90)}px`,
                  minHeight: 4, opacity: .85,
                  transition: 'height .3s ease',
                }} />
                <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>{month.slice(5)}/{month.slice(2, 4)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent won deals */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-subtle)', fontSize: 13, fontWeight: 800 }}>
          ✅ Últimos contratos ganhos
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              {['Empresa', 'Responsável', 'MRR', 'Data'].map(h => (
                <th key={h} style={{ padding: '8px 14px', textAlign: 'left', fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {won.slice(0, 10).map(d => (
              <tr key={d.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '9px 14px', fontSize: 12, fontWeight: 700 }}>{d.company}</td>
                <td style={{ padding: '9px 14px', fontSize: 12, color: 'var(--text-muted)' }}>{d.owner}</td>
                <td style={{ padding: '9px 14px', fontSize: 12, fontWeight: 700, color: '#10b981' }}>{BRL(d.value ?? 0)}</td>
                <td style={{ padding: '9px 14px', fontSize: 11, color: 'var(--text-muted)' }}>{d.created_at?.slice(0, 10) ?? '—'}</td>
              </tr>
            ))}
            {won.length === 0 && (
              <tr><td colSpan={4} style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>Nenhum contrato ganho ainda</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
