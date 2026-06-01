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

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.mode) {
      newErrors.mode = 'Sélectionne un mode'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

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

      // Create profile in Supabase
      const { error } = await supabase.from('profiles').insert({
        user_id: user.id,
        first_name: formData.firstName,
        last_name: formData.lastName || null,
        birth_date: formData.birthDate || null,
        sex: (formData.sex as 'M' | 'F') || null,
        height_cm: formData.heightCm ? Number(formData.heightCm) : null,
        current_mode: formData.mode as 'demo' | 'real',
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

        {/* Step 3 — Mode Selection */}
        {step === 3 && (
          <form
            onSubmit={e => {
              e.preventDefault()
              handleComplete()
            }}
          >
            <h1 className="font-manrope font-light text-4xl mb-8">Comment veux-tu commencer ?</h1>

            <div className="space-y-4 mb-8">
              {/* Demo Mode Card */}
              <label className="flex cursor-pointer">
                <input
                  type="radio"
                  name="mode"
                  value="demo"
                  checked={formData.mode === 'demo'}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <div
                  className={`flex-1 p-5 border-2 rounded-lg transition ${
                    formData.mode === 'demo'
                      ? 'border-aqua bg-aqua/5'
                      : 'border-line hover:border-ink-3'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-2xl mt-0.5">✨</div>
                    <div className="flex-1">
                      <div className="font-medium text-ink mb-1">Explorer en mode démo</div>
                      <div className="text-sm text-ink-3">
                        Voir l'app avec un profil similaire
                      </div>
                      <div className="text-xs text-ink-4 mt-2">
                        Découvre toutes les fonctionnalités avec les données d'un profil démo.
                        Aucun import requis.
                      </div>
                      {formData.mode === 'demo' && (
                        <div className="text-xs text-aqua font-medium mt-3">✓ Recommandé</div>
                      )}
                    </div>
                  </div>
                </div>
              </label>

              {/* Real Mode Card */}
              <label className="flex cursor-pointer">
                <input
                  type="radio"
                  name="mode"
                  value="real"
                  checked={formData.mode === 'real'}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <div
                  className={`flex-1 p-5 border-2 rounded-lg transition ${
                    formData.mode === 'real'
                      ? 'border-ink bg-ink/2'
                      : 'border-line hover:border-ink-3'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-2xl mt-0.5">📤</div>
                    <div className="flex-1">
                      <div className="font-medium text-ink mb-1">Importer mes données</div>
                      <div className="text-sm text-ink-3">
                        Commencer avec mes vraies données
                      </div>
                      <div className="text-xs text-ink-4 mt-2">
                        Importe ton bilan sanguin ou connecte un appareil maintenant.
                      </div>
                    </div>
                  </div>
                </div>
              </label>
            </div>

            {errors.mode && <p className="text-rust text-sm mb-6 text-center">{errors.mode}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white py-2 rounded-lg font-medium hover:bg-ink disabled:opacity-50 transition"
            >
              {isLoading ? 'Création...' : 'Terminer'}
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
