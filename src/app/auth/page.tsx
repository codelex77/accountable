'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    else router.push('/')
    setLoading(false)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) setError(error.message)
    else alert('Check your email for confirmation!')
    setLoading(false)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-[var(--card)] border border-[var(--border)] rounded-sm shadow-xl">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-normal text-[var(--accent)]">Accountable</h1>
          <p className="text-sm font-mono uppercase tracking-widest text-muted-foreground opacity-60">Authentication</p>
        </div>
        
        <form className="space-y-4" onSubmit={handleSignIn}>
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 bg-[var(--background)] border border-[var(--border)] rounded-none focus:border-[var(--accent)] outline-none transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 bg-[var(--background)] border border-[var(--border)] rounded-none focus:border-[var(--accent)] outline-none transition-colors"
              required
            />
          </div>
          
          {error && <p className="text-red-500 text-xs font-mono">{error}</p>}
          
          <div className="flex gap-4 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[var(--accent)] text-[var(--background)] py-2 font-mono text-xs uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={handleSignUp}
              disabled={loading}
              className="flex-1 border border-[var(--border)] py-2 font-mono text-xs uppercase tracking-widest hover:border-[var(--accent)] transition-colors disabled:opacity-50"
            >
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
