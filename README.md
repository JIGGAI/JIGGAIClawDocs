# JIGGAI docs hub

This repo is the published Mintlify docs layer for JIGGAI products.

## Source of truth

Canonical docs live in the product repos:

- `~/ClawRecipes/docs/**`
- `~/clawkitchen/docs/**`

`~/JIGGAIClawDocs` is **not** the source of truth for product docs.
It is the downstream presentation/publishing repo.

## Working rule

When product docs change:

1. edit the docs in the product repo first
2. sync/export them into this repo
3. preview/publish from here

Do **not** create or maintain canonical product docs here first and backfill later.
If a page here was generated from a product repo, changes should go back to the product repo source file.

## Local preview

Install the Mintlify CLI:

```bash
npm i -g mint
```

Run the preview server from this repo root:

```bash
mint dev
```

## Sync

Current sync script:

```bash
node scripts/sync-product-docs.mjs
```

That script reads product-repo markdown and writes Mintlify-ready `.mdx` pages into this repo.
