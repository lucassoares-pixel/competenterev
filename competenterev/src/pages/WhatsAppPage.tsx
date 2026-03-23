import { useState, useRef, useEffect } from 'react'
import { useWAChannels, useWAConversations, useWAMessages } from '@/hooks/useSupabase'
import { useWAChannelService } from '@/hooks/useWAChannelService'
import { useAuthStore, useUIStore } from '@/stores'
import { WA_AREA_COLORS, WA_AREA_ICONS, type WAConversation, type WAMessage } from '@/types/database'
import { relativeTime } from '@/lib/utils'

export default function WhatsAppPage() {
  const { user } = useAuthStore()
  const { addToast } = useUIStore()
  const wa = useWAChannelService()

  const [activeChannelId, setActiveChannelId] = useState<string | null>(null)
  const [activeConvId, setActiveConvId] = useState<string | null>(null)
  const [msgText, setMsgText] = useState('')
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [sending, setSending] = useState(false)
  const [search, setSearch] = useState('')
  const feedRef = useRef<HTMLDivElement>(null)

  const { data: allChannels = [] } = useWAChannels()
  const channels = wa.visibleChannels()
  const { data: convs = [] } = useWAConversations(activeChannelId)
  const { data: msgs = [] } = useWAMessages(activeConvId)

  const activeConv = convs.find(c => c.id === activeConvId) ?? null
  const activeCh = allChannels.find(c => c.id === (activeConv?.channel_id ?? activeChannelId))

  // Scroll to bottom on new message
  useEffect(() => {
    if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight
  }, [msgs.length])

  const filteredConvs = convs.filter(c =>
    !search || (c.contact_name ?? '').toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  )

  async function send() {
    if (!activeConv || (!msgText.trim() && !mediaFile)) return
    setSending(true)
    const chId = activeConv.channel_id ?? activeChannelId
    const now = new Date().toISOString()
    const tmpId = 'tmp_' + Date.now()

    let result
    if (mediaFile) {
      const type = mediaFile.type.startsWith('image/') ? 'image'
        : mediaFile.type.startsWith('audio/') ? 'audio'
        : mediaFile.type.startsWith('video/') ? 'video' : 'document'
      result = await wa.sendMedia(chId, activeConv.phone, mediaFile, { type, caption: msgText || undefined })
    } else {
      result = await wa.sendText(chId, activeConv.phone, msgText)
    }

    await wa.persistMessage({
      id: tmpId,
      conv_id: activeConv.id,
      channel_id: chId,
      deal_id: activeConv.deal_id,
      contact_name: activeConv.contact_name,
      direction: 'out',
      body: msgText || mediaFile?.name || '',
      status: result.ok ? 'sent' : 'failed',
      whapi_msg_id: result.ok ? (result.msg_id ? String(result.msg_id) : null) : null,
      media_type: mediaFile ? (mediaFile.type.startsWith('image/') ? 'image' : 'document') : null,
      media_name: mediaFile?.name ?? null,
      created_at: now,
    })

    await wa.persistConversation({
      id: activeConv.id,
      last_msg: msgText || (mediaFile?.name ?? 'Mídia'),
      updated_at: now,
    })

    if (!result.ok) addToast({ message: '❌ Falha: ' + result.error, color: 'var(--accent-red)' })
    setMsgText('')
    setMediaFile(null)
    setSending(false)
  }

  return (
    <div style={{ height: '100%', display: 'flex', overflow: 'hidden' }}>
      {/* Col 1: Channels */}
      <div style={{ width: 56, flexShrink: 0, background: 'var(--bg-surface)', borderRight: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 0', gap: 6 }}>
        <button
          title="Todas as conversas"
          onClick={() => setActiveChannelId(null)}
          style={{ width: 40, height: 40, borderRadius: 12, border: `2px solid ${!activeChannelId ? 'var(--accent-primary)' : 'transparent'}`, background: !activeChannelId ? 'rgba(79,127,255,.15)' : 'var(--bg-raised)', fontSize: 18, cursor: 'pointer' }}
        >💬</button>
        <div style={{ width: 28, height: 1, background: 'var(--border-subtle)' }} />
        {channels.map(ch => {
          const color = WA_AREA_COLORS[ch.area] ?? '#6b7280'
          const active = activeChannelId === ch.id
          return (
            <button
              key={ch.id}
              title={ch.name}
              onClick={() => setActiveChannelId(ch.id)}
              style={{ width: 40, height: 40, borderRadius: 12, border: `2px solid ${active ? color : 'transparent'}`, background: active ? `${color}20` : 'var(--bg-raised)', fontSize: 18, cursor: 'pointer', position: 'relative' }}
            >
              {WA_AREA_ICONS[ch.area] ?? '📱'}
              <div style={{ position: 'absolute', bottom: 3, right: 3, width: 7, height: 7, borderRadius: '50%', background: ch.token ? '#10b981' : '#6b7280', border: '1.5px solid var(--bg-surface)' }} />
            </button>
          )
        })}
      </div>

      {/* Col 2: Conversation list */}
      <div style={{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column', background: 'var(--bg-surface)', borderRight: '1px solid var(--border-subtle)' }}>
        <div style={{ padding: '12px 12px 8px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 8 }}>💬 WhatsApp</div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." style={{ width: '100%', padding: '6px 10px', fontSize: 12 }} />
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filteredConvs.length === 0 && (
            <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)', fontSize: 12 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
              Nenhuma conversa
            </div>
          )}
          {filteredConvs.map(conv => {
            const isActive = conv.id === activeConvId
            const ch = allChannels.find(c => c.id === conv.channel_id)
            const chColor = ch ? (WA_AREA_COLORS[ch.area] ?? '#6b7280') : '#6b7280'
            return (
              <div
                key={conv.id}
                onClick={() => { setActiveConvId(conv.id); wa.markRead(conv.id, conv.channel_id) }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', cursor: 'pointer', background: isActive ? 'rgba(79,127,255,.08)' : 'transparent', borderBottom: '1px solid var(--border-subtle)', transition: 'background .1s' }}
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'var(--bg-raised)' }}
                onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: chColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#fff', flexShrink: 0, position: 'relative' }}>
                  {(conv.contact_name ?? '?').slice(0, 2).toUpperCase()}
                  {(conv.unread_count ?? 0) > 0 && (
                    <div style={{ position: 'absolute', top: -3, right: -3, width: 16, height: 16, borderRadius: '50%', background: '#25d366', border: '2px solid var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 900, color: '#fff' }}>
                      {conv.unread_count}
                    </div>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <span style={{ fontSize: 12, fontWeight: (conv.unread_count ?? 0) > 0 ? 700 : 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140 }}>
                      {conv.contact_name || conv.phone}
                    </span>
                    {conv.updated_at && <span style={{ fontSize: 10, color: 'var(--text-muted)', flexShrink: 0 }}>{relativeTime(conv.updated_at)}</span>}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {conv.status === 'pending' && <span style={{ color: '#f59e0b', fontWeight: 700, marginRight: 4 }}>●</span>}
                    {conv.last_msg || '...'}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Col 3: Chat */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {!activeConv ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', gap: 12 }}>
            <div style={{ fontSize: 48 }}>💬</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Selecione uma conversa</div>
            <div style={{ fontSize: 12 }}>ou clique em + Nova para iniciar</div>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-surface)', flexShrink: 0 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#25d366', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#fff' }}>
                {(activeConv.contact_name ?? '?').slice(0, 2).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 800 }}>{activeConv.contact_name || activeConv.phone}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{activeConv.phone}{activeCh ? ` · ${activeCh.name}` : ''}{activeConv.assigned_name ? ` · @${activeConv.assigned_name}` : ''}</div>
              </div>
              {activeConv.status === 'pending' && (
                <button className="btn btn-sm" onClick={() => wa.acceptConversation(activeConv.id, activeConv.channel_id)} style={{ background: '#25d366', color: '#fff', border: 'none' }}>
                  ✅ Aceitar
                </button>
              )}
            </div>

            {/* Message feed */}
            <div ref={feedRef} style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {msgs.map((msg: WAMessage) => {
                const isMe = msg.direction === 'out'
                return (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                    <div style={{ maxWidth: '70%', padding: '8px 12px', borderRadius: isMe ? '14px 14px 4px 14px' : '14px 14px 14px 4px', background: isMe ? '#25d366' : 'var(--bg-raised)', color: isMe ? '#fff' : 'var(--text-primary)', fontSize: 13, lineHeight: 1.45, wordBreak: 'break-word' }}>
                      {msg.media_type === 'image' && msg.media_url && (
                        <img src={msg.media_url} alt="imagem" style={{ maxWidth: 180, borderRadius: 8, display: 'block', marginBottom: msg.body ? 6 : 0, cursor: 'pointer' }} onClick={() => window.open(msg.media_url!, '_blank')} />
                      )}
                      {msg.media_type === 'document' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: msg.body ? 6 : 0, cursor: 'pointer' }} onClick={() => msg.media_url && window.open(msg.media_url, '_blank')}>
                          <span style={{ fontSize: 20 }}>📎</span>
                          <span style={{ fontSize: 12, fontWeight: 700 }}>{msg.media_name || 'Arquivo'}</span>
                        </div>
                      )}
                      {msg.body}
                      <div style={{ fontSize: 10, opacity: .7, marginTop: 3, textAlign: 'right' }}>
                        {new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        {isMe && { pending: ' ⏳', sent: ' ✓', delivered: ' ✓✓', read: ' ✓✓', failed: ' ❌', received: '' } as Record<string,string>[msg.status]}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Media preview */}
            {mediaFile && (
              <div style={{ padding: '8px 16px', background: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span>{mediaFile.type.startsWith('image/') ? '🖼️' : mediaFile.type.startsWith('audio/') ? '🎵' : '📎'}</span>
                <span style={{ fontSize: 12, flex: 1 }}>{mediaFile.name}</span>
                <button className="btn btn-sm btn-ghost" onClick={() => setMediaFile(null)}>✕</button>
              </div>
            )}

            {/* Input */}
            <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'flex-end', gap: 8, background: 'var(--bg-surface)', flexShrink: 0 }}>
              <label style={{ cursor: 'pointer', width: 34, height: 34, borderRadius: '50%', background: 'var(--bg-raised)', border: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>
                📎
                <input type="file" accept="image/*,audio/*,video/*,application/pdf,.doc,.docx" style={{ display: 'none' }} onChange={e => setMediaFile(e.target.files?.[0] ?? null)} />
              </label>
              <textarea
                value={msgText}
                onChange={e => setMsgText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
                placeholder="Mensagem..."
                rows={1}
                style={{ flex: 1, padding: '8px 12px', resize: 'none', maxHeight: 100, lineHeight: 1.45 }}
              />
              <button
                onClick={send}
                disabled={sending}
                style={{ width: 34, height: 34, borderRadius: '50%', background: '#25d366', border: 'none', fontSize: 16, cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}
              >
                {sending ? '⏳' : '➤'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
