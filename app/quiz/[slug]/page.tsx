'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Breadcrumb from '@/components/Breadcrumb'
import { createClient } from '@/lib/supabase/client'
import type { Question } from '@/lib/types'

type AnswerState = 'unanswered' | 'correct' | 'wrong'

interface QuestionResult {
  question: Question
  selected: string | null
  state: AnswerState
}

export default function QuizPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()

  const slug = params.slug as string
  const grade = searchParams.get('grade') || ''
  const subject = searchParams.get('subject') || ''

  const [questions, setQuestions] = useState<Question[]>([])
  const [results, setResults] = useState<QuestionResult[]>([])
  const [answered, setAnswered] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [finished, setFinished] = useState(false)
  const [toast, setToast] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      setUserId(session.user.id)
      setUserEmail(session.user.email || '')

      const { data } = await supabase
        .from('questions')
        .select('*')
        .eq('topic_slug', slug)
        .order('sort_order', { ascending: true })

      if (data) {
        setQuestions(data)
        setResults(data.map((q: Question) => ({ question: q, selected: null, state: 'unanswered' as AnswerState })))
      }
      setLoading(false)
    })
  }, [slug])

  const pick = (qi: number, opt: string) => {
    if (results[qi].state !== 'unanswered') return
    const q = results[qi].question
    const isCorrect = opt === q.correct_option
    const newResults = [...results]
    newResults[qi] = { ...newResults[qi], selected: opt, state: isCorrect ? 'correct' : 'wrong' }
    setResults(newResults)

    const newAnswered = answered + 1
    const newCorrect = isCorrect ? correct + 1 : correct
    setAnswered(newAnswered)
    if (isCorrect) setCorrect(newCorrect)

    if (newAnswered === questions.length) {
      setTimeout(() => { setFinished(true); saveScore(newCorrect, questions.length) }, 500)
    }
  }

  const saveScore = async (score: number, total: number) => {
    if (!userId) return
    const pct = Math.round(score / total * 100)
    await supabase.from('attempts').insert({
      user_id: userId, email: userEmail,
      subject, grade, topic: questions[0]?.topic || slug,
      score, total, percent: pct
    })
    setToast(true)
    setTimeout(() => setToast(false), 3000)
  }

  const reset = () => {
    setResults(questions.map(q => ({ question: q, selected: null, state: 'unanswered' })))
    setAnswered(0); setCorrect(0); setFinished(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const pct = questions.length ? Math.round(correct / questions.length * 100) : 0
  const topic = questions[0]?.topic || slug

  const diffOrder: Record<string, number> = { simple: 0, easy: 1, medium: 2, hard: 3 }
  const diffColor: Record<string, string> = { simple: 'var(--easy)', easy: 'var(--easy)', medium: 'var(--medium)', hard: 'var(--hard)' }

  const grouped: Record<string, QuestionResult[]> = {}
  results.forEach(r => {
    const d = r.question.difficulty
    if (!grouped[d]) grouped[d] = []
    grouped[d].push(r)
  })
  const sortedDiffs = Object.keys(grouped).sort((a, b) => (diffOrder[a] ?? 9) - (diffOrder[b] ?? 9))

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: 'DM Mono, monospace', color: 'var(--muted)', fontSize: '0.85rem' }}>Loading questions...</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <Breadcrumb crumbs={[
        { label: 'StudyMate', href: '/' },
        { label: grade, href: '/' },
        { label: subject, href: `/grade/${grade.replace(' ','-').toLowerCase()}/${subject.toLowerCase()}` },
        { label: topic }
      ]} />

      {/* Quiz Header */}
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontFamily: 'Inter', fontSize: '1.2rem', fontWeight: 700 }}>{topic}</div>
          <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.68rem', color: 'var(--muted)', marginTop: 3, letterSpacing: '0.06em' }}>
            {grade} · {subject} · {questions.length} Questions
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 16px', fontFamily: 'DM Mono, monospace', fontSize: '0.85rem', color: 'var(--medium)' }}>
            Score: {correct} / {questions.length}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
            <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.65rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Progress</div>
            <div style={{ width: 180, height: 4, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'linear-gradient(90deg,var(--accent),var(--medium))', borderRadius: 4, width: `${questions.length ? answered / questions.length * 100 : 0}%`, transition: 'width 0.4s' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div style={{ maxWidth: 840, margin: '0 auto', padding: '32px 24px 80px' }}>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 18, marginBottom: 28, flexWrap: 'wrap' }}>
          {sortedDiffs.map(d => (
            <div key={d} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.77rem', color: 'var(--muted)', fontFamily: 'DM Mono, monospace' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: diffColor[d] }} />
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </div>
          ))}
        </div>

        {sortedDiffs.map(diff => (
          <div key={diff}>
            {/* Section separator */}
            <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.68rem', letterSpacing: '0.14em', textTransform: 'uppercase', margin: '32px 0 14px', display: 'flex', alignItems: 'center', gap: 12, color: diffColor[diff] }}>
              ⬤ {diff.charAt(0).toUpperCase() + diff.slice(1)}
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>

            {grouped[diff].map((r, localIdx) => {
              const qi = results.indexOf(r)
              const q = r.question
              const opts = [
                { key: 'a', text: q.option_a },
                { key: 'b', text: q.option_b },
                { key: 'c', text: q.option_c },
                { key: 'd', text: q.option_d },
              ]

              return (
                <div key={q.id} style={{
                  background: 'var(--card)',
                  border: `1px solid ${r.state === 'correct' ? 'var(--easy)' : r.state === 'wrong' ? 'var(--hard)' : 'var(--border)'}`,
                  borderRadius: 12, padding: '26px 28px', marginBottom: 14, position: 'relative', transition: 'border-color 0.2s'
                }}>
                  {r.state !== 'unanswered' && (
                    <span style={{ position: 'absolute', top: 18, right: 20, fontSize: '1rem', color: r.state === 'correct' ? 'var(--easy)' : 'var(--hard)' }}>
                      {r.state === 'correct' ? '✓' : '✗'}
                    </span>
                  )}

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 18 }}>
                    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.78rem', color: 'var(--accent)', minWidth: 26, paddingTop: 2 }}>Q{qi + 1}</span>
                    <span style={{ fontSize: '0.95rem', lineHeight: 1.7, flex: 1 }} dangerouslySetInnerHTML={{ __html: q.question_text }} />
                    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '3px 10px', borderRadius: 20, flexShrink: 0, background: `rgba(${diff === 'simple' || diff === 'easy' ? '62,207,142' : diff === 'medium' ? '247,201,72' : '247,111,111'},0.12)`, color: diffColor[diff] }}>
                      {diff}
                    </span>
                  </div>

                  {/* Diagram */}
                  {q.has_diagram && q.diagram_svg && (
                    <div style={{ margin: '4px 0 16px 40px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 14, display: 'inline-block' }}
                      dangerouslySetInnerHTML={{ __html: q.diagram_svg }} />
                  )}

                  {/* Options */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 9, paddingLeft: 40 }}>
                    {opts.map(opt => {
                      const isSelected = r.selected === opt.key
                      const isCorrectOpt = q.correct_option === opt.key
                      const answered = r.state !== 'unanswered'

                      let bg = 'var(--surface)', border = 'var(--border)', color = 'var(--text)'
                      if (answered && isCorrectOpt) { bg = 'rgba(62,207,142,0.05)'; border = 'var(--easy)'; color = 'var(--easy)' }
                      if (answered && isSelected && !isCorrectOpt) { bg = 'rgba(247,111,111,0.08)'; border = 'var(--hard)'; color = 'var(--hard)' }
                      if (answered && isSelected && isCorrectOpt) { bg = 'rgba(62,207,142,0.08)'; border = 'var(--easy)'; color = 'var(--easy)' }

                      return (
                        <button key={opt.key} disabled={r.state !== 'unanswered'}
                          onClick={() => pick(qi, opt.key)}
                          style={{ background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: '11px 16px', textAlign: 'left', cursor: r.state === 'unanswered' ? 'pointer' : 'default', color, fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 11, transition: 'all 0.15s' }}>
                          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.75rem', color: answered ? color : 'var(--muted)', minWidth: 16 }}>{opt.key.toUpperCase()})</span>
                          {opt.text}
                        </button>
                      )
                    })}
                  </div>

                  {/* Explanation */}
                  {r.state !== 'unanswered' && (
                    <div style={{ margin: '14px 0 0 40px', background: 'rgba(52,211,153,0.05)', borderLeft: '3px solid var(--easy)', padding: '12px 15px', borderRadius: '0 8px 8px 0', fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.65 }}
                      dangerouslySetInnerHTML={{ __html: q.explanation }} />
                  )}
                </div>
              )
            })}
          </div>
        ))}

        {/* Result Banner */}
        {finished && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 40, textAlign: 'center', marginTop: 40 }}>
            <h2 style={{ fontFamily: 'Inter', fontSize: '1.6rem', fontWeight: 700, marginBottom: 10 }}>Quiz Complete</h2>
            <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '2.6rem', color: pct >= 75 ? 'var(--easy)' : pct >= 50 ? 'var(--medium)' : 'var(--hard)', display: 'block', margin: '14px 0' }}>
              {correct} / {questions.length} ({pct}%)
            </div>
            <div style={{ color: 'var(--muted)', fontSize: '0.92rem', maxWidth: 460, margin: '0 auto', lineHeight: 1.65 }}>
              {pct >= 85 ? 'Excellent work! Strong command across the topic.' : pct >= 65 ? 'Good progress. Review the questions you missed and try again.' : 'Keep going — read each explanation carefully and retry.'}
            </div>
            <button onClick={reset} style={{ marginTop: 24, background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '11px 28px', fontFamily: 'Inter, sans-serif', fontSize: '0.92rem', fontWeight: 600, cursor: 'pointer' }}>
              Try Again
            </button>
          </div>
        )}
      </div>

      {/* Toast */}
      <div style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 999, background: 'var(--card)', border: '1px solid var(--easy)', borderRadius: 10, padding: '12px 20px', fontFamily: 'DM Mono, monospace', fontSize: '0.78rem', color: 'var(--easy)', opacity: toast ? 1 : 0, transform: toast ? 'translateY(0)' : 'translateY(8px)', transition: 'opacity 0.3s, transform 0.3s', pointerEvents: 'none' }}>
        ✓ Score saved
      </div>
    </div>
  )
}
