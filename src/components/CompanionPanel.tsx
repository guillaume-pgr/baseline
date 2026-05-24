export default function CompanionPanel() {
  return (
    <aside
      className="flex flex-col h-screen shrink-0"
      style={{
        width: 380,
        backgroundColor: 'var(--color-surface)',
        borderLeft: '1px solid var(--color-line)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center px-5"
        style={{ height: 56, borderBottom: '1px solid var(--color-line)' }}
      >
        <span
          className="font-mono text-xs uppercase tracking-widest"
          style={{ color: 'var(--color-ink-3)' }}
        >
          Assistant
        </span>
      </div>

      {/* Content placeholder */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
        <div
          className="w-10 h-10 rounded-full"
          style={{ backgroundColor: 'var(--color-aqua-soft)' }}
        />
        <p
          className="text-sm text-center leading-relaxed"
          style={{ color: 'var(--color-ink-4)' }}
        >
          L'assistant contextuel apparaîtra ici lors des phases suivantes.
        </p>
      </div>
    </aside>
  )
}
