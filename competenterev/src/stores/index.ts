import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CRMUser, WAChannel } from '@/types/database'

// ── Auth Store ──────────────────────────────────────────────────
interface AuthState {
  user: CRMUser | null
  token: string | null
  setUser: (user: CRMUser | null) => void
  setToken: (token: string | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      logout: () => set({ user: null, token: null }),
    }),
    { name: 'crm:auth' }
  )
)

// ── Navigation Store ────────────────────────────────────────────
interface NavState {
  view: string
  pipeline: string
  selectedDealId: number | null
  waConvId: string | null
  waChannelId: string | null
  dealTab: string
  contactSearch: string
  contactFilter: string
  setView: (view: string) => void
  setPipeline: (pipeline: string) => void
  setSelectedDeal: (id: number | null) => void
  setWaConv: (id: string | null) => void
  setWaChannel: (id: string | null) => void
  setDealTab: (tab: string) => void
  navTo: (view: string, params?: Partial<NavState>) => void
}

export const useNavStore = create<NavState>()(
  persist(
    (set) => ({
      view: 'dashboard',
      pipeline: 'vendas',
      selectedDealId: null,
      waConvId: null,
      waChannelId: null,
      dealTab: 'Tudo',
      contactSearch: '',
      contactFilter: 'all',
      setView: (view) => set({ view }),
      setPipeline: (pipeline) => set({ pipeline }),
      setSelectedDeal: (id) => set({ selectedDealId: id }),
      setWaConv: (id) => set({ waConvId: id }),
      setWaChannel: (id) => set({ waChannelId: id }),
      setDealTab: (tab) => set({ dealTab: tab }),
      navTo: (view, params) => set({ view, selectedDealId: null, ...params }),
    }),
    { name: 'crm:nav', partialize: (s) => ({ view: s.view, pipeline: s.pipeline }) }
  )
)

// ── WA Channels Store (local cache) ────────────────────────────
interface WAChannelStore {
  channels: WAChannel[]
  setChannels: (channels: WAChannel[]) => void
  updateChannel: (id: string, data: Partial<WAChannel>) => void
}

export const useWAStore = create<WAChannelStore>()(
  persist(
    (set) => ({
      channels: [],
      setChannels: (channels) => set({ channels }),
      updateChannel: (id, data) =>
        set((s) => ({ channels: s.channels.map((c) => (c.id === id ? { ...c, ...data } : c)) })),
    }),
    { name: 'crm:wa_channels_meta' }
  )
)

// ── UI Store (não persiste) ─────────────────────────────────────
interface UIState {
  sidebarOpen: boolean
  theme: 'dark' | 'light'
  toasts: Toast[]
  toggleSidebar: () => void
  setTheme: (theme: 'dark' | 'light') => void
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

export interface Toast {
  id: string
  message: string
  color?: string
  duration?: number
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  theme: 'dark',
  toasts: [],
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setTheme: (theme) => set({ theme }),
  addToast: (toast) => {
    const id = Math.random().toString(36).slice(2)
    set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }))
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
    }, toast.duration ?? 3000)
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))
