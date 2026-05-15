export default function HomePage() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center gap-12 p-12"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      {/* Titre hero */}
      <div className="text-center space-y-3">
        <p
          className="font-mono text-xs uppercase tracking-widest"
          style={{ color: "var(--color-ink-3)" }}
        >
          Baseline · v0.1 · Performance
        </p>
        <h1
          className="text-6xl leading-none"
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 200,
            color: "var(--color-ink)",
            letterSpacing: "-0.04em",
          }}
        >
          Ton corps performe comme un{" "}
          <span style={{ fontWeight: 700 }}>26 ans</span>.
        </h1>
      </div>

      {/* Chiffre mono */}
      <div className="text-center">
        <span
          className="font-mono text-4xl"
          style={{ color: "var(--color-ink-2)", letterSpacing: "-0.02em" }}
        >
          95<sup className="text-xl" style={{ color: "var(--color-ink-3)" }}>e</sup> percentile
        </span>
        <p className="mt-2 text-sm" style={{ color: "var(--color-ink-4)" }}>
          Hommes actifs 28–34 (n=2 840)
        </p>
      </div>

      {/* Swatches biotech */}
      <div className="flex gap-4 flex-wrap justify-center">
        {[
          { name: "Aqua", bg: "var(--color-aqua)", soft: "var(--color-aqua-soft)" },
          { name: "Lichen", bg: "var(--color-lichen)", soft: "var(--color-lichen-soft)" },
          { name: "Amber", bg: "var(--color-amber)", soft: "var(--color-amber-soft)" },
          { name: "Rust", bg: "var(--color-rust)", soft: "var(--color-rust-soft)" },
          { name: "Lavender", bg: "var(--color-lavender)", soft: "var(--color-lavender-soft)" },
        ].map(({ name, bg, soft }) => (
          <div key={name} className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-lg" style={{ backgroundColor: bg }} />
            <div
              className="w-12 h-12 rounded-lg border"
              style={{ backgroundColor: soft, borderColor: "var(--color-line-2)" }}
            />
            <span className="font-mono text-xs" style={{ color: "var(--color-ink-3)" }}>
              {name}
            </span>
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-center max-w-sm" style={{ color: "var(--color-ink-4)" }}>
        Outil éducatif. Ne remplace pas un avis médical.
      </p>
    </main>
  );
}
