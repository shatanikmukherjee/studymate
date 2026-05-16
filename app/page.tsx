'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/client'
import { SUBJECT_CONFIG, GRADE_CONFIG } from '@/lib/types'
import type { Subject } from '@/lib/types'

const GRADES = ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'] as const
const SUBJECTS: Subject[] = ['Math', 'Physics', 'Chemistry', 'English']
const LIVE: Record<string, Subject[]> = {
  'Grade 9':  ['Math'],
  'Grade 10': ['Math'],
  'Grade 11': [],
  'Grade 12': [],
}

export default function HomePage() {
  const [activeGrade, setActiveGrade] = useState('Grade 9')
  const [stats, setStats] = useState({ attempts: 0, best: 0, avg: 0 })
  const [userName, setUserName] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      const name = session.user.user_metadata?.full_name?.split(' ')[0] || session.user.email?.split('@')[0] || ''
      setUserName(name)
      const { data } = await supabase.from('attempts').select('percent').eq('user_id', session.user.id)
      if (data && data.length) {
        const p = data.map((d: any) => d.percent)
        setStats({ attempts: p.length, best: Math.max(...p), avg: Math.round(p.reduce((a: number, b: number) => a + b, 0) / p.length) })
      }
    })
  }, [])

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <div style={{ textAlign: 'center', padding: '32px 24px 20px' }}>
        <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12 }}>
          {userName ? `Welcome back, ${userName} 👋` : 'University of Waterloo Prep · Grades 9–12'}
        </div>
        <h1 style={{ fontFamily: 'Inter', fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 10 }}>
          Learn it.{' '}
          <span style={{ background: 'linear-gradient(135deg,#4f8ef7,#a78bfa 50%,#34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Practice it.
          </span>{' '}
          Nail it.
        </h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--muted)', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
          Interactive practice papers — scored, tracked, built for Canada's top universities.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', padding: '0 24px 24px' }}>
        {[
          { num: stats.attempts || '0', label: 'Total Attempts' },
          { num: stats.best ? `${stats.best}%` : '—', label: 'Best Score' },
          { num: stats.avg ? `${stats.avg}%` : '—', label: 'Avg Score' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 22px', textAlign: 'center', minWidth: 110 }}>
            <div style={{ fontFamily: 'Inter', fontSize: '1.7rem', fontWeight: 700, color: 'var(--accent)' }}>{s.num}</div>
            <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', overflowX: 'auto', padding: '0 40px' }}>
        {GRADES.map(g => (
          <button key={g} onClick={() => setActiveGrade(g)} style={{
            fontFamily: 'DM Mono, monospace', fontSize: '0.78rem', letterSpacing: '0.08em', textTransform: 'uppercase',
            padding: '14px 22px', border: 'none', background: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
            color: activeGrade === g ? 'var(--accent)' : 'var(--muted)',
            borderBottom: activeGrade === g ? '2px solid var(--accent)' : '2px solid transparent',
            marginBottom: -1,
          }}>
            {g}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 40px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontFamily: 'Inter', fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.02em' }}>{activeGrade}</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.87rem', marginTop: 5, lineHeight: 1.6 }}>
            {activeGrade === 'Grade 9' && 'Foundation topics — algebra, geometry, measurement, linear relations.'}
            {activeGrade === 'Grade 10' && 'Core academic year — functions, trigonometry, logarithms.'}
            {activeGrade === 'Grade 11' && 'Specialization begins — exponential functions, physics, chemistry.'}
            {activeGrade === 'Grade 12' && 'University application year — hardest content, highest stakes.'}
          </p>
        </div>
        <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase', background: 'rgba(79,142,247,0.1)', color: 'var(--accent)', padding: '6px 16px', borderRadius: 20 }}>
          {GRADE_CONFIG[activeGrade].curriculum}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 40px 60px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 18 }}>
        {SUBJECTS.map(subject => {
          const cfg = SUBJECT_CONFIG[subject]
          const isLive = LIVE[activeGrade]?.includes(subject)
          const href = `/grade/${activeGrade.replace(' ', '-').toLowerCase()}/${subject.toLowerCase()}`
          const inner = (
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: '26px 22px', display: 'flex', flexDirection: 'column', gap: 12, opacity: isLive ? 1 : 0.38, height: '100%' }}>
              <div style={{ fontSize: '2rem' }}>{cfg.icon}</div>
              <div>
                <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: cfg.color, marginBottom: 4 }}>{subject}</div>
                <div style={{ fontFamily: 'Inter', fontSize: '1.2rem', fontWeight: 700 }}>{subject}</div>
                <div style={{ fontSize: '0.83rem', color: 'var(--muted)', lineHeight: 1.6, marginTop: 6 }}>{cfg.description[activeGrade]}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 13, borderTop: '1px solid var(--border)' }}>
                {isLive
                  ? <><span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.68rem', color: 'var(--muted)' }}>Topics available</span><span style={{ color: 'var(--muted)' }}>→</span></>
                  : <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.62rem', textTransform: 'uppercase', color: 'var(--muted)', border: '1px solid var(--border)', padding: '3px 10px', borderRadius: 20 }}>Coming Soon</span>
                }
              </div>
            </div>
          )
          return isLive
            ? <Link key={subject} href={href} style={{ textDecoration: 'none', color: 'inherit' }}>{inner}</Link>
            : <div key={subject}>{inner}</div>
        })}
      </div>
    </div>
  )
}
