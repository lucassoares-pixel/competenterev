import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Deal, Contact, Company, Task, CRMUser, WAChannel, WAConversation, WAMessage } from '@/types/database'

// ── Query Keys ───────────────────────────────────────────────────
export const qk = {
  deals:      (): string[]         => ['deals'],
  deal:       (id: number): string[] => ['deals', String(id)],
  contacts:   (): string[]         => ['contacts'],
  companies:  (): string[]         => ['companies'],
  tasks:      (dealId?: number): string[] => dealId ? ['tasks', String(dealId)] : ['tasks'],
  users:      (): string[]         => ['users'],
  waChannels: (): string[]         => ['wa_channels'],
  waConvs:    (channelId?: string | null): string[] => channelId ? ['wa_conversations_v2', channelId] : ['wa_conversations_v2'],
  waMsgs:     (convId: string): string[]  => ['wa_messages_v2', convId],
}

// ── Deals ─────────────────────────────────────────────────────────
export function useDeals() {
  return useQuery({
    queryKey: qk.deals(),
    queryFn: async () => {
      const { data, error } = await supabase.from('deals').select('*').order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as Deal[]
    },
    staleTime: 30_000,
  })
}

export function useDeal(id: number) {
  return useQuery({
    queryKey: qk.deal(id),
    queryFn: async () => {
      const { data, error } = await supabase.from('deals').select('*').eq('id', id).single()
      if (error) throw error
      return data as Deal
    },
    enabled: !!id,
  })
}

export function useUpsertDeal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (deal: Partial<Deal> & { id?: number }) => {
      if (deal.id) {
        const { data, error } = await supabase.from('deals').update(deal).eq('id', deal.id).select().single()
        if (error) throw error
        return data as Deal
      } else {
        const { data, error } = await supabase.from('deals').insert(deal).select().single()
        if (error) throw error
        return data as Deal
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: qk.deals() }) },
  })
}

// ── Contacts ──────────────────────────────────────────────────────
export function useContacts() {
  return useQuery({
    queryKey: qk.contacts(),
    queryFn: async () => {
      const { data, error } = await supabase.from('contacts').select('*').order('name')
      if (error) throw error
      return (data ?? []) as Contact[]
    },
    staleTime: 60_000,
  })
}

// ── Companies ─────────────────────────────────────────────────────
export function useCompanies() {
  return useQuery({
    queryKey: qk.companies(),
    queryFn: async () => {
      const { data, error } = await supabase.from('companies').select('*').order('name')
      if (error) throw error
      return (data ?? []) as Company[]
    },
    staleTime: 60_000,
  })
}

// ── Tasks ─────────────────────────────────────────────────────────
export function useTasks(dealId?: number) {
  return useQuery({
    queryKey: qk.tasks(dealId),
    queryFn: async () => {
      const q = supabase.from('tasks').select('*').order('due', { ascending: true })
      const { data, error } = dealId ? await q.eq('deal_id', dealId) : await q
      if (error) throw error
      return (data ?? []) as Task[]
    },
    staleTime: 30_000,
  })
}

// ── Users ─────────────────────────────────────────────────────────
export function useUsers() {
  return useQuery({
    queryKey: qk.users(),
    queryFn: async () => {
      const { data, error } = await supabase.from('users').select('*').eq('active', true).order('name')
      if (error) throw error
      return (data ?? []) as CRMUser[]
    },
    staleTime: 120_000,
  })
}

// ── WA Channels ───────────────────────────────────────────────────
export function useWAChannels() {
  return useQuery({
    queryKey: qk.waChannels(),
    queryFn: async () => {
      const { data, error } = await supabase.from('wa_channels').select('*').order('created_at')
      if (error) throw error
      return (data ?? []) as WAChannel[]
    },
    staleTime: 60_000,
  })
}

export function useUpsertWAChannel() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (channel: Partial<WAChannel> & { id: string }) => {
      const { data, error } = await supabase
        .from('wa_channels')
        .upsert({ ...channel, assigned_users: JSON.stringify(channel.assigned_users ?? []) })
        .select().single()
      if (error) throw error
      return data as WAChannel
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: qk.waChannels() }) },
  })
}

// ── WA Conversations ──────────────────────────────────────────────
export function useWAConversations(channelId?: string | null) {
  return useQuery({
    queryKey: qk.waConvs(channelId),
    queryFn: async () => {
      let q = supabase.from('wa_conversations_v2').select('*').order('updated_at', { ascending: false }).limit(60)
      if (channelId) q = q.eq('channel_id', channelId)
      const { data, error } = await q
      if (error) throw error
      return (data ?? []) as WAConversation[]
    },
    staleTime: 10_000,
    refetchInterval: 30_000,
  })
}

export function useUpsertWAConversation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (conv: Partial<WAConversation> & { id: string }) => {
      const { error } = await supabase.from('wa_conversations_v2').upsert(conv)
      if (error) throw error
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: qk.waConvs() }) },
  })
}

export function usePatchWAConversation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<WAConversation> & { id: string }) => {
      const { error } = await supabase.from('wa_conversations_v2').update(data).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: qk.waConvs() }) },
  })
}

// ── WA Messages ───────────────────────────────────────────────────
export function useWAMessages(convId: string | null) {
  return useQuery({
    queryKey: convId ? qk.waMsgs(convId) : ['wa_messages_noop'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wa_messages_v2').select('*')
        .eq('conv_id', convId!)
        .order('created_at', { ascending: true })
        .limit(100)
      if (error) throw error
      return (data ?? []) as WAMessage[]
    },
    enabled: !!convId,
    staleTime: 5_000,
  })
}

export function useInsertWAMessage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (msg: Partial<WAMessage> & { id: string; conv_id: string }) => {
      const { error } = await supabase.from('wa_messages_v2').upsert(msg)
      if (error) throw error
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: qk.waMsgs(vars.conv_id) })
      qc.invalidateQueries({ queryKey: qk.waConvs() })
    },
  })
}
