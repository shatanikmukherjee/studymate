'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Breadcrumb from '@/components/Breadcrumb'
import { createClient } from '@/lib/supabase/client'
import { SUBJECT_CONFIG } from '@/lib/types'
import type { Subject } from '@/lib/types'

interface TopicRow {
  topic: string
  topic_slug: string
  difficulty: string
  count: number
}

export default function SubjectPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()

  const grade = (params.grade as string).replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) // grade-9 → Grade 9
  const subject = (params.subject as string).replace(/\b\w/g, l => l.toUpperCase()) as Subject // math → Math

  const [topics, setTopics] = useState<any[]>([])
  const [bestScores, setBestScores] = useState<Record<string, number>>({})
  const [gradeStats, setGradeStats] = useState({ attempts: 0, best: 0 })
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      setUserId(session.user.id)

      // Load distinct topics for this grade/subject
      const { data: qs } = await supabase
        .from('questions')
        .select('topic, topic_slug, difficulty')
        .eq('grade', grade)
        .eq('subject', subject)

      if (qs) {
        // Group by topic_slug
        const map: Record<string, { topic: string; topic_slug: string; difficulties: string[] }> = {}
        qs.forEach((q: any) => {
          if (!map[q.topic_slug]) map[q.topic_slug] = { topic: q.topic, topic_slug: q.topic_slug, difficulties: [] }
          map[q.topic_slug].difficulties.push(q.difficulty)
        })
        setTopics(Object.values(map))
      }

      // Load best scores per topic
      const { data: attempts } = await supabase
        .from('attempts')
        .select('topic, percent')
        .eq('user_id', session.user.id)
        .eq('subject', subject)
        .eq('grade', grade)
        .order('percent', { ascending: false })

      if (attempts && attempts.length) {
        const best: Record<string, number> = {}
        attempts.forEach((a: any) => { if (!best[a.topic]) best[a.topic] = a.percent })
        setBestScores(best)
        setGradeStats({ attempts: attempts.length, best: Math.max(...attempts.map((a: any) => a.percent)) })
      }
    })
  }, [])

  const cfg = SUBJECT_CONFIG[subject] || SUBJECT_CONFIG['Math']
  const isIntro = (slug: string) => slug.includes('-intro') || ['geometry', 'linear-relationships', 'measurement-geometry', 'number-sets'].includes(slug)

  const introTopics = topics.filter(t => isIntro(t.topic_slug))
  const challengeTopics = topics.filter(t => !isIntro(t.topic_slug))

  const TopicCard = ({ t }: { t: any }) => (
    <Link href={`/quiz/${t.topic_slug}?grade=${encodeURIComponent(grade)}&subject=${encodeURIComponent(subject)}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 22, display: 'flex', flexDirection: 'column', gap: 10, cursor: 'pointer', transition: 'border-color 0.2s, transform 0.2s' }}
        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--accent)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLDivElement).style.transform = 'none'; }}>
        <div style={{ fontFamily: 'Inter', fontSize: '1rem', fontWeight: 700 }}>{t.topic}</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '3px 10px', borderRadius: 20, background: 'rgba(79,142,247,0.1)', color: 'var(--accent)' }}>
            {t.difficulties.length} Questions
          </span>
          {bestScores[t.topic] && (
            <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.65rem', padding: '2px 9px', borderRadius: 20, background: 'rgba(62,207,142,0.1)', color: '#3ecf8e' }}>
              Best: {bestScores[t.topic]}%
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid var(--border)', marginTop: 'auto' }}>
          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.68rem', color: 'var(--muted)' }}>
            {[...new Set(t.difficulties)].join(' · ')}
          </span>
          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.7rem', color: 'var(--accent)' }}>Start →</span>
        </div>
      </div>
    </Link>
  )

  return (
    <div>
      <Navbar />
      <Breadcrumb crumbs={[{ label: 'StudyMate', href: '/' }, { label: grade, href: '/' }, { label: subject }]} />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 40px 24px' }}>
        <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: cfg.color, marginBottom: 10 }}>{grade} · {subject}</div>
        <h1 style={{ fontFamily: 'Inter', fontSize: 'clamp(1.8rem,3.5vw,2.5rem)', fontWeight: 700, letterSpacing: '-0.02em' }}>{grade} {subject}</h1>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 40px 16px', display: 'flex', gap: 14 }}>
        {[
          { num: gradeStats.attempts || 0, label: 'Attempts' },
          { num: gradeStats.best ? `${gradeStats.best}%` : '—', label: 'Best Score' },
          { num: topics.length, label: 'Topics Live' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 20px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'Inter', fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent)' }}>{s.num}</div>
            <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 40px 80px' }}>
        {topics.length === 0 && (
          <div style={{ padding: '60px 0', textAlign: 'center', fontFamily: 'DM Mono, monospace', fontSize: '0.8rem', color: 'var(--muted)' }}>
            No topics available yet — check back soon.
          </div>
        )}

        {introTopics.length > 0 && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '32px 0 18px' }}>
              <h2 style={{ fontFamily: 'Inter', fontSize: '0.95rem', fontWeight: 700, whiteSpace: 'nowrap' }}>Intro Topics</h2>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.68rem', color: '#3ecf8e', whiteSpace: 'nowrap' }}>Teaching Aid · 10 Simple · 6 Medium · 4 Hard</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(290px,1fr))', gap: 14 }}>
              {introTopics.map(t => <TopicCard key={t.topic_slug} t={t} />)}
            </div>
          </>
        )}

        {challengeTopics.length > 0 && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '40px 0 18px' }}>
              <h2 style={{ fontFamily: 'Inter', fontSize: '0.95rem', fontWeight: 700, whiteSpace: 'nowrap' }}>Challenge Topics</h2>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.68rem', color: 'var(--hard)', whiteSpace: 'nowrap' }}>UWaterloo Style · 4 Easy · 6 Medium · 10 Hard</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(290px,1fr))', gap: 14 }}>
              {challengeTopics.map(t => <TopicCard key={t.topic_slug} t={t} />)}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
