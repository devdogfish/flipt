'use client'

import { motion } from 'motion/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const ease = [0.16, 1, 0.3, 1] as const

function fadeUp(delay: number) {
  return {
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.75, ease, delay },
  }
}

export function HeroSection({ session }: { session: boolean }) {
  return (
    <section
      className={cn(
        'relative px-5 mx-auto max-w-5xl text-center overflow-hidden',
        session ? 'pt-28 pb-24' : 'pt-48 pb-32'
      )}
    >
      {/* Ambient gold glow — very subtle */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 -top-16 -translate-x-1/2 w-[800px] h-[480px]"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 0%, color-mix(in oklch, var(--gold) 12%, transparent) 0%, transparent 100%)',
        }}
      />

      {/* H1 */}
      <motion.h1
        {...fadeUp(0)}
        className="text-[clamp(2.75rem,5.5vw,5rem)] font-semibold tracking-tight leading-[1.04] mb-6"
      >
        Someone already made{' '}
        <span className="font-serif italic text-gold whitespace-nowrap">the&nbsp;deck.</span>
      </motion.h1>

      {/* Subtext */}
      <motion.p
        {...fadeUp(0.15)}
        className="text-[0.9375rem] text-muted-foreground leading-relaxed mb-10 max-w-[340px] mx-auto"
      >
        Pre-built Dal course decks. FSRS tells you exactly when to review. Or paste your notes and get cards instantly.
      </motion.p>

      {/* CTAs */}
      <motion.div
        {...fadeUp(0.27)}
        className="flex flex-col sm:flex-row items-center justify-center gap-5"
      >
        {session ? (
          <Link href="/decks">
            <Button
              size="lg"
              className="px-8 bg-gold text-[oklch(0.12_0_0)] hover:bg-gold/90 font-medium shadow-none"
            >
              Go to my decks
            </Button>
          </Link>
        ) : (
          <>
            <Link href="/auth/sign-up">
              <Button
                size="lg"
                className="bg-gold text-[oklch(0.12_0_0)] hover:bg-gold/90 font-medium shadow-none"
              >
                Get started for free
              </Button>
            </Link>
            <Link
              href="/decks"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Browse decks
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </>
        )}
      </motion.div>

    </section>
  )
}
