import { Hono } from 'hono'
import { createMiddleware } from 'hono/factory'
import { z } from 'zod'
import { bearerToken, type VerifyParaUser } from './auth'
import type { Env } from './config'
import { log } from './logger'
import {
  appMemory,
  appNamespace,
  createAgentDelegate,
  userMemory,
} from './memory'
import type { Store } from './store'

const Text = z.object({ text: z.string().trim().min(1).max(2000) })
const Query = z.object({ query: z.string().trim().min(1).max(500) })
const Account = z.object({ accountId: z.string().regex(/^0x[0-9a-f]{64}$/i) })

export function createApp(
  env: Env,
  store: Store,
  verifyParaUser: VerifyParaUser
) {
  const app = new Hono<{ Variables: { userId: string } }>().basePath('/api')

  app.onError((error, c) => {
    log(
      'error',
      'request_failed',
      `${c.req.method} ${c.req.path}: ${error.message}`
    )
    return c.json({ error: error.message }, 500)
  })

  app.get('/health', (c) => c.json({ ok: true }))

  app.use(
    '/*',
    createMiddleware<{ Variables: { userId: string } }>(async (c, next) => {
      if (c.req.path === '/api/health') return next()
      const token = bearerToken(c.req.header('authorization'))
      if (!token) return c.json({ error: 'Missing Para session token' }, 401)
      try {
        c.set('userId', await verifyParaUser(token))
      } catch (error) {
        log('warn', 'auth_rejected', (error as Error).message)
        return c.json({ error: 'Invalid Para session token' }, 401)
      }
      await next()
    })
  )

  async function requireAgent(userId: string) {
    const record = await store.get(userId)
    if (!record?.accountId) throw new Error('Set up agent memory first')
    return { ...record, accountId: record.accountId }
  }

  return app
    .get('/me', async (c) => {
      const record = await store.get(c.get('userId'))
      return c.json({
        userId: c.get('userId'),
        agentPublicKey: record?.agentPublicKey ?? null,
        accountId: record?.accountId ?? null,
        authorized: record?.authorized ?? false,
        appMemoryConfigured: Boolean(
          env.MEMWAL_ACCOUNT_ID && env.MEMWAL_PRIVATE_KEY
        ),
      })
    })
    .post('/delegate', async (c) => {
      const userId = c.get('userId')
      const existing = await store.get(userId)
      if (existing?.authorized)
        return c.json({ agentPublicKey: existing.agentPublicKey })
      const delegate = await createAgentDelegate()
      await store.put(userId, {
        ...delegate,
        accountId: existing?.accountId,
        authorized: false,
      })
      log(
        'info',
        'delegate_created',
        `user ${userId} key ${delegate.agentPublicKey}`
      )
      return c.json({ agentPublicKey: delegate.agentPublicKey })
    })
    .post('/account', async (c) => {
      const { accountId } = Account.parse(await c.req.json())
      await store.update(c.get('userId'), { accountId })
      log(
        'info',
        'account_linked',
        `user ${c.get('userId')} account ${accountId}`
      )
      return c.json({ accountId })
    })
    .post('/delegate/authorized', async (c) => {
      await store.update(c.get('userId'), { authorized: true })
      return c.json({ authorized: true })
    })
    .post('/delegate/revoked', async (c) => {
      // Keep the key so the example can show the relayer rejecting it after revocation
      await store.update(c.get('userId'), { authorized: false })
      return c.json({ authorized: false })
    })
    .post('/memory/remember', async (c) => {
      const { text } = Text.parse(await c.req.json())
      const agent = await requireAgent(c.get('userId'))
      const memwal = userMemory(
        agent.delegatePrivateKey,
        agent.accountId,
        env.MEMWAL_RELAYER_URL
      )
      const result = await memwal.rememberAndWait(text)
      log(
        'info',
        'memory_remembered',
        `blob ${result.blob_id} owner ${result.owner}`
      )
      return c.json(result)
    })
    .post('/memory/recall', async (c) => {
      const { query } = Query.parse(await c.req.json())
      const agent = await requireAgent(c.get('userId'))
      const memwal = userMemory(
        agent.delegatePrivateKey,
        agent.accountId,
        env.MEMWAL_RELAYER_URL
      )
      const { results } = await memwal.recall({ query, limit: 5 })
      return c.json({ results })
    })
    .post('/app-memory/remember', async (c) => {
      const { text } = Text.parse(await c.req.json())
      const result = await appClient().rememberAndWait(
        text,
        appNamespace(c.get('userId'))
      )
      return c.json(result)
    })
    .post('/app-memory/recall', async (c) => {
      const { query } = Query.parse(await c.req.json())
      const namespace = appNamespace(c.get('userId'))
      const { results } = await appClient().recall({
        query,
        namespace,
        limit: 5,
      })
      return c.json({ results })
    })

  function appClient() {
    if (!env.MEMWAL_ACCOUNT_ID || !env.MEMWAL_PRIVATE_KEY) {
      throw new Error(
        'Set MEMWAL_ACCOUNT_ID and MEMWAL_PRIVATE_KEY for app-managed memory'
      )
    }
    return appMemory(
      env.MEMWAL_PRIVATE_KEY,
      env.MEMWAL_ACCOUNT_ID,
      env.MEMWAL_RELAYER_URL
    )
  }
}

export type AppType = ReturnType<typeof createApp>
