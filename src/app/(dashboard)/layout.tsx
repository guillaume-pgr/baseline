import Sidebar from '@/components/Sidebar'
import CompanionPanel from '@/components/CompanionPanel'
import DemoModeBanner from '@/components/DemoModeBanner'
import AppFooter from '@/components/AppFooter'
import RejectedGate from '@/components/RejectedGate'
import MobileBottomNav from '@/components/mobile/MobileBottomNav'
import { PersonaProvider } from '@/lib/context/PersonaContext'
import { SessionProvider } from '@/lib/context/SessionContext'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <PersonaProvider>
        {/* Mobile: single column + fixed bottom nav (sidebar/companion hidden).
            Desktop (md+): fixed-viewport 3-column app shell (unchanged). */}
        <div
          className="flex flex-col md:flex-row min-h-screen md:h-screen overflow-visible md:overflow-hidden"
          style={{ backgroundColor: 'var(--color-bg)' }}
        >
          <Sidebar />
          <main className="flex-1 overflow-y-auto flex flex-col pb-16 md:pb-0">
            <DemoModeBanner />
            <div className="flex-1 flex flex-col">
              <RejectedGate>{children}</RejectedGate>
            </div>
            <AppFooter />
          </main>
          {/* Companion panel — desktop only */}
          <div className="hidden md:flex shrink-0">
            <CompanionPanel />
          </div>
        </div>
        <MobileBottomNav />
      </PersonaProvider>
    </SessionProvider>
  )
}
