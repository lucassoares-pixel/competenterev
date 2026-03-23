import { useDeals, useTasks } from '@/hooks/useSupabase'
import { BRL, BRLk, getScoreColor } from '@/lib/utils'
import { useAuthStore } from '@/stores'

function KpiCard({ icon, label, value, sub, color = 'var(--accent-primary)' }: {
  icon: string; label: string; value: string; sub: string; color?: string
}) {
  return (
    <div className="card animate-fade-in" style={{ padding: '16px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px' }}>{label}</span>
      </div>
      <div style={{ fontSize: 22, fontWeight: 900, color }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--text-disabled)', marginTop: 3 }}>{sub}</div>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { data: deals = [] } = useDeals()
  const { data: tasks = [] } = useTasks()

  const myDeals = deals.filter(d => !user || d.owner === user.name || user.role === 'admin' || user.role === 'supervisor')
  const active = myDeals.filter(d => d.stage !== 'Fechado Ganho' && d.stage !== 'Fechado Perdido')
  const won = myDeals.filter(d => d.stage === 'Fechado Ganho')
  const pipeline = active.reduce((s, d) => s + (d.value ?? 0), 0)
  const mrrWon = won.reduce((s, d) => s + (d.value ?? 0), 0)
  const conv = myDeals.length ? Math.round(won.length / myDeals.length * 100) : 0
  const pendingTasks = tasks.filter(t => t.status === 'pending').length

  // Hot deals (score >= 70)
  const hot = active.filter(d => (d.score ?? 0) >= 70).slice(0, 5)
  // Overdue tasks
  const overdue = tasks.filter(t => t.status === 'pending' && t.due && t.due < new Date().toISOString().slice(0, 10)).slice(0, 5)

  return (
    <div className="page-wrap">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 900, margin: '0 0 4px' }}>
          👋 Olá, {user?.name?.split(' ')[0] ?? 'Usuário'}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 24 }}>
        <KpiCard icon="💰" label="Pipeline" value={BRLk(pipeline)} sub={`${active.length} negócios ativos`} />
        <KpiCard icon="✅" label="Ganhos" value={BRLk(mrrWon)} sub={`${won.length} fechamentos`} color="var(--accent-emerald)" />
        <KpiCard icon="📈" label="Conversão" value={`${conv}%`} sub="deals ganhos/total" color="var(--accent-amber)" />
        <KpiCard icon="📋" label="Tarefas" value={String(pendingTasks)} sub="pendentes hoje" color={pendingTasks > 0 ? 'var(--accent-red)' : 'var(--text-secondary)'} />
      </div>

      {/* Two columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {/* Hot deals */}
        <div className="card" style={{ padding: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 14 }}>🔥 Negócios quentes</div>
          {hot.length === 0 && <div style={{ color: 'var(--text-disabled)', fontSize: 12 }}>Nenhum negócio com score alto</div>}
          {hot.map(d => (
            <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: getScoreColor(d.score ?? 0), flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.company}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{d.stage} · {d.owner}</div>
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-emerald)', flexShrink: 0 }}>{BRL(d.value ?? 0)}</div>
            </div>
          ))}
        </div>

        {/* Overdue tasks */}
        <div className="card" style={{ padding: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 14 }}>⚠️ Tarefas vencidas</div>
          {overdue.length === 0 && <div style={{ color: 'var(--accent-emerald)', fontSize: 12 }}>✅ Nenhuma tarefa atrasada</div>}
          {overdue.map(t => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: 14, flexShrink: 0 }}>📋</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.company} · vence {t.due}</div>
              </div>
              <div style={{ fontSize: 10, color: 'var(--accent-red)', fontWeight: 700, flexShrink: 0 }}>ATRASADO</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
