import { useModal } from '@getpara/react-sdk'
import { useStore } from '@tanstack/react-store'
import {
  useMe,
  useRevokeAgent,
  useSetupMemory,
  useSignOut,
  useSuiWallet,
} from '../memory/hooks'
import { ui } from '../store'
import { MemoryPanel } from './MemoryPanel'

const suiscan = (kind: 'tx' | 'object' | 'account', id: string) =>
  `https://suiscan.xyz/mainnet/${kind}/${id}`

export function LoginCard({ isConnected }: { isConnected: boolean }) {
  const { openModal } = useModal()
  const signOut = useSignOut()
  const { address, balance } = useSuiWallet()
  const me = useMe()

  if (!isConnected) {
    return (
      <section className="card">
        <h2>1. Log in with Para</h2>
        <button type="button" onClick={() => openModal()}>
          Log in
        </button>
      </section>
    )
  }
  return (
    <section className="card" data-testid="wallet">
      <h2>1. Para wallet</h2>
      <dl>
        <dt>Para user</dt>
        <dd data-testid="para-user">
          {me.data?.userId ?? me.error?.message ?? '…'}
        </dd>
        <dt>Sui address</dt>
        <dd>
          {address ? (
            <a
              data-testid="sui-address"
              href={suiscan('account', address)}
              target="_blank"
              rel="noreferrer"
            >
              {address}
            </a>
          ) : (
            '…'
          )}
        </dd>
        <dt>Balance</dt>
        <dd data-testid="sui-balance">
          {balance === undefined ? '…' : `${balance} SUI`}
        </dd>
      </dl>
      <button
        type="button"
        className="secondary"
        onClick={() => signOut.mutate()}
      >
        Log out
      </button>
    </section>
  )
}

export function UserMemoryCard() {
  const me = useMe().data
  const setup = useSetupMemory()
  const revoke = useRevokeAgent()
  if (!me) return null
  const ready = Boolean(me.accountId && me.authorized)

  return (
    <section className="card" data-testid="user-memory">
      <h2>2. User-owned memory</h2>
      <dl>
        <dt>Memory account</dt>
        <dd data-testid="account-id">
          {me.accountId ? (
            <a href={suiscan('object', me.accountId)}>{me.accountId}</a>
          ) : (
            'Not created'
          )}
        </dd>
        <dt>Agent key</dt>
        <dd data-testid="agent-status">
          {me.agentPublicKey ? `${me.agentPublicKey.slice(0, 16)}… ` : 'None '}
          {me.authorized
            ? '(authorized)'
            : me.agentPublicKey
              ? '(not authorized)'
              : ''}
        </dd>
      </dl>
      <div className="row">
        <button
          type="button"
          disabled={ready || setup.isPending}
          onClick={() => setup.mutate(me)}
        >
          {setup.isPending
            ? 'Waiting for Para signatures…'
            : 'Set up agent memory'}
        </button>
        <button
          type="button"
          className="danger"
          disabled={!ready || revoke.isPending}
          onClick={() => revoke.mutate(me)}
        >
          {revoke.isPending ? 'Revoking…' : 'Revoke agent'}
        </button>
      </div>
      {setup.error && <p className="error">{setup.error.message}</p>}
      {revoke.error && <p className="error">{revoke.error.message}</p>}
      <MemoryPanel
        scope="memory"
        rememberField="rememberText"
        recallField="recallQuery"
        disabled={!me.accountId}
      />
    </section>
  )
}

export function AppMemoryCard() {
  const me = useMe().data
  if (!me) return null
  return (
    <section className="card" data-testid="app-memory">
      <h2>3. App-managed memory</h2>
      {me.appMemoryConfigured ? (
        <MemoryPanel
          scope="app-memory"
          rememberField="appRememberText"
          recallField="appRecallQuery"
        />
      ) : (
        <p className="muted">
          Set MEMWAL_ACCOUNT_ID and MEMWAL_PRIVATE_KEY in apps/agent/.env to
          enable this.
        </p>
      )}
    </section>
  )
}

export function ActivityLog() {
  const activity = useStore(ui, (s) => s.activity)
  if (activity.length === 0) return null
  return (
    <section className="card">
      <h2>Activity</h2>
      <ul className="activity" data-testid="activity">
        {activity.map((a) => (
          <li key={a.at + a.label}>
            <strong>{a.label}</strong> {a.detail && <code>{a.detail}</code>}{' '}
            {a.digest && (
              <a
                href={suiscan('tx', a.digest)}
                target="_blank"
                rel="noreferrer"
              >
                tx
              </a>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
