type UsageRecord = { result: "CORRECT" | "INCORRECT"; reviewedAt: Date }

// Weighted familiarity from up to 5 most recent reviews (most recent = highest weight)
const WEIGHTS = [1.0, 0.8, 0.6, 0.4, 0.2]

export function computeFamiliarity(usages: UsageRecord[]): number {
  if (usages.length === 0) return 0
  const recent = usages.slice(0, 5) // caller must sort desc by reviewedAt
  let correct = 0
  let total = 0
  recent.forEach((u, i) => {
    const w = WEIGHTS[i] ?? 0.2
    if (u.result === "CORRECT") correct += w
    total += w
  })
  return Math.round((correct / total) * 100)
}

// Review interval in days per familiarity bracket
function intervalDays(familiarity: number): number {
  if (familiarity < 20) return 0   // always due
  if (familiarity < 40) return 1
  if (familiarity < 60) return 3
  if (familiarity < 80) return 7
  return 14                         // mastered
}

export function isDue(familiarity: number, lastReviewedAt: Date | null): boolean {
  if (!lastReviewedAt) return true
  const daysSince = (Date.now() - lastReviewedAt.getTime()) / 86_400_000
  return daysSince >= intervalDays(familiarity)
}

export function computeStreak(usages: { reviewedAt: Date }[]): number {
  if (usages.length === 0) return 0

  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  const daySet = new Set(
    usages.map((u) => {
      const d = new Date(u.reviewedAt)
      d.setUTCHours(0, 0, 0, 0)
      return d.getTime()
    }),
  )

  let streak = 0
  let check = today.getTime()

  // If no review today, start streak check from yesterday
  if (!daySet.has(check)) check -= 86_400_000

  while (daySet.has(check)) {
    streak++
    check -= 86_400_000
  }

  return streak
}
