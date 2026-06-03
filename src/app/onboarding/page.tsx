'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type OnboardingStep = 1 | 2 | 3

interface OnboardingData {
  firstName: string
  lastName: string
  birthDate: string
  sex: 'M' | 'F' | ''
  heightCm: string
  mode: 'demo' | 'real' | ''
}

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<OnboardingStep>(1)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<OnboardingData>({
    firstName: '',
    lastName: '',
    birthDate: '',
    sex: '',
    heightCm: '',
    mode: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Le prénom est requis'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.birthDate) {
      newErrors.birthDate = 'La date de naissance est requise'
    }
    if (!formData.sex) {
      newErrors.sex = 'Le sexe est requis'
    }
    if (!formData.heightCm || Number(formData.heightCm) <= 0) {
      newErrors.heightCm = 'La taille est requise'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep3 = () => true

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2)
    } else if (step === 2 && validateStep2()) {
      setStep(3)
    }
  }

  const handleComplete = async () => {
    if (!validateStep3()) return

    setIsLoading(true)
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/signin')
        return
      }

      // Retrieve CGV acceptance timestamp stored during signup
      const cgvAcceptedAt = sessionStorage.getItem('lyvio.cgv_accepted_at') || new Date().toISOString()
      sessionStorage.removeItem('lyvio.cgv_accepted_at')

      // Create profile in Supabase — status pending by default
      const { error } = await supabase.from('profiles').insert({
        user_id: user.id,
        first_name: formData.firstName,
        last_name: formData.lastName || null,
        birth_date: formData.birthDate || null,
        sex: (formData.sex as 'M' | 'F') || null,
        height_cm: formData.heightCm ? Number(formData.heightCm) : null,
        current_mode: 'demo',
        status: 'pending',
        cgv_accepted_at: cgvAcceptedAt,
      } as any)

      if (error) {
        setErrors({ form: 'Erreur lors de la création du profil' })
        return
      }

      router.push('/dashboard')
    } catch (error) {
      setErrors({ form: 'Erreur lors de la création du profil' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-4">
      <div className="max-w-[420px] w-full bg-white rounded-[16px] border border-line p-10">
        <div className="mb-8">
          <div className="font-manrope font-bold text-lg mb-1">LYVIO</div>
          <div className="font-mono text-[10px] text-ink-4">Performance health</div>
        </div>

        {/* Progress Indicator */}
        <div className="flex gap-2 mb-12 justify-center">
          <div className={`w-2 h-2 rounded-full ${step >= 1 ? 'bg-ink' : 'bg-line'}`}></div>
          <div className={`w-2 h-2 rounded-full ${step >= 2 ? 'bg-ink' : 'bg-line'}`}></div>
          <div className={`w-2 h-2 rounded-full ${step >= 3 ? 'bg-ink' : 'bg-line'}`}></div>
        </div>

        {/* Step 1 — Identity */}
        {step === 1 && (
          <form
            onSubmit={e => {
              e.preventDefault()
              handleNext()
            }}
          >
            <h1 className="font-manrope font-light text-4xl mb-8">Comment t'appelles-tu ?</h1>

            <div className="space-y-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-ink mb-2">Prénom</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ink ${
                    errors.firstName ? 'border-rust' : 'border-line'
                  }`}
                  placeholder="Ton prénom"
                />
                {errors.firstName && <p className="text-rust text-sm mt-1">{errors.firstName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-2">Nom (optionnel)</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-ink"
                  placeholder="Ton nom"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-black text-white py-2 rounded-lg font-medium hover:bg-ink transition"
            >
              Suivant
            </button>
          </form>
        )}

        {/* Step 2 — Base Data */}
        {step === 2 && (
          <form
            onSubmit={e => {
              e.preventDefault()
              handleNext()
            }}
          >
            <h1 className="font-manrope font-light text-3xl mb-2">Quelques infos</h1>
            <p className="text-ink-3 text-sm mb-8">pour personnaliser tes cohortes.</p>

            <div className="space-y-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-ink mb-2">Date de naissance</label>
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ink ${
                    errors.birthDate ? 'border-rust' : 'border-line'
                  }`}
                />
                {errors.birthDate && <p className="text-rust text-sm mt-1">{errors.birthDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-3">Sexe</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="sex"
                      value="M"
                      checked={formData.sex === 'M'}
                      onChange={handleInputChange}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-ink">Homme</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="sex"
                      value="F"
                      checked={formData.sex === 'F'}
                      onChange={handleInputChange}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-ink">Femme</span>
                  </label>
                </div>
                {errors.sex && <p className="text-rust text-sm mt-2">{errors.sex}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-2">Taille (cm)</label>
                <input
                  type="number"
                  name="heightCm"
                  value={formData.heightCm}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ink ${
                    errors.heightCm ? 'border-rust' : 'border-line'
                  }`}
                  placeholder="170"
                  min="0"
                />
                {errors.heightCm && <p className="text-rust text-sm mt-1">{errors.heightCm}</p>}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-black text-white py-2 rounded-lg font-medium hover:bg-ink transition"
            >
              Suivant
            </button>
          </form>
        )}

        {/* Step 3 — Confirmation */}
        {step === 3 && (
          <form
            onSubmit={e => {
              e.preventDefault()
              handleComplete()
            }}
          >
            <h1 className="font-manrope font-light text-4xl mb-4">Presque prêt !</h1>
            <p className="text-ink-3 text-sm mb-8" style={{ lineHeight: 1.6 }}>
              Ton compte est en cours de validation. En attendant, explore Lyvio avec un profil démo.
            </p>

            {/* Pending status card */}
            <div style={{
              backgroundColor: 'var(--color-lichen-soft)',
              border: '1px solid var(--color-lichen)',
              borderRadius: 12,
              padding: '16px 20px',
              marginBottom: 24,
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#3d5c2d', marginBottom: 6 }}>
                Compte en attente de validation
              </div>
              <p style={{ fontSize: 11.5, color: '#3d5c2d', lineHeight: 1.55, margin: 0 }}>
                Nous activons chaque compte manuellement pour garantir la qualité de l'expérience.
                Tu recevras un email dès que ton accès sera prêt.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white py-2 rounded-lg font-medium hover:bg-ink disabled:opacity-50 transition"
            >
              {isLoading ? 'Création...' : 'Explorer le mode démo'}
            </button>
          </form>
        )}

        <div className="mt-8 pt-8 border-t border-line text-center font-mono text-[9px] text-ink-4">
          Outil éducatif · Ne remplace pas un avis médical
        </div>
      </div>
    </div>
  )
}
