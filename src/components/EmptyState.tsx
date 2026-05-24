'use client'

import { IconArrowNarrowRight } from '@tabler/icons-react'
import * as TablerIcons from '@tabler/icons-react'

type EmptyStateProps = {
  icon: string
  iconColor?: 'ink' | 'aqua' | 'lichen' | 'rust' | 'amber' | 'lavender'
  title: string
  body: string
  primaryAction: { label: string; onClick: () => void; icon?: string }
  secondaryAction?: { label: string; onClick: () => void }
}

const colorMap: Record<string, { bg: string; color: string }> = {
  ink: { bg: 'var(--color-surface-2)', color: 'var(--color-ink)' },
  aqua: { bg: 'var(--color-aqua-soft)', color: 'var(--color-aqua)' },
  lichen: { bg: 'var(--color-lichen-soft)', color: 'var(--color-lichen)' },
  rust: { bg: 'var(--color-rust-soft)', color: 'var(--color-rust)' },
  amber: { bg: 'var(--color-amber-soft)', color: 'var(--color-amber)' },
  lavender: { bg: 'var(--color-lavender-soft)', color: 'var(--color-lavender)' },
}

const getIcon = (iconName: string) => {
  const iconKey = `Icon${iconName.charAt(0).toUpperCase() + iconName.slice(1)}`
  return (TablerIcons as Record<string, any>)[iconKey]
}

export default function EmptyState({
  icon,
  iconColor = 'ink',
  title,
  body,
  primaryAction,
  secondaryAction,
}: EmptyStateProps) {
  const colors = colorMap[iconColor]
  const IconComponent = getIcon(icon)
  const PrimaryIconComponent = primaryAction.icon ? getIcon(primaryAction.icon) : null

  return (
    <div
      style={{
        maxWidth: 480,
        margin: '0 auto',
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
      }}
    >
      {/* Icon with background circle */}
      <div
        style={{
          width: 88,
          height: 88,
          borderRadius: '50%',
          backgroundColor: colors.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
        }}
      >
        {IconComponent ? (
          <IconComponent size={56} color={colors.color} strokeWidth={1.5} />
        ) : null}
      </div>

      {/* Title */}
      <h2
        style={{
          fontFamily: 'Manrope, sans-serif',
          fontWeight: 300,
          fontSize: 28,
          letterSpacing: '-0.025em',
          textAlign: 'center',
          color: 'var(--color-ink)',
          margin: '0 0 12px 0',
        }}
      >
        {title}
      </h2>

      {/* Body */}
      <p
        style={{
          fontSize: 13,
          color: 'var(--color-ink-3)',
          lineHeight: 1.6,
          textAlign: 'center',
          maxWidth: 380,
          margin: '0 auto 32px',
        }}
      >
        {body}
      </p>

      {/* Action buttons */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: 10,
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        {/* Primary button */}
        <button
          onClick={primaryAction.onClick}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: primaryAction.icon ? 7 : 0,
            padding: '9px 16px',
            backgroundColor: 'var(--color-ink)',
            border: 'none',
            borderRadius: 999,
            color: 'var(--color-bg)',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.opacity = '0.9'
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.opacity = '1'
          }}
        >
          {PrimaryIconComponent && primaryAction.icon ? (
            <PrimaryIconComponent size={14} />
          ) : null}
          {primaryAction.label}
        </button>

        {/* Secondary button */}
        {secondaryAction && (
          <button
            onClick={secondaryAction.onClick}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '9px 16px',
              backgroundColor: 'transparent',
              border: '1px solid var(--color-line-2)',
              borderRadius: 999,
              color: 'var(--color-ink-2)',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-ink)'
              ;(e.currentTarget as HTMLElement).style.color = 'var(--color-ink)'
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-line-2)'
              ;(e.currentTarget as HTMLElement).style.color = 'var(--color-ink-2)'
            }}
          >
            {secondaryAction.label}
            <IconArrowNarrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  )
}
