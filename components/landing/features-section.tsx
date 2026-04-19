'use client'

import { motion } from 'motion/react'

// ─── Cell visuals ─────────────────────────────────────────────────────────────

function CourseLibraryVisual() {
  const courses = [
    { code: 'PSYC 1011', name: 'Introduction to Psychology', cards: 312 },
    { code: 'BIOL 1010', name: 'Principles of Biology', cards: 248 },
    { code: 'CHEM 1011', name: 'General Chemistry I', cards: 195 },
    { code: 'STAT 1060', name: 'Introduction to Statistics', cards: 167 },
  ]
  return (
    <div className="space-y-1.5">
      {courses.map((c) => (
        <div
          key={c.code}
          className="flex items-center gap-3 px-3 py-2 rounded-lg border border-border bg-background"
        >
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-mono text-muted-foreground/50 leading-none mb-0.5">
              {c.code}
            </p>
            <p className="text-[11px] font-medium text-foreground truncate">{c.name}</p>
          </div>
          <span className="text-[9px] font-mono text-muted-foreground/40 shrink-0">
            {c.cards}c
          </span>
        </div>
      ))}
    </div>
  )
}

function FsrsVisual() {
  const ratings = [
    { label: 'Again', days: '<1d', active: false },
    { label: 'Hard', days: '3d', active: false },
    { label: 'Good', days: '21d', active: true },
    { label: 'Easy', days: '45d', active: false },
  ]
  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-border bg-background p-4">
        <p className="text-[9px] font-mono text-muted-foreground/40 mb-1.5">Q</p>
        <p className="text-[11px] text-foreground leading-relaxed">
          What is the difference between classical and operant conditioning?
        </p>
      </div>
      <div className="flex gap-1.5">
        {ratings.map((r) => (
          <div
            key={r.label}
            className={[
              'flex-1 flex flex-col items-center py-2 rounded-lg border',
              r.active
                ? 'border-gold/60 bg-gold/10'
                : 'border-[var(--border)] bg-background',
            ].join(' ')}
          >
            <span className={`text-[9px] font-mono font-medium ${r.active ? 'text-gold' : 'text-foreground/70'}`}>
              {r.label}
            </span>
            <span className={`text-[8px] font-mono mt-0.5 ${r.active ? 'text-gold/70' : 'text-muted-foreground'}`}>
              {r.days}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function AiVisual() {
  const cards = [
    'What are the two types of conditioning in behaviourism?',
    'Define long-term potentiation (LTP).',
    'Explain the difference between recall and recognition.',
  ]
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2.5 py-2 px-3 rounded-lg border border-border bg-background">
        <span className="text-[9px] font-mono text-muted-foreground/50 border border-border rounded px-1.5 py-0.5 shrink-0">
          PDF
        </span>
        <span className="text-[10px] text-muted-foreground truncate">
          PSYC 1011 — Lecture 7.pdf
        </span>
      </div>
      {cards.map((q, i) => (
        <div
          key={i}
          className="rounded-lg border border-border bg-background px-3 py-2.5"
        >
          <p className="text-[9px] font-mono text-gold mb-1">Q</p>
          <p className="text-[10px] text-foreground leading-relaxed">{q}</p>
        </div>
      ))}
    </div>
  )
}

// ─── Grid ─────────────────────────────────────────────────────────────────────

const CELLS = [
  {
    title: 'Dal course library',
    desc: 'Pre-built decks for PSYC 1011, BIOL 1010, CHEM 1011, STAT 1060, and more. Community-maintained, growing every semester.',
    visual: <CourseLibraryVisual />,
  },
  {
    title: 'FSRS algorithm',
    desc: 'The best spaced repetition algorithm out there. Shows you each card exactly when you need it — not too soon, not too late.',
    visual: <FsrsVisual />,
  },
  {
    title: 'Paste your notes',
    desc: 'Drop in your lecture slides or PDF. Get high-quality flashcards in seconds. No reformatting, no setup.',
    visual: <AiVisual />,
  },
]

// ─── Export ───────────────────────────────────────────────────────────────────

export function FeaturesSection() {
  return (
    <section className="border-y border-[var(--border)]">
      <div className="max-w-5xl mx-auto grid sm:grid-cols-3">
        {CELLS.map((cell, i) => (
          <motion.div
            key={cell.title}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ type: 'spring', damping: 22, stiffness: 260, delay: i * 0.07 }}
            className={[
              'flex flex-col',
              // mobile: border between rows
              i < CELLS.length - 1 ? 'border-b border-[var(--border)] sm:border-b-0' : '',
              // desktop: border between columns
              i < CELLS.length - 1 ? 'sm:border-r sm:border-[var(--border)]' : '',
            ].join(' ')}
          >
            {/* Text zone */}
            <div className="px-8 pt-8 pb-6">
              <h3 className="font-semibold tracking-tight mb-2">{cell.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{cell.desc}</p>
            </div>

            {/* Visual zone */}
            <div className="mt-auto border-t border-[var(--border)] bg-muted/20 px-6 py-6 overflow-hidden">
              {cell.visual}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
