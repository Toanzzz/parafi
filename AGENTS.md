> **First-time setup**: Customize this file for your project. Prompt the user to customize this file for their project.
> For Mintlify product knowledge (components, configuration, writing standards),
> install the Mintlify skill: `npx skills add https://mintlify.com/docs`

# Documentation project instructions

## About this project

- This is a documentation site built on [Mintlify](https://mintlify.com)
- Pages are MDX files with YAML frontmatter
- Configuration lives in `docs.json`
- Use the Mintlify MCP server, `https://mcp.mintlify.com`, to edit content and settings via MCP
- Use the Mintlify docs MCP server, `https://www.mintlify.com/docs/mcp`, to query information about using Mintlify via MCP

## Git

- Work and commit directly on `main`. Don't create branches.

## Bun workspace

- The root is a Bun workspace (`apps/*`, `packages/*`). `apps/web` and `apps/agent` are the example that validates `walkthroughs/walrus-memory.mdx`; see `README.md`.
- `bun run dev` runs docs, web, and agent together via `concurrently`.
- The Mintlify CLI is the local `mint` dev dependency; run it with `bunx mint` (for example `bunx mint broken-links`). There is no global install.
- Definition of Done: `bun run check` → `check:types` → `build` → `test`.
- Ports: 58000 `mint dev`, 58001 web, 58002 agent.

## Terminology

{/* Add product-specific terms and preferred usage */}
{/* Example: Use "workspace" not "project", "member" not "user" */}

## Style preferences

{/* Add any project-specific style rules below */}

- Use active voice and second person ("you")
- Keep sentences concise — one idea per sentence
- Use sentence case for headings
- Bold for UI elements: Click **Settings**
- Code formatting for file names, commands, paths, and code references

## Content boundaries

{/* Define what should and shouldn't be documented */}
{/* Example: Don't document internal admin features */}
