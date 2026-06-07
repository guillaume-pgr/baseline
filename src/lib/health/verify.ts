/**
 * Auto-vérification déterministe d'un import (sous-étape D) — ZÉRO appel API.
 *
 * Fiabilise les marqueurs réconciliés sans coût :
 *  1. recoupement avec la couche texte du PDF (valeur réellement présente ?)
 *  2. cohérence des bornes
 *  3. plausibilité (ordre de grandeur vs référentiel)
 *  4. score de confiance global de l'import
 */

import { matchMarker, boundsForSex } from './blood-markers-reference'
import { getMarkerStatus, isOutOfRange as statusOutOfRange } from './marker-status'
import type { ReconciledMarker } from './reconcile'

// En dessous de ce seuil, la LECTURE est jugée peu sûre (≠ valeur hors norme).
const LOW_CONFIDENCE = 0.6

export interface VerifiedMarker extends ReconciledMarker {
  // Fiabilité de l'EXTRACTION uniquement (jamais le fait d'être hors norme).
  verifyWarning: boolean
  verifyReasons: string[]
  // extractionFlag = "à vérifier" : nom non reconnu, valeur introuvable,
  // bornes incohérentes, ordre de grandeur absurde, ou confiance basse.
  extractionFlag: boolean
  // outOfRange = RÉSULTAT hors des bornes de référence. C'est un statut
  // d'affichage VALIDE — il ne déclenche JAMAIS "à vérifier".
  outOfRange: boolean
}

// Le résultat sort-il de l'intervalle de référence ? (statut d'affichage)
// Dérivé de la source unique getMarkerStatus pour rester cohérent partout.
function isOutOfRange(m: ReconciledMarker): boolean {
  return statusOutOfRange(getMarkerStatus(m.value, m.refMin, m.refMax, m.refOperator))
}

export interface VerifiedPanel {
  markers: VerifiedMarker[]
  globalConfidence: number
}

// Tous les nombres présents dans le texte (espaces de milliers retirés, virgule → point).
function numbersInText(pdfText: string): number[] {
  const norm = pdfText.replace(/[\s   ]/g, '').replace(/,/g, '.')
  const tokens = norm.match(/-?\d+(?:\.\d+)?/g) ?? []
  return tokens.map(t => parseFloat(t)).filter(n => Number.isFinite(n))
}

function nearlyEqual(a: number, b: number): boolean {
  if (a === b) return true
  const diff = Math.abs(a - b)
  const scale = Math.max(Math.abs(a), Math.abs(b), 1)
  return diff / scale < 0.005 // 0.5% de tolérance (arrondis d'affichage)
}

/**
 * Vérifie les marqueurs réconciliés et calcule un score de confiance global.
 * `pdfText` peut être vide (image ou PDF scanné) → la vérification texte est
 * alors ignorée (pas de faux avertissement).
 */
export function verifyMarkers(markers: ReconciledMarker[], pdfText: string): VerifiedPanel {
  const hasText = pdfText.trim().length > 40
  const textNumbers = hasText ? numbersInText(pdfText) : []

  const verified: VerifiedMarker[] = markers.map(m => {
    const reasons: string[] = []

    // 1. Recoupement texte : la valeur brute (telle qu'imprimée) est-elle présente ?
    if (hasText) {
      const found = textNumbers.some(n => nearlyEqual(n, m.rawValue))
      if (!found) reasons.push('Valeur introuvable dans le texte du PDF')
    }

    // 2. Cohérence des bornes
    if (m.refOperator === 'range' && m.refMin !== null && m.refMax !== null && m.refMin >= m.refMax) {
      reasons.push('Bornes de référence incohérentes')
    }

    // 3. Plausibilité vs ordre de grandeur attendu (référentiel canonique)
    if (!m.needsReview) {
      const ref = matchMarker(m.markerName)
      if (ref) {
        const b = boundsForSex(ref)
        if (b.high !== null && b.high > 0 && m.value > b.high * 100) {
          reasons.push('Valeur hors échelle (trop élevée vs référence)')
        }
        if (b.low !== null && b.low > 0 && m.value < b.low / 100) {
          reasons.push('Valeur hors échelle (trop basse vs référence)')
        }
      }
    }

    const verifyWarning = reasons.length > 0
    // "À vérifier" = fiabilité d'extraction. Le statut hors-norme (outOfRange)
    // en est volontairement EXCLU.
    const extractionFlag = m.needsReview || verifyWarning || (m.confidence ?? 1) < LOW_CONFIDENCE
    return { ...m, verifyWarning, verifyReasons: reasons, extractionFlag, outOfRange: isOutOfRange(m) }
  })

  // 4. Score de confiance global : moyenne des confidences, pénalisée par les
  // avertissements et les marqueurs non reconnus.
  const n = verified.length || 1
  const meanConf = verified.reduce((s, m) => s + (m.confidence ?? 0.8), 0) / n
  const warnFrac = verified.filter(m => m.verifyWarning).length / n
  const reviewFrac = verified.filter(m => m.needsReview).length / n
  const global = Math.max(0, Math.min(1, meanConf - 0.3 * warnFrac - 0.2 * reviewFrac))

  return { markers: verified, globalConfidence: Math.round(global * 100) / 100 }
}
