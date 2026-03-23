# CompetenteRev — CRM React

Stack: React 18 + TypeScript + Vite + Tailwind + Supabase + Zustand + TanStack Query

## Setup rápido

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis (já preenchidas no .env.local)
# VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY

# 3. Rodar local
npm run dev
# Abre em http://localhost:3000

# 4. Build para produção
npm run build

# 5. Deploy Vercel
# Push para GitHub → Vercel detecta automaticamente
```

## Estrutura

```
src/
  components/
    layout/     — Layout, Sidebar
    ui/         — Toast, Button, Input, Modal, etc.
    kanban/     — KanbanBoard, DealCard, StageColumn
    whatsapp/   — Inbox, ChatFeed, ChannelSidebar
    rh/         — Colaborador, PDI, OneOnOne
  hooks/
    useSupabase.ts       — React Query hooks para todas as tabelas
    useWAChannelService.ts — Serviço multi-canal WhatsApp
  lib/
    supabase.ts  — Cliente Supabase
    utils.ts     — Helpers (BRL, cn, formatPhone, etc.)
  pages/         — Uma página por rota
  stores/        — Zustand (auth, nav, WA, UI)
  types/         — TypeScript types (Database, Deal, WAMessage, etc.)
```

## Supabase

Projeto: `hxcohoabnqdzekptrauu`

Tabelas principais:
- `deals`, `contacts`, `companies`, `tasks`, `users`
- `wa_channels`, `wa_conversations_v2`, `wa_messages_v2`
- `ddp_contratos`, `cs_cards`, `impl_tickets`

Execute `supabase_wa_v2.sql` para criar as tabelas WA V2 se ainda não existirem.

## Deploy Vercel

1. Push para GitHub
2. Conectar repo no Vercel
3. Adicionar variáveis de ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy automático a cada push
