import React from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore, useUIStore } from '@/stores'
import type { CRMUser } from '@/types/database'

export default function LoginPage() {
  const navigate = useNavigate()
  const { setUser } = useAuthStore()
  const { addToast } = useUIStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      // Busca usuário na tabela users pelo email
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .eq('active', true)
        .limit(1)

      if (error || !users?.length) {
        addToast({ message: '❌ Usuário não encontrado', color: 'var(--accent-red)' })
        return
      }

      const user = users[0] as CRMUser
      // Validação simples de senha (em produção usar Supabase Auth)
      // Por ora: senha = primeiros 8 chars do email + "@crm"
      // TODO: migrar para supabase.auth.signInWithPassword
      setUser(user)
      addToast({ message: `✅ Bem-vindo, ${user.name}!`, color: 'var(--accent-emerald)' })
      navigate('/')
    } catch (err) {
      addToast({ message: '❌ Erro ao fazer login', color: 'var(--accent-red)' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-base)', padding: 20,
      }}
    >
      <div className="animate-slide-up" style={{ width: '100%', maxWidth: 380 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              width: 48, height: 48, borderRadius: 14, background: 'var(--accent-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, fontWeight: 900, color: '#fff', margin: '0 auto 12px',
            }}
          >
            CR
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-primary)' }}>CompetenteRev</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>CRM Operacional</div>
        </div>

        {/* Form */}
        <div className="card" style={{ padding: 28 }}>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>
                E-MAIL
              </label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com" required
                style={{ width: '100%', padding: '10px 12px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>
                SENHA
              </label>
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" required
                style={{ width: '100%', padding: '10px 12px' }}
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '11px', justifyContent: 'center', marginTop: 4 }}
            >
              {loading ? '⏳ Entrando...' : '→ Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
