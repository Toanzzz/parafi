import { z } from 'zod'

const Env = z.object({
  PORT: z.coerce.number().default(58002),
  PARA_JWKS_URL: z
    .url()
    .default('https://api.beta.getpara.com/.well-known/jwks.json'),
  PARA_API_KEY_ID: z
    .string()
    .min(1, 'Set PARA_API_KEY_ID to the aud claim of your Para tokens'),
  MEMWAL_RELAYER_URL: z.url().default('https://relayer.memory.walrus.xyz'),
  MEMWAL_ACCOUNT_ID: z.string().optional(),
  MEMWAL_PRIVATE_KEY: z.string().optional(),
  DATA_FILE: z.string().default('./data/agents.json'),
})

export type Env = z.infer<typeof Env>

export function loadEnv(
  source: Record<string, string | undefined> = process.env
): Env {
  return Env.parse(source)
}
