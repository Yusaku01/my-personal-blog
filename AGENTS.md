# Repository Guidelines

This repository is an Astro-based personal blog/portfolio using UnoCSS, React islands, and MDX. Keep changes scoped and content-driven.

## Architecture Overview

- Core: Astro v5 (SSG), React 18 islands, MDX for posts
- Styling: UnoCSS with shortcuts in `uno.config.ts`
- Routing: file-based under `src/pages/`
- Aliases: TypeScript path `@/*` → `./src/*` (see `tsconfig.json`)

## Project Structure & Module Organization

- Source: `src/` → `components/`, `layouts/`, `lib/`, `pages/`, `content/`
- Content: `src/content/blog/` (MD/MDX managed via `content/config.ts`)
- Assets: `public/` (static) → built output in `dist/`
- Scripts: `scripts/` (`update-environment.js`, `build-ogp.js`)
- CI/Docs: `.github/`, `docs/`, `environment.md`

Frontmatter (content/config.ts):

```yaml
title: 'Post Title'
description: 'Summary'
publishDate: 2025-01-01
author: 'Your Name'
image: '/path/to/cover.png'
tags: ['Astro', 'UnoCSS']
```

## Build, Test, and Development Commands

- Dev server: `npm run dev` (runs `predev` to sync `environment.md`)
- Build/Preview: `npm run build` / `npm run preview`
- OGP images: `npm run generate-ogp` (requires local server at `http://localhost:4321`; run `npm run dev` in another terminal) or `npm run build:with-ogp`
- Quality gates: `npm run lint`, `npm run lint:fix`, `npm run format`, `npm run format:check`, `npm run astro check`

## Coding Style & Naming Conventions

- Prettier: 2-space, semicolons, single quotes, trailing commas, 100-char line
- ESLint: TypeScript/Astro/React/JSX a11y; avoid `any`; prefix unused vars with `_`
- Naming: Components=PascalCase, functions=camelCase, env keys=SCREAMING_SNAKE_CASE
- Blog filenames: kebab-case under `src/content/blog/`

## Testing Guidelines

- No unit harness yet. Required checks: `lint` + `astro check` + manual `npm run preview`
- When images/OGP change, run `npm run generate-ogp` and visually verify

## Commit & Pull Request Guidelines

- Conventional Commits: e.g., `feat: add contact form validation`, `fix: handle fetch error`
- PR must include: concise summary, bullet list of changes, verification checklist, linked issues (`Closes #123`), and screenshots/GIFs for UI changes
- Split content migrations from code to ease review

## Security & Configuration Tips

- Never commit secrets; rely on `.env`/`.env.example` (client-exposed variables must start with `PUBLIC_`)
- External feeds: set `QIITA_USERNAME`, `ZENN_USERNAME` (optional: `QIITA_API_ENDPOINT`, `ZENN_API_ENDPOINT`)
- Forms/analytics examples: `PUBLIC_CONTACT_FORM_ENDPOINT`, `PUBLIC_GOOGLE_ANALYTICS_ID`, `PUBLIC_GOOGLE_RECAPTCHA_SITE_KEY`
- For Cloudflare deploys, ensure adapter settings in `astro.config.mjs`

## Dev Tips for Agents

- Prefer Astro components for static UI; use React only for interactivity and the ui neeeded for managing complexed state
- Use partial hydration wisely: `client:visible` or `client:idle` instead of `client:load` when possible
- Before generating OGP images, ensure the local server is running (see Commands)

## Agent-Specific Instructions

- Agents should follow this file and apply its scope to all edited paths.
