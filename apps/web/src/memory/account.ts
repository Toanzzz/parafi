import { getSuiSigner } from '@getpara/react-sdk/sui/actions'
import {
  addDelegateKey,
  createAccount,
  removeDelegateKey,
} from '@mysten-incubation/memwal/account'
import { para, suiClient } from '../para'
import { createWalletSigner } from './wallet-signer'

// Walrus Memory contract on Sui
const MEMWAL_PACKAGE_ID =
  '0xe7c16fbea0560e7057e2bf7422feaa4fb313749fc69c9e9092fac7a33b81d7f5'
const MEMWAL_REGISTRY_ID =
  '0x8bf82c9e09e36b8d1c38298f68b7cb68e7b8762887e7592add9986d5e9cf199f'

async function paraWalletSigner() {
  // Guide, Step 2: a @mysten/sui Signer backed by the user's Para Sui wallet
  const signer = await getSuiSigner({ para, client: suiClient })
  return createWalletSigner(signer, suiClient)
}

// Guide, Step 5: read the account ID from the AccountCreated event the owner's address emitted
async function findAccountId(owner: string) {
  const query = `{
    events(last: 1, filter: {
      type: "${MEMWAL_PACKAGE_ID}::account::AccountCreated",
      sender: "${owner}"
    }) { nodes { contents { json } } }
  }`
  const { data } = await fetch('https://graphql.mainnet.sui.io/graphql', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query }),
  }).then((res) => res.json())
  return data.events.nodes[0]?.contents.json.account_id as string | undefined
}

// Guide, Step 5: one account per Sui address; reuse it, or create it once and store accountId with the user
export async function getOrCreateMemoryAccount(): Promise<{
  accountId: string
  digest?: string
}> {
  const walletSigner = await paraWalletSigner()
  const accountId = await findAccountId(walletSigner.address)
  if (accountId) return { accountId }

  return createAccount({
    packageId: MEMWAL_PACKAGE_ID,
    registryId: MEMWAL_REGISTRY_ID,
    walletSigner,
    suiClient,
  })
}

// Guide, Step 5: authorize the agent's delegate key to read and write this account's memory
export async function authorizeAgent(
  accountId: string,
  agentPublicKey: string
) {
  const walletSigner = await paraWalletSigner()
  return addDelegateKey({
    packageId: MEMWAL_PACKAGE_ID,
    registryId: MEMWAL_REGISTRY_ID,
    accountId,
    publicKey: agentPublicKey,
    label: 'Payments agent',
    walletSigner,
    suiClient,
  })
}

// Guide, Step 7: revoke the agent from the user's Para wallet
export async function revokeAgent(accountId: string, agentPublicKey: string) {
  const walletSigner = await paraWalletSigner()
  return removeDelegateKey({
    packageId: MEMWAL_PACKAGE_ID,
    registryId: MEMWAL_REGISTRY_ID,
    accountId,
    publicKey: agentPublicKey,
    walletSigner,
    suiClient,
  })
}
