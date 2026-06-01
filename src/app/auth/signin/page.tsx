'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'

const signinSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
})

type SigninInput = z.infer<typeof signinSchema>

export default function SigninPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<SigninInput>({ email: '', password: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('[signin] handleSubmit called')
    e.preventDefault()
    console.log('[signin] form data:', formData)

    const validation = signinSchema.safeParse(formData)

    if (!validation.success) {
      console.log('[signin] validation failed:', validation.error.issues)
      const newErrors: Record<string, string> = {}
      validation.error.issues.forEach(issue => {
        if (issue.path[0]) {
          newErrors[issue.path[0].toString()] = issue.message
        }
      })
      setErrors(newErrors)
      return
    }

    console.log('[signin] validation passed')
    setIsLoading(true)
    try {
      console.log('[signin] start', { email: formData.email })

      const supabase = createClient()
      console.log('[signin] createClient done')

      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      console.log('[signin] result', { data, error })

      if (error) {
        console.error('[signin] error', error)
        throw error
      }

      console.log('[signin] success, syncing session with server')

      // Sync session with server via cookie
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session: data.session }),
      })

      console.log('[signin] session synced, checking profile')

      // Verify profile exists
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name')
        .eq('user_id', data.user.id)
        .single() as any

      console.log('[signin] profile', profile)

      if (!profile?.first_name) {
        console.log('[signin] redirecting to /onboarding')
        router.push('/onboarding')
      } else {
        console.log('[signin] redirecting to /dashboard')
        router.push('/dashboard')
      }

      router.refresh()
    } catch (error) {
      console.error('[signin] error caught', error)
      setErrors({ form: error instanceof Error ? error.message : 'Erreur de connexion' })
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1 className="font-manrope font-light text-4xl mb-3">Bon retour.</h1>

      <div className="space-y-6 mb-8">
        <div>
          <label className="block text-sm font-medium text-ink mb-2">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ink ${
              errors.email ? 'border-rust' : 'border-line'
            }`}
            placeholder="toi@exemple.com"
          />
          {errors.email && <p className="text-rust text-sm mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-2">Mot de passe</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ink ${
              errors.password ? 'border-rust' : 'border-line'
            }`}
          />
          {errors.password && <p className="text-rust text-sm mt-1">{errors.password}</p>}
        </div>
      </div>

      <Link
        href="/auth/reset-password"
        className="text-sm text-ink-2 hover:underline inline-block mb-6"
      >
        Mot de passe oublié ?
      </Link>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-black text-white py-2 rounded-lg font-medium hover:bg-ink disabled:opacity-50 transition mb-4"
      >
        {isLoading ? 'Connexion...' : 'Se connecter'}
      </button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-line"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-ink-4 font-mono text-[10px]">ou</span>
        </div>
      </div>

      <button
        type="button"
        className="w-full border border-line text-ink py-2 rounded-lg font-medium hover:bg-surface transition mb-8 flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continuer avec Google
      </button>

      <div className="text-center text-sm">
        Pas encore de compte ?{' '}
        <Link href="/auth/signup" className="text-ink-2 hover:underline font-medium">
          Crée-en un
        </Link>
      </div>
    </form>
  )
}
