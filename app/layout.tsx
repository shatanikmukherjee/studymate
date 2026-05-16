import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'StudyMate — University of Waterloo Prep',
  description: 'Interactive practice papers for Grade 9–12 students aiming at Canada\'s top universities.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{__html:`try{const t=localStorage.getItem('studymate-theme')||'dark';document.documentElement.setAttribute('data-theme',t);}catch(e){}`}} />
      </head>
      <body>{children}</body>
    </html>
  )
}
