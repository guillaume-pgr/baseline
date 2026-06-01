'use client'

import { useState } from 'react'
import Link from 'next/link'
import { z } from 'zod'

const resetPasswordSchema = z.object({
  email: z.string().email('Email invalide'),
})

type ResetPasswordInput = z.infer<typeof resetPasswordSchema>

export default function ResetPasswordPage() {
  const [formData, setFormData] = useState<ResetPasswordInput>({ email: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

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
    e.preventDefault()
    const validation = resetPasswordSchema.safeParse(formData)

    if (!validation.success) {
      const newErrors: Record<string, string> = {}
      validation.error.issues.forEach(issue => {
        if (issue.path[0]) {
          newErrors[issue.path[0].toString()] = issue.message
        }
      })
      setErrors(newErrors)
      return
    }

    setIsLoading(true)
    try {
      // TODO: Implement actual password reset with Supabase
      // const { error } = await supabase.auth.resetPasswordForEmail(formData.email)
      // if (error) throw error
      setSubmitted(true)
    } catch (error) {
      setErrors({ form: 'Erreur lors de la réinitialisation' })
    } finally {
      setIsLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center">
        <h1 className="font-manrope font-light text-4xl mb-3">Lien envoyé.</h1>
        <p className="text-ink-3 text-sm mb-8">
          Consulte ton email pour réinitialiser ton mot de passe.
        </p>
        <Link href="/auth/signin" className="text-ink-2 hover:underline inline-block">
          Retour à la connexion
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1 className="font-manrope font-light text-4xl mb-3">Réinitialise ton mot de passe.</h1>
      <p className="text-ink-3 text-sm mb-8">
        Reçois un lien par email pour créer un nouveau mot de passe.
      </p>

      <div className="mb-8">
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

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-black text-white py-2 rounded-lg font-medium hover:bg-ink disabled:opacity-50 transition mb-6"
      >
        {isLoading ? 'Envoi...' : 'Envoyer le lien'}
      </button>

      <Link href="/auth/signin" className="text-ink-2 hover:underline text-sm inline-block">
        Retour à la connexion
      </Link>
    </form>
  )
}
