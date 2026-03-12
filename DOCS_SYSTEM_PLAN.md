# Docs system plan

## Goal

Keep product docs in their home repos while publishing them through the Mintlify site in `JIGGAIClawDocs`.

## Source of truth

- `~/ClawRecipes/docs/**` is canonical for ClawRecipes docs.
- `~/clawkitchen/docs/**` is canonical for ClawKitchen docs.
- `~/JIGGAIClawDocs` is the Mintlify presentation and publishing repo.

## Proposed Mintlify structure

```txt
JIGGAIClawDocs/
  docs.json
  index.mdx
  clawrecipes/
    index.mdx
    installation.mdx
    commands.mdx
    architecture.mdx
    ...
  clawkitchen/
    index.mdx
    goals.mdx
    qa-auth.mdx
    ...
  generated/
    docs-manifest.json
  scripts/
    sync-product-docs.mjs
```

## Sync rules

1. Product repos are canonical. Write/edit product docs there first.
2. Read markdown docs from each product repo.
3. Convert them into Mintlify-ready `.mdx` pages.
4. Write synced pages into product folders in `JIGGAIClawDocs`.
5. Generate a manifest with source-to-target mappings.
6. Keep hand-authored files limited to landing pages, shared pages, Mintlify config, and sync tooling.
7. Do not let `JIGGAIClawDocs` become a parallel source of truth for product documentation.

## Frontmatter contract (target)

```yaml
---
title: Installation
description: Install and verify the plugin
slug: installation
group: Getting started
order: 10
published: true
product: clawrecipes
---
```

Phase 1 can infer metadata from filenames when frontmatter is missing.

## Anti-drift guardrails

- Synced files should contain a generated header:
  - source repo
  - source path
  - source commit (when available)
- `generated/docs-manifest.json` should track every synced page.
- CI in `JIGGAIClawDocs` should fail if generated docs are stale.
- "Edit this page" links for synced pages should point back to the source repo file.

## Rollout phases

### Phase 1
- Replace Mintlify starter navigation.
- Add ClawRecipes and ClawKitchen landing pages.
- Add sync script skeleton.
- Sync current ClawRecipes docs and current ClawKitchen docs into Mintlify product folders.

### Phase 2
- Add GitHub Action to run sync automatically.
- Open/update PRs in `JIGGAIClawDocs` when source docs change.
- Add drift check in CI.

### Phase 3
- Add versioning only if needed.
- Add shared snippets/components for cross-product docs.
- Add API/reference pipelines if needed.

## Initial nav proposal

### ClawRecipes
- Overview
- Installation
- Commands
- Architecture
- Recipe format
- Team workflow
- Workflow runs
- Memory model
- Bundled recipes
- Agents and skills
- Outbound posting

### ClawKitchen
- Overview
- Goals
- QA / auth

## Notes from current repo state

- `JIGGAIClawDocs` is currently close to the Mintlify starter kit.
- `ClawRecipes` already has substantial docs.
- `clawkitchen` docs are currently minimal, so the system should support sparse products without special-casing.
