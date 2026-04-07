'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn, authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Mode = 'password' | 'magic-link'

export default function SignInPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setPending(true)

    if (mode === 'magic-link') {
      const { error } = await authClient.signIn.magicLink({ email, callbackURL: '/' })
      if (error) {
        setError(error.message ?? 'Failed to send magic link.')
      } else {
        setMagicLinkSent(true)
      }
    } else {
      const { error } = await signIn.email({ email, password, callbackURL: '/' })
      if (error) {
        setError(error.message ?? 'Invalid email or password.')
      } else {
        router.push('/')
      }
    }

    setPending(false)
  }

  async function handleGoogle() {
    await signIn.social({ provider: 'google', callbackURL: '/' })
  }

  if (magicLinkSent) {
    return (
      <div className="w-full max-w-sm">
        <div className="bg-card/70 backdrop-blur-md border border-border rounded-2xl p-8 text-center space-y-3">
          <p className="text-lg font-medium">Check your email</p>
          <p className="text-sm text-muted-foreground">
            We sent a sign-in link to <span className="text-foreground">{email}</span>.
          </p>
          <button
            className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
            onClick={() => { setMagicLinkSent(false); setEmail('') }}
          >
            Use a different email
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm">
      <div className="bg-card/70 backdrop-blur-md border border-border rounded-2xl p-8 space-y-6">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">Sign in</h1>
          <p className="text-sm text-muted-foreground">Welcome back to Flipt</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          {mode === 'password' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
          )}

          {error && <p className="text-sm text-destructive-foreground bg-destructive/20 border border-destructive/30 rounded-lg px-3 py-2">{error}</p>}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Please wait…' : mode === 'magic-link' ? 'Send magic link' : 'Sign in'}
          </Button>
        </form>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex-1 border-t border-border" />
          or
          <span className="flex-1 border-t border-border" />
        </div>

        <div className="space-y-2">
          <Button variant="outline" className="w-full" onClick={handleGoogle} type="button">
            <GoogleIcon />
            Continue with Google
          </Button>
          <Button
            variant="ghost"
            className="w-full text-muted-foreground"
            type="button"
            onClick={() => { setMode(mode === 'password' ? 'magic-link' : 'password'); setError(null) }}
          >
            {mode === 'password' ? 'Sign in with magic link instead' : 'Sign in with password instead'}
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link href="/sign-up" className="text-foreground underline underline-offset-4 hover:no-underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}
