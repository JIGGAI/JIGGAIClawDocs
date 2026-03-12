# Contributing to JIGGAI docs

## First rule: edit the source repo

For product documentation, this repo is the **published Mintlify layer**, not the canonical source.

Canonical sources:

- ClawRecipes → `~/ClawRecipes/docs/**`
- ClawKitchen → `~/clawkitchen/docs/**`

If you want to change product docs:

1. edit the product repo doc first
2. run/update the sync into this repo
3. review the Mintlify result here

## What should be edited directly here

Edit this repo directly for:

- Mintlify config (`docs.json`)
- shared landing pages and top-level docs-hub pages
- presentation-only structure/navigation
- sync tooling under `scripts/` and generated manifests

Avoid direct edits to synced product pages unless you are also updating the product-repo source.

## Local development

```bash
npm i -g mint
mint dev
```

## Writing guidelines

- Use active voice
- Keep docs approachable and easy to understand
- Prefer concrete examples over abstract descriptions
- Keep terminology consistent across product docs and Mintlify pages
