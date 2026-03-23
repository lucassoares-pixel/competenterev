import React, { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores'
import Layout from '@/components/layout/Layout'
import LoginPage from '@/pages/LoginPage'

// Pages — lazy para melhorar o carregamento inicial

const Dashboard      = lazy(() => import('@/pages/DashboardPage'))
const KanbanPage     = lazy(() => import('@/pages/KanbanPage'))
const ContactsPage   = lazy(() => import('@/pages/ContactsPage'))
const CompaniesPage  = lazy(() => import('@/pages/CompaniesPage'))
const WhatsAppPage   = lazy(() => import('@/pages/WhatsAppPage'))
const ActivitiesPage = lazy(() => import('@/pages/ActivitiesPage'))
const RelatoriosPage = lazy(() => import('@/pages/RelatoriosPage'))
const FinanceiroPage = lazy(() => import('@/pages/FinanceiroPage'))
const ImplantacaoPage= lazy(() => import('@/pages/ImplantacaoPage'))
const CSPage         = lazy(() => import('@/pages/CSPage'))
const TicketsPage    = lazy(() => import('@/pages/TicketsPage'))
const RHPage         = lazy(() => import('@/pages/RHPage'))
const ConfigPage     = lazy(() => import('@/pages/ConfigPage'))

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
        <span className="text-[var(--text-muted)] text-xs">Carregando...</span>
      </div>
    </div>
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Suspense fallback={<LoadingFallback />}>
                  <Routes>
                    <Route path="/"              element={<Dashboard />} />
                    <Route path="/kanban"         element={<KanbanPage />} />
                    <Route path="/contacts"       element={<ContactsPage />} />
                    <Route path="/companies"      element={<CompaniesPage />} />
                    <Route path="/whatsapp"       element={<WhatsAppPage />} />
                    <Route path="/activities"     element={<ActivitiesPage />} />
                    <Route path="/relatorios/*"   element={<RelatoriosPage />} />
                    <Route path="/financeiro"     element={<FinanceiroPage />} />
                    <Route path="/implantacao"    element={<ImplantacaoPage />} />
                    <Route path="/cs"             element={<CSPage />} />
                    <Route path="/tickets"        element={<TicketsPage />} />
                    <Route path="/rh/*"           element={<RHPage />} />
                    <Route path="/config/*"       element={<ConfigPage />} />
                    <Route path="*"              element={<Navigate to="/" replace />} />
                  </Routes>
                </Suspense>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
