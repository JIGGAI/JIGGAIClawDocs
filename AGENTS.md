# AGENTS.md

This repo is the Mintlify docs hub / publishing layer.

## Canonical docs rule

For product docs, the source of truth is the product repo:

- ClawRecipes docs → `~/ClawRecipes/docs/**`
- ClawKitchen docs → `~/clawkitchen/docs/**`

`~/JIGGAIClawDocs` is downstream-only for those docs.
Do not treat synced `.mdx` pages here as the canonical place to author product documentation.

## Edit policy

Edit here directly only when changing:

- Mintlify config and navigation
- shared landing pages
- docs-hub structure
- sync scripts/manifests
- presentation-only content that does not belong to one product repo

If a requested change is about a product feature/page, update the product repo doc first, then sync it into this repo.

## Preview

```bash
mint dev
```

## Sync

```bash
node scripts/sync-product-docs.mjs
```
