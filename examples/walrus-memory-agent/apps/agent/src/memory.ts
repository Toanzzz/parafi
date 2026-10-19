import { MemWal } from '@mysten-incubation/memwal'
import { generateDelegateKey } from '@mysten-incubation/memwal/account'

// Guide, User-Owned Memory, Step 4: generate the agent's delegate key on the backend
export async function createAgentDelegate() {
  const delegate = await generateDelegateKey()

  // Keep delegate.privateKey in your secrets store, keyed by the Para user.
  // Return only the public key to the client.
  const agentPublicKey = Buffer.from(delegate.publicKey).toString('hex')
  return { delegatePrivateKey: delegate.privateKey, agentPublicKey }
}

// Guide, User-Owned Memory, Step 6: a Walrus Memory client for the user's account
export function userMemory(
  delegatePrivateKey: string,
  accountId: string,
  serverUrl: string
) {
  return MemWal.create({
    key: delegatePrivateKey,
    accountId,
    serverUrl,
    namespace: 'payments-agent',
  })
}

// Guide, App-Managed Memory, Step 4: one app-owned account, namespace per Para user
export function appMemory(
  privateKey: string,
  accountId: string,
  serverUrl: string
) {
  return MemWal.create({ key: privateKey, accountId, serverUrl })
}

export function appNamespace(paraUserId: string) {
  return `myapp-${paraUserId}`
}
