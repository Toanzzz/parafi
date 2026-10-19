import { createApp } from './app'
import { createVerifyParaUser, paraJwks } from './auth'
import { loadEnv } from './config'
import { log } from './logger'
import { createStore } from './store'

const env = loadEnv()
const app = createApp(
  env,
  createStore(env.DATA_FILE),
  createVerifyParaUser(paraJwks(env.PARA_JWKS_URL), env.PARA_API_KEY_ID)
)

log('info', 'server_started', `listening on http://localhost:${env.PORT}`)

export default { port: env.PORT, fetch: app.fetch, idleTimeout: 120 }
