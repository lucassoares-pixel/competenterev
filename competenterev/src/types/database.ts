// Auto-generated types matching Supabase schema
// Project: hxcohoabnqdzekptrauu

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      deals: {
        Row: Deal
        Insert: Partial<Deal>
        Update: Partial<Deal>
      }
      contacts: {
        Row: Contact
        Insert: Partial<Contact>
        Update: Partial<Contact>
      }
      companies: {
        Row: Company
        Insert: Partial<Company>
        Update: Partial<Company>
      }
      tasks: {
        Row: Task
        Insert: Partial<Task>
        Update: Partial<Task>
      }
      users: {
        Row: CRMUser
        Insert: Partial<CRMUser>
        Update: Partial<CRMUser>
      }
      wa_channels: {
        Row: WAChannel
        Insert: Partial<WAChannel>
        Update: Partial<WAChannel>
      }
      wa_conversations_v2: {
        Row: WAConversation
        Insert: Partial<WAConversation>
        Update: Partial<WAConversation>
      }
      wa_messages_v2: {
        Row: WAMessage
        Insert: Partial<WAMessage>
        Update: Partial<WAMessage>
      }
      wa_spam_log: {
        Row: { id: number; phone: string; sent_at: string }
        Insert: { phone: string; sent_at?: string }
        Update: { phone?: string }
      }
      stage_history: {
        Row: StageHistory
        Insert: Partial<StageHistory>
        Update: Partial<StageHistory>
      }
    }
    Views: {
      wa_inbox: {
        Row: WAInboxRow
      }
    }
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

// ── Core CRM Types ──────────────────────────────────────────────

export interface Deal {
  id: number
  company: string
  contact: string
  value: number
  stage: string
  pipeline: string
  owner: string
  owner_initials?: string
  owner_color?: string
  score?: number
  prob?: number
  days?: number
  tags?: string[]
  phone?: string
  whatsapp?: string
  email?: string
  created_at: string
  updated_at?: string
  prosp_tipo?: string
  prosp_fonte?: string
  prosp_campanha?: string
  lead_channel?: string
  lead_source?: string
  media_platform?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  fbclid?: string
}

export interface Contact {
  id: number
  name: string
  company: string
  pos?: string
  email?: string
  phone?: string
  whatsapp?: string
  status?: string
  score?: number
  created_at?: string
  updated_at?: string
}

export interface Company {
  id: number
  name: string
  cnpj?: string
  segment?: string
  sector?: string
  city?: string
  state?: string
  phone?: string
  email?: string
  status?: string
  score?: number
  created_at?: string
}

export interface Task {
  id: number
  type: string
  status: 'pending' | 'done' | 'overdue'
  title: string
  deal_id?: number
  contact?: string
  company?: string
  owner?: string
  due?: string
  created_at?: string
}

export interface CRMUser {
  id: number
  name: string
  email?: string
  role: UserRole
  departamento?: string
  active: boolean
  color?: string
  initials?: string
  supervisor_id?: number
  created_at?: string
}

export type UserRole = 'admin' | 'supervisor' | 'vendedor' | 'sales' | 'sdr' | 'implantador' | 'cs' | 'suporte'

export interface StageHistory {
  id: string
  deal_id: number
  stage: string
  pipeline?: string
  changed_at: string
  changed_by?: string
}

// ── WhatsApp Types ──────────────────────────────────────────────

export type WAArea = 'comercial' | 'implantacao' | 'cs' | 'suporte' | 'geral'

export interface WAChannel {
  id: string
  name: string
  area: WAArea
  phone: string
  token: string
  api_url: string
  is_team: boolean
  auto_assign: boolean
  assigned_users: number[]
  color: string
  status: 'online' | 'offline' | 'connecting' | 'error'
  created_at: string
  updated_at: string
}

export interface WAConversation {
  id: string
  phone: string
  contact_name: string
  channel_id: string | null
  deal_id: number | null
  status: 'pending' | 'active' | 'resolved' | 'archived'
  assigned_to: number | null
  assigned_name: string | null
  accepted_at: string | null
  transferred_from: string | null
  transferred_at: string | null
  transfer_note: string | null
  last_msg: string
  last_msg_at: string | null
  unread_count: number
  last_read_at: string | null
  created_at: string
  updated_at: string
}

export type WAMediaType = 'image' | 'audio' | 'video' | 'document' | 'voice' | 'sticker'
export type WADirection = 'in' | 'out'
export type WAStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed' | 'received'

export interface WAMessage {
  id: string
  conv_id: string
  channel_id: string | null
  deal_id: number | null
  contact_name: string
  direction: WADirection
  body: string
  status: WAStatus
  media_type: WAMediaType | null
  media_url: string | null
  media_name: string | null
  media_size: number | null
  mime_type: string | null
  whapi_msg_id: string | null
  created_at: string
}

export interface WAInboxRow extends WAConversation {
  channel_name: string | null
  channel_area: WAArea | null
  channel_color: string | null
  total_messages: number
}

// ── UI / App Types ──────────────────────────────────────────────

export interface AppState {
  view: string
  pipeline: string
  selectedDeal: number | null
  waConv: string | null
  waChannelId: string | null
}

export const ROLE_LABELS: Record<UserRole, string> = {
  admin:       'Administrador',
  supervisor:  'Supervisor',
  vendedor:    'Vendedor',
  sales:       'Vendedor',
  sdr:         'SDR',
  implantador: 'Implantador',
  cs:          'Customer Success',
  suporte:     'Suporte',
}

export const ROLE_COLORS: Record<UserRole, string> = {
  admin:       '#4f7fff',
  supervisor:  '#7c3aed',
  vendedor:    '#10b981',
  sales:       '#10b981',
  sdr:         '#f59e0b',
  implantador: '#06b6d4',
  cs:          '#8b5cf6',
  suporte:     '#ef4444',
}

export const ROLE_ICONS: Record<UserRole, string> = {
  admin:       '👑',
  supervisor:  '🔭',
  vendedor:    '🎯',
  sales:       '🎯',
  sdr:         '📞',
  implantador: '🚀',
  cs:          '⭐',
  suporte:     '🎫',
}

export const WA_AREA_LABELS: Record<WAArea, string> = {
  comercial:   'Comercial',
  implantacao: 'Implantação',
  cs:          'Customer Success',
  suporte:     'Suporte',
  geral:       'Geral',
}

export const WA_AREA_COLORS: Record<WAArea, string> = {
  comercial:   '#4f7fff',
  implantacao: '#10b981',
  cs:          '#8b5cf6',
  suporte:     '#f59e0b',
  geral:       '#6b7280',
}

export const WA_AREA_ICONS: Record<WAArea, string> = {
  comercial:   '💼',
  implantacao: '🚀',
  cs:          '⭐',
  suporte:     '🎫',
  geral:       '💬',
}
