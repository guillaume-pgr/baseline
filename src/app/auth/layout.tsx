'use client'

import { ReactNode } from 'react'
import Link from 'next/link'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-4">
      <div className="max-w-[420px] w-full bg-white rounded-[16px] border border-line p-10">
        <div className="mb-8">
          <div className="font-manrope font-bold text-lg mb-1">LYVIO</div>
          <div className="font-mono text-[10px] text-ink-4">Performance health</div>
        </div>

        {children}

        <div className="mt-8 pt-8 border-t border-line text-center font-mono text-[9px] text-ink-4">
          Outil éducatif · Ne remplace pas un avis médical
        </div>
      </div>
    </div>
  )
}
