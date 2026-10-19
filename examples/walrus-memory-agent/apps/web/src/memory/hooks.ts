import { useAccount, useLogout, useParaSuiSigner } from '@getpara/react-sdk'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, type Me, type Memory, type Remembered } from '../api'
import { suiClient } from '../para'
import { logActivity } from '../store'
import { authorizeAgent, createMemoryAccount, revokeAgent } from './account'

export function useMe() {
  const queryClient = useQueryClient()
  const { isConnected } = useAccount()
  return useQuery({
    queryKey: ['me'],
    queryFn: () => api<Me>(queryClient, '/me'),
    enabled: isConnected,
  })
}

export function useSignOut() {
  const queryClient = useQueryClient()
  const { logoutAsync } = useLogout()
  return useMutation({
    mutationFn: async () => {
      await queryClient.cancelQueries()
      await logoutAsync()
    },
    // The authed cards unmount once Para reports the logout; then drop per-user data so the next
    // login never reuses the previous user's session token or agent state.
    onSuccess: () => {
      for (const key of ['para-jwt', 'me', 'sui-balance'])
        queryClient.removeQueries({ queryKey: [key] })
    },
  })
}

export function useSuiWallet() {
  // Guide, Step 2 tip: the React hook returns the same Para-backed Sui signer
  const { suiSigner } = useParaSuiSigner({ client: suiClient })
  const address = suiSigner?.toSuiAddress()
  const balance = useQuery({
    queryKey: ['sui-balance', address],
    queryFn: async () => {
      const { balance } = await suiClient.core.getBalance({
        owner: address as string,
      })
      return Number(balance.balance) / 1e9
    },
    enabled: Boolean(address),
    refetchInterval: 10_000,
  })
  return { address, balance: balance.data }
}

export function useSetupMemory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (me: Me) => {
      // Step 4: the agent backend generates the delegate key and returns only the public key
      const { agentPublicKey } = await api<{ agentPublicKey: string }>(
        queryClient,
        '/delegate',
        {}
      )
      logActivity({
        label: 'Agent delegate key created',
        detail: agentPublicKey,
      })

      // Step 5: create the account once, store it with the user, then authorize the agent
      let accountId = me.accountId
      if (!accountId) {
        const created = await createMemoryAccount()
        accountId = created.accountId
        logActivity({
          label: 'Walrus Memory account created',
          detail: accountId,
          digest: created.digest,
        })
        await api(queryClient, '/account', { accountId })
      }
      const added = await authorizeAgent(accountId, agentPublicKey)
      logActivity({
        label: 'Agent authorized',
        detail: added.suiAddress,
        digest: added.digest,
      })
      await api(queryClient, '/delegate/authorized', {})
    },
    onError: (error) =>
      logActivity({ label: 'Setup failed', detail: error.message }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['me'] }),
  })
}

export function useRevokeAgent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (me: Me) => {
      if (!me.accountId || !me.agentPublicKey)
        throw new Error('No agent to revoke')
      // Step 7: remove the agent's delegate key with the user's Para wallet
      const { digest } = await revokeAgent(me.accountId, me.agentPublicKey)
      logActivity({ label: 'Agent revoked', detail: me.agentPublicKey, digest })
      await api(queryClient, '/delegate/revoked', {})
    },
    onError: (error) =>
      logActivity({ label: 'Revoke failed', detail: error.message }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['me'] }),
  })
}

type Scope = 'memory' | 'app-memory'

export function useRemember(scope: Scope) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (text: string) =>
      api<Remembered>(queryClient, `/${scope}/remember`, { text }),
    onSuccess: (r) =>
      logActivity({
        label: `Remembered (${scope})`,
        detail: `blob ${r.blob_id} in ${r.namespace}`,
      }),
    onError: (error) =>
      logActivity({
        label: `Remember failed (${scope})`,
        detail: error.message,
      }),
  })
}

export function useRecall(scope: Scope) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (query: string) =>
      api<{ results: Memory[] }>(queryClient, `/${scope}/recall`, {
        query,
      }).then((r) => r.results),
    onError: (error) =>
      logActivity({ label: `Recall failed (${scope})`, detail: error.message }),
  })
}
