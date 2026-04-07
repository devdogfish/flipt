"use client"

import { useEffect } from "react"
import Link from "next/link"
import { motion, useMotionValue, useTransform, animate } from "motion/react"
import { Button } from "@/components/ui/button"

interface CardData {
  id: string
  question: string
  answer: string
  image?: string
  familiarity: number
}

interface SessionCompleteProps {
  correctCount: number
  totalCards: number
  wrongCards: CardData[]
  dueCards: CardData[]
  onRestart: () => void
  onStudyWrong: () => void
  onStudyDue: () => void
}

export function SessionComplete({
  correctCount,
  totalCards,
  wrongCards,
  dueCards,
  onRestart,
  onStudyWrong,
  onStudyDue,
}: SessionCompleteProps) {
  const percentage = Math.round((correctCount / totalCards) * 100)

  const count = useMotionValue(0)
  const rounded = useTransform(count, (v) => Math.round(v))

  useEffect(() => {
    const audio = new Audio("/sounds/completed-task.mp3")
    audio.volume = 0.3
    audio.play().catch(() => {})

    const controls = animate(count, percentage, { duration: 1.2, ease: "easeOut" })
    return () => controls.stop()
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "KeyR") onRestart()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onRestart])

  const container = {
    initial: {},
    animate: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
  }

  const item = {
    initial: { opacity: 0, y: 12 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      },
    },
  }

  return (
    <motion.div
      className="flex flex-col items-center justify-center px-5 text-center"
      variants={container}
      initial="initial"
      animate="animate"
    >
      <motion.p
        className="text-6xl sm:text-7xl font-semibold tracking-tight"
        variants={item}
      >
        <motion.span>{rounded}</motion.span>%
      </motion.p>

      <motion.p className="mt-3 text-muted-foreground" variants={item}>
        {correctCount} of {totalCards} correct
      </motion.p>

      <motion.div
        className="mt-6 flex flex-col items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.25, delay: 0.35 } }}
      >
        {wrongCards.length > 0 && (
          <Button size="lg" onClick={onStudyWrong} className="active:scale-[0.98]">
            Study wrong answers ({wrongCards.length})
          </Button>
        )}

        {dueCards.length > 0 && (
          <Button size="lg" variant="outline" onClick={onStudyDue} className="active:scale-[0.98]">
            Study due cards ({dueCards.length})
          </Button>
        )}

        <Button
          size="lg"
          variant={wrongCards.length > 0 || dueCards.length > 0 ? "outline" : "default"}
          onClick={onRestart}
          className="active:scale-[0.98]"
        >
          Study again
        </Button>

        <Link
          href="/decks"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors mt-1"
        >
          Back to decks
        </Link>
      </motion.div>
    </motion.div>
  )
}
