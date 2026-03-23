import React from 'react'
import { useNavStore } from '@/stores'
import Sidebar from './Sidebar'
import ToastContainer from '../ui/ToastContainer'

export default function Layout({ children }: { children: React.ReactNode }) {
  const { view } = useNavStore()
  const isWA = view === 'whatsapp'

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      <Sidebar />
      <main
        className="flex-1 flex flex-col overflow-hidden"
        style={{ minWidth: 0 }}
      >
        {/* WA usa 100% da altura sem padding; resto tem scroll */}
        <div className={isWA ? 'flex-1 overflow-hidden' : 'flex-1 overflow-y-auto'}>
          {children}
        </div>
      </main>
      <ToastContainer />
    </div>
  )
}
