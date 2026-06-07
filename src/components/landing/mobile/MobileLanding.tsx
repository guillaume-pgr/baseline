import MobileHeader from './MobileHeader'
import Hero from './Hero'
import ProductPreview from './ProductPreview'
import Pillars from './Pillars'
import PricingTeaser from './PricingTeaser'
import { C } from './tokens'

/**
 * Mobile (<768px) marketing landing — single column.
 * Rendered by the root page only below the `md` breakpoint; the desktop split
 * layout (LandingPage) is unchanged.
 */
export default function MobileLanding() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.cream, color: C.ink, fontFamily: 'var(--font-sans)' }}>
      <MobileHeader />
      <Hero />
      <ProductPreview />
      <Pillars />
      <PricingTeaser />

      {/* Disclaimer */}
      <div style={{ padding: '0 18px 22px', textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: 10, color: C.disclaimer }}>
          Lyvio est un service de bien-être et d&apos;éducation. Il ne remplace pas un avis médical.
        </p>
      </div>
    </div>
  )
}
