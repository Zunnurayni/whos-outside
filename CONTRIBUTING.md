# Contributing to Who's Outside?

Thanks for wanting to build this with us. Whether you're adding a feature, fixing a bug, or improving the docs, here's how to do it cleanly.

## Before you start

1. Read [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) so you understand the demo-vs-live data layer — it's the thing most contributions touch.
2. Check [docs/BUILD_GUIDE.md](docs/BUILD_GUIDE.md) to see which phase your work belongs to.
3. Follow [docs/DESIGN_GUIDE.md](docs/DESIGN_GUIDE.md) for anything visual — use tokens, not raw colours.

## Getting set up

```bash
git clone https://github.com/Zunnurayni/whos-outside.git
cd whos-outside
npm install
npm run dev     # demo mode, no backend needed
```

## Workflow

1. **Fork** the repo (or branch, if you're a collaborator).
2. **Branch** from `main` with a descriptive name:
   - `feat/map-mapbox-integration`
   - `fix/join-button-disabled-state`
   - `docs/clarify-rls-policies`
3. Make your change. Keep it focused — one concern per PR.
4. **Check it builds and types:**
   ```bash
   npm run typecheck
   npm run lint
   npm run build
   ```
5. **Commit** with a clear message (see below).
6. **Open a PR** against `main` using the template. Describe what and why, link any issue, add screenshots for UI changes.

## Commit style

Short, imperative, scoped. Conventional-commit prefixes are welcome but not required:

```
feat(map): render real pins from get_nearby_activities
fix(crews): keep approved request row dimmed after reload
docs(setup): add Supabase region guidance for Nigeria
chore: bump next to 14.2.33
```

## Code conventions

- **TypeScript everywhere.** No `any` unless truly unavoidable, and comment why.
- **Tokens, not hex.** Style through Tailwind utilities that map to CSS variables.
- **Data layer discipline.** Screens read from `src/lib/data/*`. If you add a new data need, add a function there that returns a view-model type and keeps a demo fallback.
- **Client vs server.** Only mark a component `"use client"` if it needs interactivity or browser APIs.
- **Accessibility.** Label controls, keep contrast, respect reduced motion, 40px tap targets.
- **Safety.** Never expose a user's live location or private data. Never log secrets. Keep privileged keys server-side.

## What makes a good first contribution

- Wiring one Phase 2 query (there's a worked example in `src/lib/data/activities.ts`).
- Replacing the stylised map with Mapbox (Phase 3) behind the existing pin interaction.
- Adding real PWA icons to `/public`.
- Improving empty / loading / error states.
- Translating UI copy (Hausa would be a great fit for the launch city).

## Reporting bugs / ideas

Open an issue using the templates in `.github/ISSUE_TEMPLATE`. For security issues, don't open a public issue — contact the maintainer directly.

## Code of conduct

Be kind, be constructive, assume good intent. This is a community product about helping people meet safely; the community building it should feel the same way.
