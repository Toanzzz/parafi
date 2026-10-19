import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'

export interface AgentRecord {
  delegatePrivateKey: string
  agentPublicKey: string
  accountId?: string
  authorized: boolean
}

// Example-only secrets store: a JSON file keyed by Para user ID. Use a real secrets manager in production.
export function createStore(file: string) {
  async function readAll(): Promise<Record<string, AgentRecord>> {
    try {
      return JSON.parse(await readFile(file, 'utf8'))
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return {}
      throw error
    }
  }

  async function writeAll(records: Record<string, AgentRecord>) {
    await mkdir(dirname(file), { recursive: true })
    await writeFile(file, JSON.stringify(records, null, 2), { mode: 0o600 })
  }

  return {
    async get(userId: string) {
      return (await readAll())[userId]
    },
    async put(userId: string, record: AgentRecord) {
      const records = await readAll()
      records[userId] = record
      await writeAll(records)
      return record
    },
    async update(userId: string, patch: Partial<AgentRecord>) {
      const records = await readAll()
      const current = records[userId]
      if (!current) throw new Error('No agent delegate for this user')
      records[userId] = { ...current, ...patch }
      await writeAll(records)
      return records[userId]
    },
  }
}

export type Store = ReturnType<typeof createStore>
