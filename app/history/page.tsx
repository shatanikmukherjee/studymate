'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Breadcrumb from '@/components/Breadcrumb'
import { createClient } from '@/lib/supabase/client'

export default function HistoryPage() {
  const [attempts, setAttempts] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [filter, setFilter] = useState('All')
  const [stats, setStats] = useState({ total: 0, best: 0, avg: 0, trend: '' })
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      const { data } = await supabase.from('attempts').select('*').eq('user_id', session.user.id).order('attempted_at', { ascending: false })
      if (data) {
        setAttempts(data)
        setFiltered(data)
        const p = data.map((d: any) => d.percent)
        if (p.length) {
          const last5 = p.slice(0, 5), prev5 = p.slice(5, 10)
          const l5avg = last5.reduce((a: number, b: number) => a + b, 0) / last5.length
          const p5avg = prev5.length ? prev5.reduce((a: number, b: number) => a + b, 0) / prev5.length : l5avg
          const diff = Math.round(l5avg - p5avg)
          setStats({ total: p.length, best: Math.max(...p), avg: Math.round(p.reduce((a: number, b: number) => a + b, 0) / p.length), trend: diff > 0 ? `↑ +${diff}%` : diff < 0 ? `↓ ${diff}%` : '→ Flat' })
        }
      }
    })
  }, [])

  const setFilterAndUpdate = (f: string) => {
    setFilter(f)
    setFiltered(f === 'All' ? attempts : attempts.filter((a: any) => a.subject === f))
  }

  const pillClass = (pct: number) => pct >= 75 ? 'pill-high' : pct >= 50 ? 'pill-mid' : 'pill-low'

  return (
    <div>
      <Navbar />
      <Breadcrumb crumbs={[{ label: 'StudyMate', href: '/' }, { label: 'My History' }]} />

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 28px 80px' }}>
        <h1 style={{ fontFamily: 'Inter', fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6 }}>My History</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: 32 }}>Every quiz attempt — score, date, and topic.</p>

        {/* Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 36 }}>
          {[
            { num: stats.total, label: 'Total Attempts' },
            { num: stats.best ? `${stats.best}%` : '—', label: 'Best Score' },
            { num: stats.avg ? `${stats.avg}%` : '—', label: 'Average Score' },
            { num: stats.trend || '—', label: 'Trend (last 5)', color: stats.trend?.includes('↑') ? 'var(--easy)' : stats.trend?.includes('↓') ? 'var(--hard)' : 'var(--medium)' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px' }}>
              <div style={{ fontFamily: 'Inter', fontSize: '1.7rem', fontWeight: 700, color: (s as any).color || 'var(--accent)' }}>{s.num}</div>
              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          {['All', 'Math', 'Physics', 'Chemistry', 'English'].map(f => (
            <button key={f} onClick={() => setFilterAndUpdate(f)} style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '7px 16px', borderRadius: 20, border: '1px solid var(--border)', background: filter === f ? 'var(--accent)' : 'none', color: filter === f ? '#fff' : 'var(--muted)', cursor: 'pointer' }}>
              {f}
            </button>
          ))}
        </div>

        {/* Table */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', fontFamily: 'DM Mono, monospace', fontSize: '0.78rem', color: 'var(--muted)' }}>
              No attempts yet — pick a subject and get started.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['#', 'Topic', 'Subject', 'Grade', 'Score', 'Date'].map(h => (
                    <th key={h} style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', padding: '13px 20px', textAlign: 'left', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((a, i) => (
                  <tr key={a.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <td style={{ padding: '13px 20px', fontFamily: 'DM Mono, monospace', fontSize: '0.75rem', color: 'var(--muted)' }}>{filtered.length - i}</td>
                    <td style={{ padding: '13px 20px', fontWeight: 500 }}>{a.topic}</td>
                    <td style={{ padding: '13px 20px', fontFamily: 'DM Mono, monospace', fontSize: '0.78rem', color: 'var(--muted)' }}>{a.subject}</td>
                    <td style={{ padding: '13px 20px', fontFamily: 'DM Mono, monospace', fontSize: '0.78rem', color: 'var(--muted)' }}>{a.grade}</td>
                    <td style={{ padding: '13px 20px' }}>
                      <span className={pillClass(a.percent)} style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.75rem', padding: '3px 12px', borderRadius: 20, display: 'inline-block' }}>
                        {a.score}/{a.total} · {a.percent}%
                      </span>
                    </td>
                    <td style={{ padding: '13px 20px', fontFamily: 'DM Mono, monospace', fontSize: '0.75rem', color: 'var(--muted)' }}>
                      {new Date(a.attempted_at).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
