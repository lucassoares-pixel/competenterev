import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useWAStore, useAuthStore, useUIStore } from '@/stores'
import { qk } from './useSupabase'
import type { WAArea, WAMessage, WAConversation } from '@/types/database'

const DEFAULT_API_URL = 'https://gate.whapi.cloud'

export function useWAChannelService() {
  const { channels } = useWAStore()
  const { user } = useAuthStore()
  const { addToast } = useUIStore()
  const qc = useQueryClient()

  // ── Resolver token por canal ──
  const getToken = useCallback((channelId?: string | null): string | null => {
    if (channelId) {
      const ch = channels.find((c) => c.id === channelId)
      if (ch?.token) return ch.token
    }
    return localStorage.getItem('crm:whapi_token')
  }, [channels])

  const getApiUrl = useCallback((channelId?: string | null): string => {
    if (channelId) {
      const ch = channels.find((c) => c.id === channelId)
      if (ch?.api_url) return ch.api_url.replace(/\/$/, '')
    }
    return (localStorage.getItem('crm:whapi_url') || DEFAULT_API_URL).replace(/\/$/, '')
  }, [channels])

  // ── Canais visíveis para o usuário ──
  const visibleChannels = useCallback(() => {
    if (!user) return channels
    const role = user.role
    if (role === 'admin' || role === 'supervisor') return channels
    return channels.filter((ch) => {
      if (!ch.assigned_users?.length) return true
      return ch.assigned_users.includes(user.id) || ch.assigned_users.includes(String(user.id) as unknown as number)
    })
  }, [channels, user])

  // ── Resolver canal por área ──
  const resolveChannel = useCallback((area?: WAArea) => {
    const visible = visibleChannels()
    if (!visible.length) return null
    if (area) {
      const byArea = visible.find((c) => c.area === area && c.token)
      if (byArea) return byArea
    }
    return visible.find((c) => c.token) ?? visible[0] ?? null
  }, [visibleChannels])

  // ── Normalizar telefone ──
  const normalizePhone = useCallback((raw: string): string | null => {
    const d = raw.replace(/\D/g, '')
    if (!d || d.length < 8) return null
    const n = d.startsWith('55') ? d : '55' + d
    if (n.length < 12 || n.length > 13) return null
    return n
  }, [])

  // ── Enviar texto ──
  const sendText = useCallback(async (
    channelId: string | null,
    to: string,
    body: string,
    options?: { quoted?: string; typing_time?: number }
  ) => {
    const token = getToken(channelId)
    const apiUrl = getApiUrl(channelId)
    if (!token) return { ok: false, error: 'no_token' }
    const phone = normalizePhone(to)
    if (!phone) return { ok: false, error: 'invalid_phone' }
    const chatId = phone + '@s.whatsapp.net'
    try {
      const res = await fetch(`${apiUrl}/messages/text`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: chatId, body, ...options }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) return { ok: true, msg_id: data.id ?? null }
      return { ok: false, error: data.message ?? `HTTP ${res.status}` }
    } catch (e) {
      return { ok: false, error: (e as Error).message }
    }
  }, [getToken, getApiUrl, normalizePhone])

  // ── Enviar mídia ──
  const sendMedia = useCallback(async (
    channelId: string | null,
    to: string,
    media: File | string,
    options?: { type?: string; caption?: string; filename?: string }
  ) => {
    const token = getToken(channelId)
    const apiUrl = getApiUrl(channelId)
    if (!token) return { ok: false, error: 'no_token' }
    const phone = normalizePhone(to)
    if (!phone) return { ok: false, error: 'invalid_phone' }
    const chatId = phone + '@s.whatsapp.net'
    const mediaType = options?.type ?? 'document'
    const endpoint = `${apiUrl}/messages/${mediaType}`
    try {
      let res: Response
      if (typeof media === 'string') {
        const payload: Record<string, string> = { to: chatId, media }
        if (options?.caption) payload.caption = options.caption
        if (options?.filename) payload.filename = options.filename
        res = await fetch(endpoint, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        const fd = new FormData()
        fd.append('to', chatId)
        if (options?.caption) fd.append('caption', options.caption)
        fd.append('media', media, media.name)
        res = await fetch(endpoint, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        })
      }
      const data = await res.json().catch(() => ({}))
      if (res.ok) return { ok: true, msg_id: data.id ?? null, type: mediaType }
      return { ok: false, error: data.message ?? `HTTP ${res.status}` }
    } catch (e) {
      return { ok: false, error: (e as Error).message }
    }
  }, [getToken, getApiUrl, normalizePhone])

  // ── Verificar saúde do canal ──
  const checkHealth = useCallback(async (channelId: string) => {
    const token = getToken(channelId)
    const apiUrl = getApiUrl(channelId)
    if (!token) return { status: 'no_token' }
    try {
      const res = await fetch(`${apiUrl}/health`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json().catch(() => ({}))
      return { status: data?.account?.status ?? data?.status?.text ?? 'unknown', data }
    } catch (e) {
      return { status: 'error', error: (e as Error).message }
    }
  }, [getToken, getApiUrl])

  // ── Aceitar conversa ──
  const acceptConversation = useCallback(async (convId: string, channelId?: string | null) => {
    if (!user) return
    await supabase.from('wa_conversations_v2').update({
      assigned_to: user.id,
      assigned_name: user.name,
      status: 'active',
      accepted_at: new Date().toISOString(),
      channel_id: channelId ?? null,
    } as any).eq('id', convId)
    qc.invalidateQueries({ queryKey: ['wa_conversations_v2'] })
    addToast({ message: '✅ Conversa aceita', color: '#25d366' })
  }, [user, qc, addToast])

  // ── Transferir conversa ──
  const transferConversation = useCallback(async (
    convId: string,
    toUserId: number,
    toUserName: string,
    toChannelId?: string | null,
    note?: string
  ) => {
    await supabase.from('wa_conversations_v2').update({
      assigned_to: toUserId,
      assigned_name: toUserName,
      channel_id: toChannelId ?? null,
      transferred_from: user?.name ?? '',
      transferred_at: new Date().toISOString(),
      transfer_note: note ?? '',
    } as any).eq('id', convId)
    qc.invalidateQueries({ queryKey: ['wa_conversations_v2'] })
    addToast({ message: '✅ Conversa transferida', color: '#10b981' })
  }, [user, qc, addToast])

  // ── Marcar como lida ──
  const markRead = useCallback(async (convId: string, channelId?: string | null) => {
    const token = getToken(channelId)
    const apiUrl = getApiUrl(channelId)
    if (token) {
      fetch(`${apiUrl}/messages/${encodeURIComponent(convId + '@s.whatsapp.net')}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {})
    }
    await supabase.from('wa_conversations_v2').update({
      unread_count: 0,
      last_read_at: new Date().toISOString(),
    } as any).eq('id', convId)
    qc.invalidateQueries({ queryKey: ['wa_conversations_v2'] })
  }, [getToken, getApiUrl, qc])

  // ── Persistir mensagem ──
  const persistMessage = useCallback(async (msg: Partial<WAMessage> & { id: string; conv_id: string }) => {
    const { error } = await supabase.from('wa_messages_v2').upsert(msg)
    if (!error) {
      qc.invalidateQueries({ queryKey: ['wa_messages_v2', msg.conv_id] })
      qc.invalidateQueries({ queryKey: ['wa_conversations_v2'] })
    }
  }, [qc])

  // ── Persistir/criar conversa ──
  const persistConversation = useCallback(async (conv: Partial<WAConversation> & { id: string }) => {
    const { error } = await supabase.from('wa_conversations_v2').upsert(conv)
    if (!error) qc.invalidateQueries({ queryKey: ['wa_conversations_v2'] })
  }, [qc])

  return {
    visibleChannels,
    resolveChannel,
    getToken,
    getApiUrl,
    normalizePhone,
    sendText,
    sendMedia,
    checkHealth,
    acceptConversation,
    transferConversation,
    markRead,
    persistMessage,
    persistConversation,
  }
}
