/**
 * Marketing palette for the MOBILE landing surface only.
 *
 * Deliberately scoped to these components rather than the global @theme tokens:
 * the app-wide --color-ink is near-black (#1A1A1A) and the whole dashboard
 * depends on it, whereas the marketing identity uses a navy ink (#1A2B3D) +
 * lime accent. Keeping these local avoids shifting the app's colours.
 */
export const C = {
  cream: '#FAFAF8', // page background (matches global --color-bg)
  ink: '#1A2B3D', // navy — titles & primary text
  inkSoft: '#5A6675', // secondary body text on cream (AA: 5.7:1)
  lime: '#C8E66C', // primary accent / fills
  green: '#5FA02E', // positive accent — dots, large/decorative use
  greenText: '#487E20', // darker green for small text on cream (AA: 4.8:1)
  line: '#ECEAE2', // hairline borders
  card: '#F2F4EC', // soft card background (pricing)
  trackDark: '#2C4055', // progress / ring track on the dark card
  onInk: '#F0F2F5', // primary text on the ink card
  onInkSoft: '#C2CDD8', // secondary text on the ink card
  onInkSoft2: '#9FB0C0', // tertiary text on the ink card
  disclaimer: '#9AA4B0', // footer disclaimer
} as const

// Editorial serif (Fraunces) — wired via the html font variable in layout.tsx.
export const serif = 'var(--font-serif), Georgia, serif'

// Auth routes reused as-is (dedicated form pages already in the app).
export const ROUTE_SIGNUP = '/auth/signup'
export const ROUTE_SIGNIN = '/auth/signin'
