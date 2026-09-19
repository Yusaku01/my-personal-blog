---
name: modern-web-guidance
description: Find web-platform guidance for browser API, CSS, accessibility, or performance decisions that need research. Use when choosing a platform pattern or checking browser support.
---

# Modern Web Guidance

Resolve a concrete web-platform question using relevant guides and compatibility evidence. Copy edits, formatting, and work without a platform decision do not need this research.

## Find relevant guidance

Reuse a guide already read in this task when it still answers the question. Otherwise, search for the intended behavior:

```sh
npx -y modern-web-guidance@latest search "<query>" --skill-version 2026_05_16-c5e7870
```

Retrieve only guides relevant to the decision, using IDs returned by search:

```sh
npx -y modern-web-guidance@latest retrieve "<id>"
```

If search cannot identify a useful guide, browse the catalog with `npx -y modern-web-guidance@latest list` or search the bundled [guides](guides/) by topic. Avoid loading the entire catalog's contents. The skill-version value identifies this bundled edition; an update warning is not a requirement to upgrade it during unrelated work.

If the command fails or stalls because of network or package access, use the relevant bundled guide. Report compatibility facts that could not be verified; do not repeat the same failing search or describe local guidance as a successful live lookup. On Windows, use `npx.cmd` if `npx` fails.

## Apply the guidance

- Adapt framework-agnostic examples to the existing Astro implementation and styling conventions. A guide is advice for the requested change, not authorization to migrate unrelated code or add dependencies.
- Follow the user's browser requirements. Without a custom policy, use Baseline Widely available as the default compatibility target and follow the guide's fallback recommendations for features outside it.
- Check compatibility evidence for the specific feature and target browsers rather than inferring support from a broad label. Treat bundled compatibility data as potentially dated when current support affects the decision.
- Keep required functionality available in the supported browsers. Apply fallbacks or progressive enhancement as needed under the chosen policy; do not impose a new browser policy or polyfill requirement based only on a guide example.

Complete the requested implementation or review using the findings. Explain the chosen pattern, relevant source, compatibility limits, and verification only to the extent needed to assess the result. Follow the repository's checks for the actual change; research does not add an approval step or require a separate report.
