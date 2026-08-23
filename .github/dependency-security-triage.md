# Dependency security triage policy

This document is the repository source of truth for deciding which dependency security alerts
should produce an automated Draft pull request. Dependabot Alerts remain enabled, while native
Dependabot security-update pull requests remain disabled to avoid unreviewed and duplicate pull
requests.

## Required evidence

An automated update requires all of the following:

1. A patched version is available.
2. The vulnerable version exists in the current default-branch lockfile.
3. The direct or transitive parent path is confirmed from the installed dependency graph.
4. The affected behavior is reachable from this repository's runtime, browser code, build, CI,
   OGP or Markdown processing, or another input-processing path.

Severity alone is not sufficient. Record the GitHub severity separately from the practical risk
to this repository, including attack prerequisites, dependency scope, EPSS when available, and
known exploitation evidence.

## Decision rules

| Finding                                                                                                      | Automated action  |
| ------------------------------------------------------------------------------------------------------------ | ----------------- |
| Reachable runtime vulnerability with a compatible patch                                                      | Create a Draft PR |
| Critical or High development/build vulnerability reachable from untrusted input, CI, or a published artifact | Create a Draft PR |
| Medium or Low development-only vulnerability without a reachable attack path                                 | Report only       |
| Vulnerable version is absent, a patch is unavailable, or reachability is unknown                             | Report only       |
| Malware alert, exposed secret, or required permission is unavailable                                         | Stop and report   |

Report-only findings must not be dismissed automatically. A metadata change or future code change
can make a previously unreachable alert relevant.

## Update constraints

- Use the smallest compatible patched version.
- Do not perform broad dependency or lockfile updates.
- For transitive dependencies, prefer a parent-qualified `pnpm.overrides` entry when the parent
  cannot yet resolve a safe version itself.
- Group only alerts with the same root dependency path. Keep independent causes in separate Atomic
  commits and Draft PRs.
- Create at most three Draft PRs per automation run.
- Use Conventional Commits with short English messages.
- Never auto-merge, deploy, release, dismiss alerts, or change GitHub security settings.

## Required validation

Run all of the following before pushing a branch:

```sh
pnpm install --frozen-lockfile
pnpm audit
pnpm audit --prod
pnpm run test
pnpm run lint
pnpm run astro check
ASTRO_MERMAID_STRATEGY=pre-mermaid pnpm run build
pnpm run format:check
git diff --check
```

When an override changes a transitive dependency, also verify the resolved package in
`node_modules`. Do not create a PR when the proposed change introduces a validation failure. If a
failure also occurs on the untouched default branch, identify it explicitly as a baseline failure
in the Draft PR.

## Pull request requirements

Each Draft PR must state, in Japanese:

- the Dependabot alert and GHSA identifiers;
- GitHub severity and repository-specific practical risk;
- the installed dependency path and affected execution path;
- old and patched versions;
- commands and results used for validation;
- remaining uncertainty or manual checks.

Before creating a branch, inspect existing worktrees, local branches, and open pull requests. Do
not duplicate an alert already covered by existing work.
