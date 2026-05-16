export type Grade = 'Grade 9' | 'Grade 10' | 'Grade 11' | 'Grade 12'
export type Subject = 'Math' | 'Physics' | 'Chemistry' | 'English'
export type Difficulty = 'simple' | 'easy' | 'medium' | 'hard'
export type QuizMode = 'intro' | 'challenge'

export interface Question {
  id: string
  subject: Subject
  grade: Grade
  topic: string
  topic_slug: string
  difficulty: Difficulty
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_option: 'a' | 'b' | 'c' | 'd'
  explanation: string
  has_diagram: boolean
  diagram_svg: string | null
  sort_order: number
}

export interface Attempt {
  id: string
  user_id: string
  email: string
  subject: string
  grade: string
  topic: string
  score: number
  total: number
  percent: number
  attempted_at: string
}

export interface TopicMeta {
  topic: string
  topic_slug: string
  subject: Subject
  grade: Grade
  mode: QuizMode
  question_count: number
  description: string
  is_live: boolean
}

// Subject config
export const SUBJECT_CONFIG: Record<Subject, {
  icon: string
  color: string
  glow: string
  description: Record<string, string>
}> = {
  Math: {
    icon: '∑',
    color: '#4f8ef7',
    glow: 'rgba(79,142,247,0.15)',
    description: {
      'Grade 9': 'Number sets, geometry, measurement, linear relations — MPM1D.',
      'Grade 10': 'Functions, trigonometry, logarithms — MPM2D.',
      'Grade 11': 'Exponential functions, trigonometric functions, sequences — MCR3U.',
      'Grade 12': 'Advanced functions, calculus, vectors — MHF4U/MCV4U.',
    }
  },
  Physics: {
    icon: '⚡',
    color: '#a78bfa',
    glow: 'rgba(167,139,250,0.15)',
    description: {
      'Grade 9': 'Electricity, space, biology basics — SNC1D.',
      'Grade 10': 'Climate, optics, physics basics — SNC2D.',
      'Grade 11': 'Kinematics, forces, energy, waves — SPH3U.',
      'Grade 12': 'Dynamics, electricity, modern physics — SPH4U.',
    }
  },
  Chemistry: {
    icon: '⚗',
    color: '#34d399',
    glow: 'rgba(52,211,153,0.15)',
    description: {
      'Grade 9': 'Matter, chemical reactions basics — SNC1D.',
      'Grade 10': 'Chemistry basics — SNC2D.',
      'Grade 11': 'Atomic theory, bonding, stoichiometry — SCH3U.',
      'Grade 12': 'Organic chemistry, electrochemistry — SCH4U.',
    }
  },
  English: {
    icon: '✍',
    color: '#fb923c',
    glow: 'rgba(251,146,60,0.15)',
    description: {
      'Grade 9': 'Reading, writing, media literacy — ENG1D.',
      'Grade 10': 'Literary analysis, essay writing — ENG2D.',
      'Grade 11': 'Short fiction, poetry, media — ENG3U.',
      'Grade 12': 'Rhetoric, literature, university prep — ENG4U.',
    }
  }
}

export const GRADE_CONFIG: Record<string, { label: string; curriculum: string }> = {
  'Grade 9':  { label: 'Grade 9',  curriculum: 'MPM1D · SNC1D · ENG1D' },
  'Grade 10': { label: 'Grade 10', curriculum: 'MPM2D · SNC2D · ENG2D' },
  'Grade 11': { label: 'Grade 11', curriculum: 'MCR3U · SPH3U · SCH3U' },
  'Grade 12': { label: 'Grade 12', curriculum: 'MHF4U · MCV4U · SPH4U' },
}
