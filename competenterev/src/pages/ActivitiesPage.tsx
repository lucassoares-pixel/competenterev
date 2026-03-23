import { useState } from 'react'
import { useTasks } from '@/hooks/useSupabase'
import { useAuthStore } from '@/stores'
import type { Task } from '@/types/database'

const TYPE_ICONS: Record<string, string> = {
  Tarefa:   '📋',
  Reunião:  '📅',
  Ligação:  '📞',
  Email:    '✉️',
  WhatsApp: '💬',
}

const STATUS_STYLE: Record<string, { color: string; label: string }> = {
  pending: { color: '#f59e0b', label: 'Pendente' },
  done:    { color: '#10b981', label: 'Concluída' },
  overdue: { color: '#ef4444', label: 'Atrasada' },
}

export default function ActivitiesPage() {
  const { user } = useAuthStore()
  const { data: allTasks = [], isLoading } = useTasks()
  const [filter, setFilter] = useState<'all' | 'pending' | 'done' | 'overdue'>('pending')

  const today = new Date().toISOString().slice(0, 10)

  const tasks = allTasks
    .filter(t => !user || user.role === 'admin' || user.role === 'supervisor' || t.owner === user.name)
    .map(t => ({
      ...t,
      status: t.status === 'pending' && t.due && t.due < today ? 'overdue' : t.status,
    }))

  const filtered = tasks.filter(t => filter === 'all' || t.status === filter)

  const counts = {
    all: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    overdue: tasks.filter(t => t.status === 'overdue').length,
    done: tasks.filter(t => t.status === 'done').length,
  }

  if (isLoading) return (
    <div className="page-wrap" style={{ color: 'var(--text-muted)' }}>Carregando atividades...</div>
  )

  return (
    <div className="page-wrap">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 900, margin: '0 0 2px' }}>📋 Atividades</h1>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>{counts.pending} pendentes · {counts.overdue} atrasadas</p>
        </div>
        <button className="btn btn-primary">+ Nova Atividade</button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        {([
          ['all',     'Todas',     'var(--text-secondary)'],
          ['pending', 'Pendentes', '#f59e0b'],
          ['overdue', 'Atrasadas', '#ef4444'],
          ['done',    'Concluídas','#10b981'],
        ] as const).map(([key, label, color]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            style={{
              padding: '6px 14px', borderRadius: 999, fontSize: 11, fontWeight: 700,
              border: `1px solid ${filter === key ? color : 'var(--border-default)'}`,
              background: filter === key ? `${color}15` : 'var(--bg-raised)',
              color: filter === key ? color : 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            {label} ({counts[key]})
          </button>
        ))}
      </div>

      {/* Task list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.length === 0 ? (
          <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            ✅ Nenhuma atividade neste filtro
          </div>
        ) : filtered.map(t => {
          const s = STATUS_STYLE[t.status] ?? STATUS_STYLE.pending
          return (
            <div
              key={t.id}
              className="card animate-fade-in"
              style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}
            >
              <span style={{ fontSize: 18, flexShrink: 0 }}>{TYPE_ICONS[t.type] ?? '📋'}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {t.title}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {t.company && <span>{t.company}</span>}
                  {t.owner && <span> · @{t.owner}</span>}
                  {t.due && <span> · vence {t.due}</span>}
                </div>
              </div>
              <span style={{
                fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 999,
                color: s.color, background: `${s.color}15`,
              }}>
                {s.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
