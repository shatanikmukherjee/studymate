'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function Navbar() {
  const [userName, setUserName] = useState('')
  const [theme, setTheme] = useState('dark')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUserName(session.user.user_metadata?.full_name?.split(' ')[0] || session.user.email?.split('@')[0] || '')
      }
    })
    const saved = localStorage.getItem('studymate-theme') || 'dark'
    setTheme(saved)
  }, [])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('studymate-theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav style={{
      background: 'rgba(8,10,16,0.88)',
      backdropFilter: 'blur(14px)',
      borderBottom: '1px solid var(--border)',
      padding: '0 40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 60,
      position: 'sticky',
      top: 0,
      zIndex: 200,
    }}>
      <Link href="/" style={{ textDecoration: 'none' }}>
        <span style={{ fontFamily: 'Inter', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>
          Study<span style={{ background: 'linear-gradient(135deg,#4f8ef7,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Mate</span>
        </span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {userName && (
          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.75rem', color: 'var(--muted)' }}>
            {userName}
          </span>
        )}
        <Link href="/history" style={navLinkStyle}>History</Link>
        <button onClick={toggleTheme} style={{ ...navLinkStyle, cursor: 'pointer', fontSize: '1rem', padding: '6px 11px' }}>
          {theme === 'dark' ? '☀' : '☽'}
        </button>
        <button onClick={signOut} style={{ ...navLinkStyle, cursor: 'pointer' }}>
          Sign Out
        </button>
      </div>
    </nav>
  )
}

const navLinkStyle: React.CSSProperties = {
  fontFamily: 'DM Mono, monospace',
  fontSize: '0.72rem',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--muted)',
  textDecoration: 'none',
  padding: '6px 13px',
  border: '1px solid var(--border)',
  borderRadius: 6,
  background: 'none',
}
