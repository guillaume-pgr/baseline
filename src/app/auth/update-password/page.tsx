'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'

const updatePasswordSchema = z
  .object({
    password: z.string().min(8, 'Au minimum 8 caractères'),
    passwordConfirm: z.string().min(8, 'Au minimum 8 caractères'),
  })
  .refine(data => data.password === data.passwordConfirm, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['passwordConfirm'],
  })

type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<UpdatePasswordInput>({
    password: '',
    passwordConfirm: '',
  })
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
    e.preventDefault()
    const validation = updatePasswordSchema.safeParse(formData)

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
      // TODO: Implement actual password update with Supabase
      // const { error } = await supabase.auth.updateUser({ password: formData.password })
      // if (error) throw error
      // router.push('/dashboard')
      console.log('Update password attempt:', formData)
    } catch (error) {
      setErrors({ form: 'Erreur lors de la mise à jour' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1 className="font-manrope font-light text-4xl mb-8">Nouveau mot de passe.</h1>

      <div className="space-y-6 mb-8">
        <div>
          <label className="block text-sm font-medium text-ink mb-2">Nouveau mot de passe</label>
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

        <div>
          <label className="block text-sm font-medium text-ink mb-2">Confirmer</label>
          <input
            type="password"
            name="passwordConfirm"
            value={formData.passwordConfirm}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ink ${
              errors.passwordConfirm ? 'border-rust' : 'border-line'
            }`}
            placeholder="Confirmer le mot de passe"
          />
          {errors.passwordConfirm && (
            <p className="text-rust text-sm mt-1">{errors.passwordConfirm}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-black text-white py-2 rounded-lg font-medium hover:bg-ink disabled:opacity-50 transition"
      >
        {isLoading ? 'Mise à jour...' : 'Mettre à jour'}
      </button>
    </form>
  )
}
