'use client'

import { motion } from 'motion/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function CtaSection() {
  return (
    <section className="px-5 py-24 text-center border-t border-border">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ type: 'spring', damping: 20, stiffness: 220 }}
      >
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4 max-w-xs mx-auto leading-tight">
          Ready to actually{' '}
          <span className="font-serif italic text-gold">remember things?</span>
        </h2>
        <p className="text-muted-foreground mb-8 max-w-xs mx-auto text-sm leading-relaxed">
          Sign in with your Dalhousie Microsoft account. Takes about 30 seconds.
        </p>
        <Link href="/sign-up">
          <Button
            size="lg"
            className="px-10 bg-gold text-[oklch(0.12_0_0)] hover:bg-gold/90 font-medium"
          >
            Create free account
          </Button>
        </Link>
        <p className="text-xs text-muted-foreground mt-4">
          Already have an account?{' '}
          <Link
            href="/sign-in"
            className="underline underline-offset-4 hover:text-foreground transition-colors"
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </section>
  )
}
