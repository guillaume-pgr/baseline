export default function PageSummary({ text }: { text: string }) {
  return (
    <div style={{
      marginBottom: 32,
      padding: '14px 18px',
      backgroundColor: 'var(--color-surface)',
      border: '1px solid var(--color-line)',
      borderRadius: 10,
    }}>
      <p style={{
        fontSize: 13,
        color: 'var(--color-ink-2)',
        lineHeight: 1.65,
        margin: 0,
      }}>
        {text}
      </p>
    </div>
  )
}
