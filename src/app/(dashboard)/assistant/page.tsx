import CompanionPanel from '@/components/CompanionPanel'

// Mobile-only route (reached via the bottom nav). Renders the assistant
// (FAQ + chat) full-screen. On desktop the assistant lives in the right-hand
// panel, so this page is hidden there.
export default function AssistantPage() {
  return (
    <div className="md:hidden" style={{ height: 'calc(100dvh - 60px)' }}>
      <CompanionPanel />
    </div>
  )
}
