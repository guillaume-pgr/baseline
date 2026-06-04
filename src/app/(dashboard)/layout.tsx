import Sidebar from '@/components/Sidebar'
import CompanionPanel from '@/components/CompanionPanel'
import DemoModeBanner from '@/components/DemoModeBanner'
import AppFooter from '@/components/AppFooter'
import RejectedGate from '@/components/RejectedGate'
import MobileGate from '@/components/MobileGate'
import { PersonaProvider } from '@/lib/context/PersonaContext'
import { SessionProvider } from '@/lib/context/SessionContext'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <MobileGate>
    <SessionProvider>
      <PersonaProvider>
        <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--color-bg)' }}>
          <Sidebar />
          <main className="flex-1 overflow-y-auto flex flex-col">
            <DemoModeBanner />
            <div className="flex-1 flex flex-col">
              <RejectedGate>{children}</RejectedGate>
            </div>
            <AppFooter />
          </main>
          <CompanionPanel />
        </div>
      </PersonaProvider>
    </SessionProvider>
    </MobileGate>
  )
}
