# Agent Memory via Walrus — example app

A Para + Walrus Memory app built by following [`walkthroughs/walrus-memory.mdx`](../../walkthroughs/walrus-memory.mdx) step by step, on Sui Mainnet.

- `apps/web` — Vite + React. Para login, the user's Para Sui wallet creates the Walrus Memory account, authorizes and revokes the agent (guide Steps 2, 3, 5, 7).
- `apps/agent` — Bun + Hono. Holds the agent's delegate key, remembers and recalls (guide Steps 4, 6), and the app-managed flow (App-Managed Memory, Steps 3–4).

## Run

```bash
bun install
cp apps/web/.env.example apps/web/.env.local   # set VITE_PARA_API_KEY
cp apps/agent/.env.example apps/agent/.env      # set PARA_API_KEY_ID: the aud claim of a Para session token
bun run dev                                     # web http://localhost:58001, agent :58002
```

Add `http://localhost:58001` to your Para app's allowed origins in the [Developer Portal](https://developer.getpara.com). Otherwise Para's API rejects the app with `403 origin not authorized`.

Log in, then send at least 0.01 SUI to the Sui address the app shows. Creating the account, authorizing the agent, and revoking it cost about 0.005 SUI in total.

## Checks

```bash
bun run check && bun run check:types && bun run build && bun run test
```
