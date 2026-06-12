import type { CSSProperties } from 'react'

interface LogoProps {
  /** Taille de la police en px (le point se dimensionne automatiquement). */
  size?: number
  /** Couleur du mot-symbole (par défaut l'encre). */
  color?: string
  /** Couleur du point (par défaut la couleur de marque). */
  accent?: string
  style?: CSSProperties
  className?: string
}

/**
 * Logo Lyvio — mot-symbole « LYVIO » + point carré accent.
 * Vectoriel (Manrope 800), net à toute taille, thémable (fond clair/sombre).
 */
export default function Logo({
  size = 22,
  color = 'var(--color-ink)',
  accent = 'var(--color-brand)',
  style,
  className,
}: LogoProps) {
  const dot = Math.max(Math.round(size * 0.17), 4)
  return (
    <span
      role="img"
      aria-label="Lyvio"
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'flex-end',
        gap: Math.max(Math.round(size * 0.07), 2),
        fontFamily: 'var(--font-sans)',
        fontWeight: 800,
        fontSize: size,
        lineHeight: 1,
        letterSpacing: '-0.045em',
        color,
        userSelect: 'none',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      <span>LYVIO</span>
      <span
        aria-hidden="true"
        style={{
          width: dot,
          height: dot,
          backgroundColor: accent,
          borderRadius: 1,
          marginBottom: Math.max(Math.round(size * 0.06), 1),
          flexShrink: 0,
        }}
      />
    </span>
  )
}
