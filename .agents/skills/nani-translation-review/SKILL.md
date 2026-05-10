---
name: nani-translation-review
description: Use when reviewing translated blog/article drafts with the Nani desktop app, especially to check semantic alignment with a source text and naturalness in the target language.
---

# Nani Translation Review

Use this skill when a user asks to review or improve translated article drafts through Nani.

## Goal

Check whether a translated draft:

- preserves the source article's meaning,
- reads naturally in the target language,
- keeps the right tone for the audience,
- avoids over-polishing away the author's intent.

## Workflow

1. Identify the source file and translated draft.
2. Open Nani through Computer Use if the user asks to use Nani or desktop translation.
3. Before interacting with Nani, call `get_app_state`.
4. Prefer these settings when available:
   - high-accuracy or Pro model,
   - natural translation style,
   - tone adjustment enabled,
   - a polite/professional tone for technical blog articles.
5. Review representative sections, not necessarily the whole article line by line:
   - introduction,
   - core technical explanation,
   - nuanced or speculative claims,
   - conclusion.
6. Use back-translation to check meaning:
   - translated draft -> source language,
   - compare the result with the original source.
7. Use Nani proofreading to check naturalness:
   - note naturalness, consistency, tone, and suggested rewrites.
8. Apply only changes that improve reader clarity without changing the claim.
9. Preserve technical terms, code identifiers, frontmatter, links, MDX syntax, and intentional author voice.
10. Run the appropriate formatter/check commands for the repository.

## Review Notes

When useful, create a short Markdown review note with:

- files reviewed,
- Nani settings used,
- feedback received,
- changes accepted,
- changes intentionally not accepted,
- validation commands run.

Keep the note concise and evidence-based. Do not paste long full translations unless the user explicitly asks.

## Guardrails

- Do not treat Nani output as automatically correct.
- Do not strengthen speculative language unless the source does.
- Do not make a technical blog sound like a formal paper unless requested.
- Do not rewrite unrelated sections while applying translation feedback.
- If Nani or Computer Use is unavailable, say so and continue with a normal translation review.
