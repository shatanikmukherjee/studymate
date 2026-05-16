'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [tab, setTab] = useState<'signin' | 'register'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ text: string; type: 'error' | 'success' } | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push('/')
    })
  }, [])

  const signIn = async () => {
    setLoading(true); setMsg(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setMsg({ text: error.message, type: 'error' }); setLoading(false) }
    else router.push('/')
  }

  const register = async () => {
    if (!name) { setMsg({ text: 'Please enter your name.', type: 'error' }); return }
    if (password.length < 6) { setMsg({ text: 'Password must be at least 6 characters.', type: 'error' }); return }
    setLoading(true); setMsg(null)
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } })
    if (error) { setMsg({ text: error.message, type: 'error' }); setLoading(false) }
    else { setMsg({ text: 'Account created! Check your email to confirm, then sign in.', type: 'success' }); setLoading(false) }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 8, padding: '12px 14px', color: 'var(--text)',
    fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', outline: 'none',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, padding: '48px 44px', width: '100%', maxWidth: 420 }}>
        <div style={{ fontFamily: 'Inter', fontSize: '1.4rem', fontWeight: 700, marginBottom: 6 }}>
          Study<span style={{ background: 'linear-gradient(135deg,#4f8ef7,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Mate</span>
        </div>
        <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: 32 }}>University of Waterloo Prep · Grades 9–12</div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, background: 'var(--surface)', borderRadius: 10, padding: 4, marginBottom: 28 }}>
          {(['signin', 'register'] as const).map(t => (
            <button key={t} onClick={() => { setTab(t); setMsg(null) }} style={{
              flex: 1, padding: '9px', borderRadius: 8, fontFamily: 'DM Mono, monospace',
              fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase',
              cursor: 'pointer', border: tab === t ? '1px solid var(--border)' : 'none',
              background: tab === t ? 'var(--card)' : 'none',
              color: tab === t ? 'var(--text)' : 'var(--muted)',
            }}>
              {t === 'signin' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {tab === 'register' && (
            <div>
              <label style={{ display: 'block', fontFamily: 'DM Mono, monospace', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>Full Name</label>
              <input style={inputStyle} type="text" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
            </div>
          )}
          <div>
            <label style={{ display: 'block', fontFamily: 'DM Mono, monospace', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>Email</label>
            <input style={inputStyle} type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (tab === 'signin' ? signIn() : register())} />
          </div>
          <div>
            <label style={{ display: 'block', fontFamily: 'DM Mono, monospace', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>Password</label>
            <input style={inputStyle} type="password" placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (tab === 'signin' ? signIn() : register())} />
          </div>

          <button
            onClick={tab === 'signin' ? signIn : register}
            disabled={loading}
            style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '13px', fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}
          >
            {loading ? 'Please wait...' : tab === 'signin' ? 'Sign In' : 'Create Account'}
          </button>

          {msg && (
            <div style={{ padding: '11px 14px', borderRadius: 8, fontSize: '0.85rem', background: msg.type === 'error' ? 'rgba(247,111,111,0.1)' : 'rgba(62,207,142,0.1)', border: `1px solid ${msg.type === 'error' ? 'rgba(247,111,111,0.3)' : 'rgba(62,207,142,0.3)'}`, color: msg.type === 'error' ? 'var(--hard)' : 'var(--easy)' }}>
              {msg.text}
            </div>
          )}
        </div>

        <div style={{ height: 1, background: 'var(--border)', margin: '28px 0' }} />
        <div style={{ fontSize: '0.78rem', color: 'var(--muted)', textAlign: 'center', lineHeight: 1.6 }}>
          Your progress is saved automatically after every quiz.
        </div>
      </div>
    </div>
  )
}
