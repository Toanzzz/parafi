# Mintlify Starter Kit

Use the starter kit to get your docs deployed and ready to customize.

Click the green **Use this template** button at the top of this repo to copy the Mintlify starter kit. The starter kit contains examples with

- Guide pages
- Navigation
- Customizations
- API reference pages
- Use of popular components

**[Follow the full quickstart guide](https://starter.mintlify.com/quickstart)**

## AI-assisted writing

Set up your AI coding tool to work with Mintlify:

```bash
npx skills add https://mintlify.com/docs
```

This command installs Mintlify's documentation skill for your configured AI tools like Claude Code, Cursor, Windsurf, and others. The skill includes component reference, writing standards, and workflow guidance.

See the [AI tools guides](/ai-tools) for tool-specific setup.

## Development

The repo root is a Bun workspace: the Mintlify docs plus the Walrus Memory example in `apps/`. The [Mintlify CLI](https://www.npmjs.com/package/mint) is a dev dependency, so no global install is needed:

```bash
bun install
bun run dev   # docs http://localhost:58000, web http://localhost:58001, agent :58002
```

## Walrus Memory example app

`apps/web` and `apps/agent` follow [`walkthroughs/walrus-memory.mdx`](walkthroughs/walrus-memory.mdx) step by step, on Sui Mainnet.

- `apps/web` — Vite + React. Para login, the user's Para Sui wallet creates the Walrus Memory account, authorizes and revokes the agent (guide Steps 2, 3, 5, 7).
- `apps/agent` — Bun + Hono. Holds the agent's delegate key, remembers and recalls (guide Steps 4, 6), and the app-managed flow (App-Managed Memory, Steps 3–4).

Set up the environment before `bun run dev`:

```bash
cp apps/web/.env.example apps/web/.env.local   # set VITE_PARA_API_KEY
cp apps/agent/.env.example apps/agent/.env      # set PARA_API_KEY_ID: the aud claim of a Para session token
```

Add `http://localhost:58001` to your Para app's allowed origins in the [Developer Portal](https://developer.getpara.com). Otherwise Para's API rejects the app with `403 origin not authorized`.

Log in, then send at least 0.01 SUI to the Sui address the app shows. Creating the account, authorizing the agent, and revoking it cost about 0.005 SUI in total.

Checks:

```bash
bun run check && bun run check:types && bun run build && bun run test
```

## Publishing changes

Install our GitHub app from your [dashboard](https://dashboard.mintlify.com/settings/organization/github-app) to propagate changes from your repo to your deployment. Changes are deployed to production automatically after pushing to the default branch.

## Need help?

### Troubleshooting

- If your dev environment isn't running: Run `bun update mint` to get the most recent version of the CLI.
- If a page loads as a 404: Make sure you are running in a folder with a valid `docs.json`.

### Resources
- [Mintlify documentation](https://mintlify.com/docs)
