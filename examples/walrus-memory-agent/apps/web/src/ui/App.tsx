import { useAccount } from '@getpara/react-sdk'
import { ActivityLog, AppMemoryCard, LoginCard, UserMemoryCard } from './Cards'

export function App() {
  const { isConnected } = useAccount()
  return (
    <main className="page">
      <header>
        <h1>Agent Memory via Walrus</h1>
        <p className="muted">
          Para wallets + Walrus Memory on Sui Mainnet, following the Partner
          Network guide.
        </p>
      </header>
      <LoginCard isConnected={isConnected} />
      {isConnected && (
        <>
          <UserMemoryCard />
          <AppMemoryCard />
        </>
      )}
      <ActivityLog />
    </main>
  )
}
