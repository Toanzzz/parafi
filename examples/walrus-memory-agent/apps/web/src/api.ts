import type { QueryClient } from '@tanstack/react-query'
import { para } from './para'

export interface Me {
  userId: string
  agentPublicKey: string | null
  accountId: string | null
  authorized: boolean
  appMemoryConfigured: boolean
}

export interface Memory {
  blob_id: string
  text: string
  distance: number
  created_at?: string
}

export interface Remembered {
  blob_id: string
  owner: string
  namespace: string
}

// Para session JWT for the agent backend (guide, App-Managed Memory, Step 3)
function paraToken(queryClient: QueryClient) {
  return queryClient.fetchQuery({
    queryKey: ['para-jwt'],
    queryFn: () => para.issueJwt(),
    staleTime: 5 * 60_000,
  })
}

export async function api<T>(
  queryClient: QueryClient,
  path: string,
  body?: unknown
): Promise<T> {
  const { token } = await paraToken(queryClient)
  const res = await fetch(`/api${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? res.statusText)
  return data as T
}
