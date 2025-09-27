# Repository Guidelines

## Project Structure & Module Organization

Source lives under `src/`: `components/`, `layouts/`, and `lib/` host reusable UI and helpers; `pages/` handles routed Astro entries; `content/` stores Markdown posts configured via `content/config.ts`. Static assets stay in `public/`, production output lands in `dist/`. Automation scripts sit in `scripts/` (`update-environment.js`, `build-ogp.js`), shared docs in `docs/`, and environment notes in `environment.md`. Check `.github/` for CI, issue, and PR templates that frame review expectations.

## Build, Test, and Development Commands

Run `npm run dev` (or `npm start`) for the Astro dev server; the `predev` hook syncs environment metadata. Use `npm run build` for production bundles and `npm run preview` to sanity-check the built site. Generate social cards with `npm run generate-ogp`, or pair it with `npm run build:with-ogp`. Quality gates include `npm run lint`, `npm run lint:fix`, `npm run format:check`, and `npm run astro check`; apply `npm run format` before pushing.

## Coding Style & Naming Conventions

Prettier enforces 2-space indentation, semicolons, single quotes, trailing commas, and 100-character lines. ESLint (TypeScript, Astro, React, JSX a11y) blocks `any` and ignores underscore-prefixed unused variables. Prefer TypeScript-first components, PascalCase for component files, camelCase for functions, SCREAMING_SNAKE_CASE for environment keys, and kebab-case Markdown filenames under `src/content/blog/` with consistent frontmatter (`title`, `pubDate`, `description`, `tags`).

## Testing Guidelines

No dedicated unit harness exists yet; treat linting, `astro check`, and manual preview as mandatory gates. Validate content routes by browsing the generated pages in `npm run preview`, and rerun `generate-ogp` whenever imagery changes. Tick the verification checklist inside the PR template to record manual or visual checks.

## Commit & Pull Request Guidelines

Follow the Conventional Commits style observed in history (`feat:`, `fix:`, `chore:`, `perf:`) with concise English or bilingual summaries, e.g., `feat: add contact form validation`. Reference issues in the body where applicable. Pull requests should include a filled summary, bullet list of changes, checked verification items, linked issues (`Closes #123`), and screenshots or GIFs for UI updates. Keep PRs scoped; split large blog content migrations from code changes to ease review.

## Security & Configuration Tips

Environment variables load from `.env`/`.env.example`; never commit secrets. For Cloudflare deploys, ensure the adapter config in `astro.config.mjs` matches the target account, and regenerate OGP assets before release so social previews stay fresh.

## Agent-Specific Instructions

Use English to think, and answer in Japanese.
