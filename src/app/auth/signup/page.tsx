'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'

const signupSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Au minimum 8 caractères'),
  cgv: z.boolean().refine(val => val === true, 'Accepte les CGV pour continuer'),
})

type SignupInput = z.infer<typeof signupSchema>

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<SignupInput>({
    email: '',
    password: '',
    cgv: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, value, checked } = e.target
    const fieldValue = type === 'checkbox' ? checked : value
    setFormData(prev => ({ ...prev, [name]: fieldValue }))
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validation = signupSchema.safeParse(formData)

    if (!validation.success) {
      const newErrors: Record<string, string> = {}
      validation.error.issues.forEach(issue => {
        if (issue.path[0]) newErrors[issue.path[0].toString()] = issue.message
      })
      setErrors(newErrors)
      return
    }

    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })

      if (error) throw error

      // Store CGV acceptance timestamp for onboarding profile creation
      sessionStorage.setItem('lyvio.cgv_accepted_at', new Date().toISOString())

      if (data.session) {
        await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session: data.session }),
        })
      }

      router.push('/onboarding')
      router.refresh()
    } catch (error) {
      setErrors({ form: error instanceof Error ? error.message : 'Erreur lors de la création du compte' })
      setIsLoading(false)
    }
  }

  return (
    <div>
      {/* Lancement banner */}
      <div style={{
        backgroundColor: 'var(--color-lichen-soft)',
        border: '1px solid var(--color-lichen)',
        borderRadius: 10,
        padding: '12px 16px',
        marginBottom: 28,
      }}>
        <p style={{ fontSize: 12.5, color: '#3d5c2d', lineHeight: 1.55, margin: 0 }}>
          Lyvio sera bientôt disponible. Crée ton compte dès maintenant : il sera activé dès que Lyvio sera prêt.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
          <h1 className="font-manrope font-light text-4xl">Crée ton compte.</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
          <p className="text-ink-3 text-sm">Commence à suivre ta santé en 2 minutes.</p>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            padding: '3px 8px',
            borderRadius: 999,
            backgroundColor: 'var(--color-surface-2)',
            color: 'var(--color-ink-3)',
            whiteSpace: 'nowrap',
          }}>
            Compte gratuit
          </span>
        </div>

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
              placeholder="Min. 8 caractères"
            />
            {errors.password && <p className="text-rust text-sm mt-1">{errors.password}</p>}
          </div>

          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              name="cgv"
              id="cgv"
              checked={formData.cgv}
              onChange={handleChange}
              className="mt-1 w-4 h-4 border border-line rounded shrink-0"
            />
            <label htmlFor="cgv" className="text-sm text-ink-3">
              J'accepte les{' '}
              <Link href="/legal/cgv" target="_blank" className="text-ink-2 hover:underline">
                CGV
              </Link>
              {' '}et la{' '}
              <Link href="/legal/confidentialite" target="_blank" className="text-ink-2 hover:underline">
                politique de confidentialité
              </Link>
            </label>
          </div>
          {errors.cgv && <p className="text-rust text-sm -mt-4">{errors.cgv}</p>}
        </div>

        {errors.form && (
          <p className="text-rust text-sm mb-4 text-center">{errors.form}</p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-black text-white py-2 rounded-lg font-medium hover:bg-ink disabled:opacity-50 transition mb-6"
        >
          {isLoading ? 'Création...' : 'Créer mon compte gratuit'}
        </button>

        <div className="text-center text-sm">
          Déjà un compte ?{' '}
          <Link href="/auth/signin" className="text-ink-2 hover:underline font-medium">
            Connecte-toi
          </Link>
        </div>
      </form>
    </div>
  )
}
