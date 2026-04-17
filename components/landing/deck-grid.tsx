'use client'

import { motion } from 'motion/react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight } from 'lucide-react'
import { cardGradient } from '@/lib/deck-gradient'

export interface FeaturedDeck {
  id: string
  title: string
  coverImage: string | null
  _count: { cards: number }
  owner: { name: string | null } | null
}

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
}

const card = {
  hidden: { opacity: 0, y: 18, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, damping: 20, stiffness: 240 },
  },
}

export function DeckGrid({ decks }: { decks: FeaturedDeck[] }) {
  if (decks.length === 0) return null

  return (
    <section className="px-5 py-20 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', damping: 22, stiffness: 260 }}
        >
          <h2 className="text-lg font-semibold tracking-tight">Community decks</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Shared by Dal students, free to copy and study
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <Link
            href="/decks"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            View all
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        className="grid grid-cols-2 sm:grid-cols-3 gap-4"
      >
        {decks.map((deck) => {
          const gradient = cardGradient(deck.id)
          return (
            <motion.div key={deck.id} variants={card}>
              <Link href={`/decks/${deck.id}`}>
                <motion.div
                  whileHover={{ scale: 1.03, y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="group relative aspect-[3/2] rounded-xl overflow-hidden border border-border/50 shadow-sm"
                >
                  {deck.coverImage ? (
                    <Image src={deck.coverImage} alt={deck.title} fill className="object-cover" />
                  ) : (
                    <div className={`w-full h-full bg-linear-to-br ${gradient}`} />
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white text-xs font-semibold leading-tight truncate">
                      {deck.title}
                    </p>
                    <p className="text-white/60 text-[10px] mt-0.5">
                      {deck._count.cards} cards
                      {deck.owner?.name ? ` · ${deck.owner.name}` : ''}
                    </p>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          )
        })}
      </motion.div>
    </section>
  )
}
