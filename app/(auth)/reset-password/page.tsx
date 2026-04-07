'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    if (!token) {
      setError('Invalid or missing reset token. Please request a new link.')
      return
    }

    setPending(true)

    const { error } = await authClient.resetPassword({ newPassword: password, token })

    if (error) {
      setError(error.message ?? 'Failed to reset password.')
    } else {
      router.push('/sign-in?reset=success')
    }

    setPending(false)
  }

  if (!token) {
    return (
      <div className="w-full max-w-sm">
        <div className="bg-card/70 backdrop-blur-md border border-border rounded-2xl p-8 text-center space-y-3">
          <p className="text-lg font-medium">Invalid link</p>
          <p className="text-sm text-muted-foreground">This reset link is invalid or has expired.</p>
          <Link href="/forgot-password" className="inline-block text-sm underline underline-offset-4 hover:no-underline">
            Request a new link
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm">
      <div className="bg-card/70 backdrop-blur-md border border-border rounded-2xl p-8 space-y-6">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">Set new password</h1>
          <p className="text-sm text-muted-foreground">Choose a strong password for your account.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              type="password"
              placeholder="At least 8 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm password</Label>
            <Input
              id="confirm"
              type="password"
              placeholder="••••••••"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          {error && <p className="text-sm text-destructive-foreground bg-destructive/20 border border-destructive/30 rounded-lg px-3 py-2">{error}</p>}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Updating…' : 'Update password'}
          </Button>
        </form>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  )
}
