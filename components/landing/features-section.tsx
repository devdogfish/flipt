'use client'

import { motion } from 'motion/react'
import { BookOpen, Brain, Sparkles } from 'lucide-react'

const FEATURES = [
  {
    icon: <BookOpen className="w-5 h-5" />,
    title: 'Dal course library',
    desc: 'Browse pre-built decks for PSYC 1011, BIOL 1010, CHEM 1011, STAT 1060, and more. Community-maintained, growing every semester.',
  },
  {
    icon: <Brain className="w-5 h-5" />,
    title: 'FSRS algorithm',
    desc: "The best spaced repetition algorithm out there. It figures out exactly when to show you each card — not too soon, not too late.",
  },
  {
    icon: <Sparkles className="w-5 h-5" />,
    title: 'Paste your notes',
    desc: 'Drop in your lecture slides or study notes. Get high-quality flashcards in seconds. No reformatting, no setup.',
  },
]

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.11, delayChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, damping: 20, stiffness: 240 },
  },
}

export function FeaturesSection() {
  return (
    <section className="px-5 py-20 border-y border-border bg-muted/20">
      <div className="max-w-3xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ type: 'spring', damping: 22, stiffness: 260 }}
          className="text-2xl font-semibold tracking-tight text-center mb-12"
        >
          Built for how Dal students actually study
        </motion.h2>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          className="grid sm:grid-cols-3 gap-10"
        >
          {FEATURES.map((f) => (
            <motion.div key={f.title} variants={item} className="space-y-3">
              <div className="w-10 h-10 rounded-xl border border-border flex items-center justify-center text-gold">
                {f.icon}
              </div>
              <h3 className="font-semibold text-sm">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
