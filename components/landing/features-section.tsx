'use client'

import { useRef } from 'react'
import { motion, useInView } from 'motion/react'

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

// ─── FSRS chip animation ─────────────────────────────────────────────────────
// Chip-style visual inspired by IC package diagrams.
// Chip body always renders as the inverse of the current theme.

const VW = 320, VH = 200

// Chip body
const CH_X = 82, CH_Y = 36, CH_W = 156, CH_H = 108
const CX = CH_X + CH_W / 2   // 160
const CY = CH_Y + CH_H / 2   // 90
const CB = CH_Y + CH_H        // 144
const CR = CH_X + CH_W        // 238

// Top/bottom pins (vertical, 6 per side, gap in centre)
const TP_W = 13, TP_H = 20
const TOP_PIN_XS = [97, 115, 133, 187, 205, 223]

// Left/right pins (horizontal, 3 per side)
const SP_W = 20, SP_H = 13
const SIDE_PIN_YS = [60, 90, 120]

// Derived pin tip positions
const TOP_TIP_Y = CH_Y - TP_H   // 16  — top of top pins
const BOT_TIP_Y = CB + TP_H     // 164 — bottom of bottom pins
const L_TIP_X   = CH_X - SP_W   // 62  — left of left pins
const R_TIP_X   = CR + SP_W     // 258 — right of right pins

function FsrsVisual() {
  const ref    = useRef<SVGSVGElement>(null)
  const inView = useInView(ref, { once: true, margin: '-20px' })

  return (
    <svg ref={ref} viewBox={`0 0 ${VW} ${VH}`} className="w-full block" aria-hidden="true">
      <defs>
        <filter id="feat-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Subtle inner highlight to give chip a 3-D face */}
        <linearGradient id="chip-face" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity={0.09} />
          <stop offset="100%" stopColor="black" stopOpacity={0.06} />
        </linearGradient>
      </defs>

      {/* ── Traces: top pins → SVG top edge ─────────────────────────── */}
      {TOP_PIN_XS.map((x, i) => (
        <motion.line key={`tt-${i}`}
          x1={x} y1={0} x2={x} y2={TOP_TIP_Y}
          stroke="var(--border)" strokeWidth={1.5}
          initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.08 + i * 0.03 }}
        />
      ))}

      {/* ── Traces: bottom pins → SVG bottom edge ───────────────────── */}
      {TOP_PIN_XS.map((x, i) => (
        <motion.line key={`bt-${i}`}
          x1={x} y1={BOT_TIP_Y} x2={x} y2={VH}
          stroke="var(--border)" strokeWidth={1.5}
          initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.08 + i * 0.03 }}
        />
      ))}

      {/* ── Traces: left pins → SVG left edge ───────────────────────── */}
      {SIDE_PIN_YS.map((y, i) => (
        <motion.line key={`lt-${i}`}
          x1={0} y1={y} x2={L_TIP_X} y2={y}
          stroke="var(--border)" strokeWidth={1.5}
          initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.12 + i * 0.04 }}
        />
      ))}

      {/* ── Traces: right pins → SVG right edge ─────────────────────── */}
      {SIDE_PIN_YS.map((y, i) => (
        <motion.line key={`rt-${i}`}
          x1={R_TIP_X} y1={y} x2={VW} y2={y}
          stroke="var(--border)" strokeWidth={1.5}
          initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.12 + i * 0.04 }}
        />
      ))}

      {/* ── Top pins ─────────────────────────────────────────────────── */}
      {TOP_PIN_XS.map((x, i) => (
        <motion.rect key={`tp-${i}`}
          x={x - TP_W / 2} y={TOP_TIP_Y} width={TP_W} height={TP_H} rx={3}
          fill="var(--foreground)" fillOpacity={0.7}
          initial={{ opacity: 0, scaleY: 0 }}
          animate={inView ? { opacity: 1, scaleY: 1 } : {}}
          style={{ transformOrigin: `${x}px ${CH_Y}px` }}
          transition={{ delay: 0.18 + i * 0.04, type: 'spring', damping: 16, stiffness: 320 }}
        />
      ))}

      {/* ── Bottom pins ──────────────────────────────────────────────── */}
      {TOP_PIN_XS.map((x, i) => (
        <motion.rect key={`bp-${i}`}
          x={x - TP_W / 2} y={CB} width={TP_W} height={TP_H} rx={3}
          fill="var(--foreground)" fillOpacity={0.7}
          initial={{ opacity: 0, scaleY: 0 }}
          animate={inView ? { opacity: 1, scaleY: 1 } : {}}
          style={{ transformOrigin: `${x}px ${CB}px` }}
          transition={{ delay: 0.18 + i * 0.04, type: 'spring', damping: 16, stiffness: 320 }}
        />
      ))}

      {/* ── Left pins ────────────────────────────────────────────────── */}
      {SIDE_PIN_YS.map((y, i) => (
        <motion.rect key={`lp-${i}`}
          x={L_TIP_X} y={y - SP_H / 2} width={SP_W} height={SP_H} rx={3}
          fill="var(--foreground)" fillOpacity={0.7}
          initial={{ opacity: 0, scaleX: 0 }}
          animate={inView ? { opacity: 1, scaleX: 1 } : {}}
          style={{ transformOrigin: `${CH_X}px ${y}px` }}
          transition={{ delay: 0.2 + i * 0.05, type: 'spring', damping: 16, stiffness: 320 }}
        />
      ))}

      {/* ── Right pins ───────────────────────────────────────────────── */}
      {SIDE_PIN_YS.map((y, i) => (
        <motion.rect key={`rp-${i}`}
          x={CR} y={y - SP_H / 2} width={SP_W} height={SP_H} rx={3}
          fill="var(--foreground)" fillOpacity={0.7}
          initial={{ opacity: 0, scaleX: 0 }}
          animate={inView ? { opacity: 1, scaleX: 1 } : {}}
          style={{ transformOrigin: `${CR}px ${y}px` }}
          transition={{ delay: 0.2 + i * 0.05, type: 'spring', damping: 16, stiffness: 320 }}
        />
      ))}

      {/* ── Chip body ────────────────────────────────────────────────── */}
      <motion.rect
        x={CH_X} y={CH_Y} width={CH_W} height={CH_H} rx={16}
        fill="var(--foreground)"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        style={{ transformOrigin: `${CX}px ${CY}px` }}
        transition={{ duration: 0.4, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
      />
      {/* Top-face gradient overlay for 3-D depth */}
      <motion.rect
        x={CH_X + 1} y={CH_Y + 1} width={CH_W - 2} height={CH_H - 2} rx={15}
        fill="url(#chip-face)"
        initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 0.28 }}
      />
      {/* Inset border line */}
      <motion.rect
        x={CH_X + 6} y={CH_Y + 6} width={CH_W - 12} height={CH_H - 12} rx={11}
        fill="none" stroke="var(--background)" strokeOpacity={0.08} strokeWidth={1}
        initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 0.32 }}
      />

      {/* ── Chip label ───────────────────────────────────────────────── */}
      <motion.text
        x={CX} y={CY - 7}
        textAnchor="middle" dominantBaseline="middle"
        fontSize={24} fontWeight={700}
        fontFamily="system-ui, -apple-system, sans-serif"
        fill="var(--background)" letterSpacing={7}
        initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 0.32 }}
      >
        FSRS
      </motion.text>
      <motion.text
        x={CX} y={CY + 15}
        textAnchor="middle"
        fontSize={8.5} letterSpacing={1}
        fontFamily="ui-monospace, monospace"
        fill="var(--background)" fillOpacity={0.38}
        initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 0.4 }}
      >
        spaced repetition · v5
      </motion.text>

      {/* ── Particles ────────────────────────────────────────────────── */}
      {inView && (
        <>
          {/* Top — flowing in */}
          <circle r={3} style={{ fill: '#60a5fa', fillOpacity: 0.95 }} filter="url(#feat-glow)">
            <animateMotion dur="2.0s" begin="0s" repeatCount="indefinite" calcMode="paced"
              path={`M ${TOP_PIN_XS[0]} 0 L ${TOP_PIN_XS[0]} ${TOP_TIP_Y}`} />
          </circle>
          <circle r={3} style={{ fill: '#fb923c', fillOpacity: 0.95 }} filter="url(#feat-glow)">
            <animateMotion dur="2.4s" begin="0.6s" repeatCount="indefinite" calcMode="paced"
              path={`M ${TOP_PIN_XS[5]} 0 L ${TOP_PIN_XS[5]} ${TOP_TIP_Y}`} />
          </circle>
          {/* Bottom — flowing out */}
          <circle r={3} style={{ fill: '#60a5fa', fillOpacity: 0.95 }} filter="url(#feat-glow)">
            <animateMotion dur="2.1s" begin="0.4s" repeatCount="indefinite" calcMode="paced"
              path={`M ${TOP_PIN_XS[2]} ${BOT_TIP_Y} L ${TOP_PIN_XS[2]} ${VH}`} />
          </circle>
          <circle r={3} style={{ fill: '#fb923c', fillOpacity: 0.95 }} filter="url(#feat-glow)">
            <animateMotion dur="1.9s" begin="1.0s" repeatCount="indefinite" calcMode="paced"
              path={`M ${TOP_PIN_XS[3]} ${BOT_TIP_Y} L ${TOP_PIN_XS[3]} ${VH}`} />
          </circle>
          {/* Left — flowing in */}
          <circle r={3} style={{ fill: '#FFD400', fillOpacity: 0.95 }} filter="url(#feat-glow)">
            <animateMotion dur="2.3s" begin="0.2s" repeatCount="indefinite" calcMode="paced"
              path={`M 0 ${SIDE_PIN_YS[1]} L ${L_TIP_X} ${SIDE_PIN_YS[1]}`} />
          </circle>
          {/* Right — flowing in */}
          <circle r={3} style={{ fill: '#FFD400', fillOpacity: 0.95 }} filter="url(#feat-glow)">
            <animateMotion dur="2.3s" begin="1.15s" repeatCount="indefinite" calcMode="paced"
              path={`M ${VW} ${SIDE_PIN_YS[1]} L ${R_TIP_X} ${SIDE_PIN_YS[1]}`} />
          </circle>
        </>
      )}
    </svg>
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
    visualClass: '',
  },
  {
    title: 'FSRS algorithm',
    desc: 'The best spaced repetition algorithm out there. Shows you each card exactly when you need it — not too soon, not too late.',
    visual: <FsrsVisual />,
    visualClass: '',
  },
  {
    title: 'Paste your notes',
    desc: 'Drop in your lecture slides or PDF. Get high-quality flashcards in seconds. No reformatting, no setup.',
    visual: <AiVisual />,
    visualClass: '',
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
            <div className={['mt-auto border-t border-[var(--border)] bg-muted/20 px-6 py-6 overflow-hidden', cell.visualClass].filter(Boolean).join(' ')}>
              {cell.visual}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
