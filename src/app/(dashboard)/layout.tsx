import Sidebar from '@/components/Sidebar'
import CompanionPanel from '@/components/CompanionPanel'
import { PersonaProvider } from '@/lib/context/PersonaContext'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <PersonaProvider>
      <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--color-bg)' }}>
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
        <CompanionPanel />
      </div>
    </PersonaProvider>
  )
}
