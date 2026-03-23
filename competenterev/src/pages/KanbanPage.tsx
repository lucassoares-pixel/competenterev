import { useState } from 'react'
import { useDeals, useUpsertDeal } from '@/hooks/useSupabase'
import { useAuthStore, useUIStore } from '@/stores'
import { BRL, getScoreColor } from '@/lib/utils'
import type { Deal } from '@/types/database'

const PIPELINES: Record<string, { label: string; stages: string[] }> = {
  vendas: {
    label: 'Vendas',
    stages: ['Lead', 'Contato Inicial', 'Qualificação', 'Proposta', 'Negociação', 'Fechado Ganho', 'Fechado Perdido'],
  },
}

const STAGE_COLORS: Record<string, string> = {
  'Lead':           '#6b7280',
  'Contato Inicial':'#4f7fff',
  'Qualificação':   '#06b6d4',
  'Proposta':       '#8b5cf6',
  'Negociação':     '#f59e0b',
  'Fechado Ganho':  '#10b981',
  'Fechado Perdido':'#ef4444',
}

function DealCard({ deal, onDragStart }: { deal: Deal; onDragStart: (d: Deal) => void }) {
  const score = deal.score ?? 50
  return (
    <div
      draggable
      onDragStart={() => onDragStart(deal)}
      className="animate-fade-in"
      style={{
        background: 'var(--bg-raised)', border: '1px solid var(--border-default)',
        borderRadius: 10, padding: '11px 13px', cursor: 'grab', marginBottom: 6,
        transition: 'box-shadow .15s',
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,.3)' }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
    >
      <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {deal.company}
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>
        {deal.contact} · {deal.owner}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--accent-emerald)' }}>{BRL(deal.value ?? 0)}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: getScoreColor(score) }} />
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{score}</span>
        </div>
      </div>
    </div>
  )
}

export default function KanbanPage() {
  const { data: allDeals = [], isLoading } = useDeals()
  const { mutate: upsertDeal } = useUpsertDeal()
  const { user } = useAuthStore()
  const { addToast } = useUIStore()
  const [pipeline] = useState('vendas')
  const [dragDeal, setDragDeal] = useState<Deal | null>(null)
  const [overStage, setOverStage] = useState<string | null>(null)

  const pl = PIPELINES[pipeline]

  // ACL filter
  const deals = allDeals.filter(d => {
    if (!user) return true
    if (user.role === 'admin' || user.role === 'supervisor') return true
    return d.owner === user.name
  }).filter(d => d.pipeline === pipeline)

  const byStage = (stage: string) => deals.filter(d => d.stage === stage)
  const stageTotal = (stage: string) => byStage(stage).reduce((s, d) => s + (d.value ?? 0), 0)

  function handleDrop(stage: string) {
    if (!dragDeal || dragDeal.stage === stage) return
    upsertDeal({ id: dragDeal.id, stage }, {
      onSuccess: () => addToast({ message: `✅ Movido para ${stage}`, color: 'var(--accent-emerald)' }),
    })
    setDragDeal(null)
    setOverStage(null)
  }

  if (isLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
      ⏳ Carregando pipeline...
    </div>
  )

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <h1 style={{ fontSize: 16, fontWeight: 800 }}>⚡ Pipeline — {pl.label}</h1>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{deals.length} negócios</span>
          <span style={{ fontSize: 12, color: 'var(--accent-emerald)', fontWeight: 700 }}>
            {BRL(deals.reduce((s, d) => s + (d.value ?? 0), 0))}
          </span>
        </div>
      </div>

      {/* Board */}
      <div style={{ flex: 1, overflowX: 'auto', overflowY: 'hidden', padding: '14px 16px', display: 'flex', gap: 12 }}>
        {pl.stages.map(stage => {
          const color = STAGE_COLORS[stage] ?? 'var(--accent-primary)'
          const isOver = overStage === stage
          const cards = byStage(stage)
          return (
            <div
              key={stage}
              onDragOver={(e) => { e.preventDefault(); setOverStage(stage) }}
              onDragLeave={() => setOverStage(null)}
              onDrop={() => handleDrop(stage)}
              style={{
                width: 240, flexShrink: 0,
                background: isOver ? `${color}12` : 'var(--bg-surface)',
                border: `1px solid ${isOver ? color : 'var(--border-default)'}`,
                borderRadius: 12,
                display: 'flex', flexDirection: 'column',
                maxHeight: '100%', overflow: 'hidden',
                transition: 'border-color .15s, background .15s',
              }}
            >
              {/* Column header */}
              <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-subtle)', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                  <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-primary)' }}>{stage}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 10, background: `${color}20`, color, padding: '1px 7px', borderRadius: 999, fontWeight: 700 }}>
                    {cards.length}
                  </span>
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{BRL(stageTotal(stage))}</div>
              </div>

              {/* Cards */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '8px 10px' }}>
                {cards.map(d => (
                  <DealCard key={d.id} deal={d} onDragStart={setDragDeal} />
                ))}
                {cards.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-disabled)', fontSize: 11 }}>
                    Arraste negócios aqui
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
