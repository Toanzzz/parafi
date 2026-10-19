import { mkdtemp, readFile, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../src/app'
import { loadEnv } from '../src/config'
import { createStore } from '../src/store'

let dataFile: string
// biome-ignore lint/suspicious/noExplicitAny: test responses are asserted field by field
const body = async (res: Response): Promise<any> => res.json()
let app: ReturnType<typeof createApp>
const auth = { authorization: 'Bearer user-1-token' }
const json = (body: unknown) => ({
  method: 'POST',
  headers: { ...auth, 'content-type': 'application/json' },
  body: JSON.stringify(body),
})

beforeEach(async () => {
  dataFile = join(await mkdtemp(join(tmpdir(), 'agent-')), 'agents.json')
  const env = loadEnv({ PARA_API_KEY_ID: 'app-key-id', DATA_FILE: dataFile })
  app = createApp(env, createStore(dataFile), async (token) => {
    if (token !== 'user-1-token') throw new Error('bad token')
    return 'user-1'
  })
})

describe('agent API', () => {
  it('serves health without auth and rejects other routes without a token', async () => {
    expect((await app.request('/api/health')).status).toBe(200)
    expect((await app.request('/api/me')).status).toBe(401)
    expect(
      (
        await app.request('/api/me', {
          headers: { authorization: 'Bearer nope' },
        })
      ).status
    ).toBe(401)
  })

  it('creates a delegate key and returns only its public key', async () => {
    const res = await app.request('/api/delegate', {
      method: 'POST',
      headers: auth,
    })
    const created = await body(res)
    expect(created.agentPublicKey).toMatch(/^[0-9a-f]{64}$/)
    expect(Object.keys(created)).toEqual(['agentPublicKey'])

    const stored = JSON.parse(await readFile(dataFile, 'utf8'))['user-1']
    expect(stored.delegatePrivateKey).toMatch(/^[0-9a-f]{64}$/)
    expect(stored.delegatePrivateKey).not.toBe(created.agentPublicKey)
    expect((await stat(dataFile)).mode & 0o777).toBe(0o600)
  })

  it('reuses an authorized key and rotates a revoked one', async () => {
    const first = await body(
      await app.request('/api/delegate', { method: 'POST', headers: auth })
    )
    await app.request('/api/delegate/authorized', {
      method: 'POST',
      headers: auth,
    })
    const again = await body(
      await app.request('/api/delegate', { method: 'POST', headers: auth })
    )
    expect(again.agentPublicKey).toBe(first.agentPublicKey)

    await app.request('/api/delegate/revoked', {
      method: 'POST',
      headers: auth,
    })
    const rotated = await body(
      await app.request('/api/delegate', { method: 'POST', headers: auth })
    )
    expect(rotated.agentPublicKey).not.toBe(first.agentPublicKey)
  })

  it('links a Sui account ID and keeps it across key rotation', async () => {
    await app.request('/api/delegate', { method: 'POST', headers: auth })
    const accountId = `0x${'ab'.repeat(32)}`
    expect(
      (await app.request('/api/account', json({ accountId: 'nope' }))).status
    ).toBe(500)
    expect(
      (await app.request('/api/account', json({ accountId }))).status
    ).toBe(200)
    await app.request('/api/delegate/revoked', {
      method: 'POST',
      headers: auth,
    })
    await app.request('/api/delegate', { method: 'POST', headers: auth })
    const me = await body(await app.request('/api/me', { headers: auth }))
    expect(me).toMatchObject({
      userId: 'user-1',
      accountId,
      authorized: false,
      appMemoryConfigured: false,
    })
  })

  it('explains missing setup instead of calling the relayer', async () => {
    const recall = await app.request(
      '/api/memory/recall',
      json({ query: 'rent' })
    )
    expect(await body(recall)).toEqual({ error: 'Set up agent memory first' })
    const appRecall = await app.request(
      '/api/app-memory/recall',
      json({ query: 'rent' })
    )
    expect((await body(appRecall)).error).toContain('MEMWAL_ACCOUNT_ID')
  })
})
