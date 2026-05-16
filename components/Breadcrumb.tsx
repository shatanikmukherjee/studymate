import Link from 'next/link'

interface Crumb { label: string; href?: string }

export default function Breadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <div style={{
      padding: '13px 40px',
      display: 'flex',
      alignItems: 'center',
      gap: 9,
      borderBottom: '1px solid var(--border)',
      background: 'var(--surface)',
      fontFamily: 'DM Mono, monospace',
      fontSize: '0.73rem',
    }}>
      {crumbs.map((c, i) => (
        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          {c.href ? (
            <Link href={c.href} style={{ color: 'var(--muted)', textDecoration: 'none' }}>{c.label}</Link>
          ) : (
            <span style={{ color: 'var(--accent)' }}>{c.label}</span>
          )}
          {i < crumbs.length - 1 && <span style={{ color: 'var(--border)' }}>/</span>}
        </span>
      ))}
    </div>
  )
}
