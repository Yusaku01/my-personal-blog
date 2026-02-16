# Test Coverage Analysis

## Current State

This codebase has **zero automated test coverage**. There are:

- No test files (`*.test.*`, `*.spec.*`)
- No testing framework installed (no vitest, jest, or testing-library in `package.json`)
- No `test` script in `package.json`
- No test configuration files

The current quality gates are limited to **linting** (`eslint`), **type checking** (`astro check`), and **formatting** (`prettier`). AGENTS.md explicitly acknowledges: *"No unit harness yet."*

---

## Recommended Testing Framework

**Vitest** is the recommended choice for this project because:

- Native ESM support (the project uses `"type": "module"`)
- First-class TypeScript support without extra configuration
- Compatible with Vite/Astro's module resolution and `import.meta.env`
- `@testing-library/react` integrates cleanly for React component tests
- Fast execution with watch mode for development

### Setup would require:

```
pnpm add -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

---

## Priority Areas for Test Coverage

### Priority 1 — Pure Utility Functions (High value, low effort)

These modules contain pure or near-pure logic that can be tested without mocking frameworks or DOM access.

#### 1a. `src/lib/rehype/externalLinkIcon.ts`

| What to test | Why |
|---|---|
| `isExternalLink()` correctly identifies external URLs | Handles 8+ edge cases: empty href, anchors, mailto/tel/javascript protocols, relative paths, same-host, cross-host, invalid URLs, non-HTTP protocols |
| `getClassList()` normalizes array, string, and undefined class values | Used in both rehype plugins; guards against unexpected HAST formats |
| Full plugin appends icon `<span>` to external links | Verifies AST output matches expectations |
| Plugin skips `.rlc-container` links | Rich link cards should not get double icons |

**Estimated tests: 12–15.** These are synchronous, pure functions operating on simple data structures.

#### 1b. `src/lib/rehype/footnoteBackrefIcon.ts`

| What to test | Why |
|---|---|
| Plugin replaces children of `data-footnote-backref` links | Core functionality |
| Plugin ignores non-backref links | Must not modify normal links |
| Replacement node has correct `aria-label` and class | Accessibility contract |

**Estimated tests: 5–6.**

#### 1c. `src/lib/utils/ogp.ts` — `createOptimizedImageUrl()`

This is currently not exported, but refactoring it for testability is worthwhile.

| What to test | Why |
|---|---|
| Standard HTTPS URL produces correct `images.weserv.nl` proxy URL | Core optimization path |
| HTTP URL omits `ssl:` prefix | Protocol handling |
| URL with port number is preserved | Edge case in proxy URL construction |
| Qiita imgix URLs are returned as-is | Documented workaround for 403 errors |
| Invalid URLs fall back to original string | Error resilience |

**Estimated tests: 6–8.**

#### 1d. `src/lib/utils/ogp.ts` — `isCacheEntryFresh()`

| What to test | Why |
|---|---|
| Entry within 7-day TTL returns `true` | Cache hit path |
| Entry older than 7 days returns `false` | Cache miss / refresh path |

**Estimated tests: 2–3.**

#### 1e. `src/styles/unoVariants.ts`

| What to test | Why |
|---|---|
| `createVariants()` returns base class when no variants given | Default behavior |
| `createVariants()` applies matching variant classes | Core mechanism |
| `createVariants()` uses default variants when props omit keys | Fallback behavior |
| `createVariants()` appends `className` prop | Composition support |
| `button()` with different `color`, `size`, `fullWidth`, `disabled` combos | 8+ combinations to verify class string correctness |
| `input()` with `color`, `size`, `rounded`, `disabled` combos | Similar combinatorial coverage |
| `card()` with `hoverable` true/false | Two states |
| `heading()` with `marginBottom` variants and custom `className` | 5+ combinations |

**Estimated tests: 20–25.** All synchronous, pure functions — fast and stable.

#### 1f. `src/types/index.ts` — `contactFormSchema` (Zod)

| What to test | Why |
|---|---|
| Valid input passes validation | Sanity check |
| Missing `name` produces correct Japanese error | User-facing validation message |
| Invalid email format is rejected | Email regex behavior |
| Empty `subject` and `message` are rejected | Required field enforcement |
| Extra fields are stripped or handled | Schema strictness |

**Estimated tests: 8–10.**

---

### Priority 2 — API Client Logic (High value, medium effort)

These modules make network requests, so tests require mocking `fetch`. However, the business logic within them — caching, error fallbacks, data transformation — is where bugs are most likely to occur.

#### 2a. `src/lib/api-clients/qiita.ts`

| What to test | Why |
|---|---|
| Successful fetch transforms Qiita API response to `ExternalPost[]` | Core data mapping: `created_at` → `publishDate`, `tags[].name` → `string[]` |
| `parseDate()` returns `new Date()` for invalid date strings | Defensive fallback — prevents NaN dates from propagating |
| Missing username throws error | Guard clause |
| Cache returns data within TTL without re-fetching | Performance — verifies cache key format and TTL check |
| Failed fetch falls back to cached data | Resilience path |
| Failed fetch with no cache returns `[]` | Final fallback |

**Estimated tests: 8–10.** Requires mocking `global.fetch` and `getOGPImage`.

#### 2b. `src/lib/api-clients/zenn.ts`

Same patterns as Qiita, but with two functions:

| What to test | Why |
|---|---|
| `getZennPosts()` transforms articles correctly | URL construction (`https://zenn.dev` + `path`), tag extraction from `article_type` |
| `getZennScraps()` uses fixed thumbnail | Scraps always use `/images/ogp/zenn-scrap.png` |
| `getZennScraps()` always tags with `['scrap']` | Hardcoded tag |
| OGP fetch failure in `getZennPosts()` results in `undefined` thumbnail | Graceful degradation (`try/catch` around OGP) |
| Both functions handle cache and error fallbacks | Same pattern as Qiita |

**Estimated tests: 12–15.**

#### 2c. `src/lib/api-clients/contact.ts`

| What to test | Why |
|---|---|
| `submitContactForm()` sends FormData via POST | Verifies fetch call shape |
| Missing `PUBLIC_CONTACT_FORM_ENDPOINT` throws error | Configuration guard |
| Non-OK response throws with status and body text | Error message format |
| All data keys are appended to FormData | Ensures reCAPTCHA token is included |

**Estimated tests: 5–6.**

---

### Priority 3 — Data Aggregation Logic (Medium value, medium effort)

#### 3a. `src/lib/blog/posts.ts`

| What to test | Why |
|---|---|
| `getAllBlogPosts()` merges all 4 sources into one array | Integration point — all post sources combined |
| Result is sorted by `publishDate` descending (newest first) | Sort correctness — the homepage depends on this |
| Local posts are mapped with correct `url`, `source`, `isExternal` fields | Field mapping contract |
| Missing `tags` defaults to `[]` | Handles posts without tags |

**Estimated tests: 5–7.** Requires mocking all upstream functions (`getCollection`, `getQiitaPosts`, `getZennPosts`, `getZennScraps`).

---

### Priority 4 — React Component Tests (Medium value, higher effort)

#### 4a. `src/components/Contact/ContactForm.tsx`

This is the most complex React component (163 lines, multiple states, side effects).

| What to test | Why |
|---|---|
| Form renders all 4 fields with labels | Smoke test |
| Submitting with empty fields shows Zod validation errors | Client-side validation UX |
| Successful submission shows success message | Happy path |
| Clicking "新しいお問い合わせ" resets to form state | State transition |
| Failed submission shows error message | Error UX |
| Submit button is disabled during submission | Prevents double-submit |

**Estimated tests: 8–10.** Requires `@testing-library/react`, mocking `submitContactForm`, and mocking `window.grecaptcha`.

#### 4b. `src/components/Contact/ContactFormInput.tsx` and `ContactFormTextarea.tsx`

| What to test | Why |
|---|---|
| Input renders with correct type and id | Prop forwarding |
| Error state applies red border classes | Visual feedback |
| Error message is displayed when present | Accessibility |

**Estimated tests: 5–6 per component.**

---

### Priority 5 — Build Scripts (Lower priority, higher effort)

#### 5a. `scripts/build-ogp.js`

| What to test | Why |
|---|---|
| Frontmatter extraction from MDX files | Parses title correctly |
| Draft exclusion (`_` prefix) | Drafts should not get OGP images |
| Image dimensions are 1200×630 | OGP spec compliance |

These tests are less critical since the script is run manually and visually verified, but they'd prevent regressions in the OGP pipeline.

---

### Priority 6 — RSS Feed Logic (`src/pages/rss.xml.ts`)

| What to test | Why |
|---|---|
| Draft posts (slug starting with `_`) are excluded | Drafts must not appear in RSS |
| Feed items have correct `link` format (`/blog/{slug}/`) | URL correctness |
| Feed metadata (title, description, language) is correct | Standards compliance |

**Estimated tests: 4–5.** Requires mocking `getCollection`.

---

## Summary Table

| Priority | Module | Est. Tests | Effort | Value |
|----------|--------|-----------|--------|-------|
| **P1** | Rehype plugins (`externalLinkIcon`, `footnoteBackrefIcon`) | 18–21 | Low | High |
| **P1** | OGP utilities (`createOptimizedImageUrl`, `isCacheEntryFresh`) | 8–11 | Low | High |
| **P1** | UnoCSS variants (`unoVariants.ts`) | 20–25 | Low | Medium |
| **P1** | Zod schema (`contactFormSchema`) | 8–10 | Low | Medium |
| **P2** | API clients (Qiita, Zenn, Contact) | 25–31 | Medium | High |
| **P3** | Post aggregation (`getAllBlogPosts`) | 5–7 | Medium | High |
| **P4** | React components (ContactForm + sub-components) | 18–22 | High | Medium |
| **P5** | Build scripts (`build-ogp.js`) | 3–5 | High | Low |
| **P6** | RSS feed (`rss.xml.ts`) | 4–5 | Medium | Medium |
| | **Total** | **~109–137** | | |

## Recommended Implementation Order

1. **Install vitest** and add a `test` script to `package.json`
2. **Start with P1** — pure functions in `rehype/`, `utils/ogp.ts`, `unoVariants.ts`, and the Zod schema. These require no mocks and will build confidence in the test infrastructure.
3. **Move to P2** — API clients with `fetch` mocking. This is where the most likely runtime bugs live (API format changes, cache staleness, error handling).
4. **Add P3** — `getAllBlogPosts()` to verify the aggregation and sort logic.
5. **Add P4** — React component tests if investment in UI testing is desired.
6. **Integrate into CI** — add `pnpm test` to the `lint-format.yml` workflow and to the `pre-push` git hook.
