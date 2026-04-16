"use client"

import { useState, useCallback, useRef } from "react"
import Link from "next/link"
import { Keyboard } from "lucide-react"
import { Flashcard } from "@/components/flashcard"
import { SessionComplete } from "@/components/session-complete"
import { recordUsage } from "@/app/actions"

interface CardData {
  id: string
  question: string
  answer: string
  image?: string
  stability: number | null
  difficulty: number | null
  nextDue: number | null      // Unix ms
  reviewCount: number
  lastReviewedAt: number | null  // Unix ms
}

interface StudyPageProps {
  cards: CardData[]
  deckTitle?: string
}

export function StudyPage({ cards }: StudyPageProps) {
  const initialDueCards = useRef(cards.filter((c) => c.nextDue !== null && c.nextDue <= Date.now()))
  const [activeCards, setActiveCards] = useState(cards)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [wrongCards, setWrongCards] = useState<CardData[]>([])

  const currentCard = activeCards[currentIndex]

  const handleResult = useCallback(
    (grade: "forgot" | "hard" | "good" | "easy") => {
      recordUsage(currentCard.id, grade)

      const isCorrect = grade === "good" || grade === "easy"
      if (!isCorrect) {
        setWrongCards((prev) => [...prev, currentCard])
      } else {
        setCorrectCount((prev) => prev + 1)
      }

      if (currentIndex + 1 >= activeCards.length) {
        setTimeout(() => setIsComplete(true), 100)
      } else {
        setCurrentIndex((prev) => prev + 1)
      }
    },
    [currentIndex, activeCards.length, currentCard],
  )

  const handleRestart = useCallback(() => {
    setActiveCards(cards)
    setCurrentIndex(0)
    setCorrectCount(0)
    setIsComplete(false)
    setWrongCards([])
  }, [cards])

  const handleStudyWrong = useCallback(() => {
    setActiveCards(wrongCards)
    setCurrentIndex(0)
    setCorrectCount(0)
    setIsComplete(false)
    setWrongCards([])
  }, [wrongCards])

  const handleStudyDue = useCallback(() => {
    setActiveCards(initialDueCards.current)
    setCurrentIndex(0)
    setCorrectCount(0)
    setIsComplete(false)
    setWrongCards([])
  }, [])

  const handleSkip = useCallback(() => {
    if (currentIndex + 1 >= activeCards.length) {
      setTimeout(() => setIsComplete(true), 100)
    } else {
      setCurrentIndex((prev) => prev + 1)
    }
  }, [currentIndex, activeCards.length])

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
    }
  }, [currentIndex])

  return (
    <main className="h-svh flex items-center justify-center">
      <Link
        href="/shortcuts"
        className="fixed bottom-6 left-6 z-50 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
        aria-label="Keyboard shortcuts"
      >
        <Keyboard size={18} />
      </Link>

      {isComplete ? (
        <SessionComplete
          correctCount={correctCount}
          totalCards={activeCards.length}
          wrongCards={wrongCards}
          dueCards={initialDueCards.current}
          onRestart={handleRestart}
          onStudyWrong={handleStudyWrong}
          onStudyDue={handleStudyDue}
        />
      ) : (
        <Flashcard
          question={currentCard.question}
          answer={currentCard.answer}
          image={currentCard.image}
          currentIndex={currentIndex}
          totalCards={activeCards.length}
          onResult={handleResult}
          onSkip={handleSkip}
          onPrev={handlePrev}
        />
      )}
    </main>
  )
}
