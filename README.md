# Theorem Zero Visual Book

This repository is the source-layer preparation workspace for the **Theorem Zero** canonical HTML visual book.

The current repository state is intentionally not a finished visual runtime. It contains structured manuscript data that will later drive a single HTML visual-book application over the locked canonical substrate.

## Current purpose

The first build pass converts the supplied manuscript into clean source data:

- `data/manuscript.md` preserves the manuscript as Markdown source.
- `data/manuscript.json` exposes the manuscript as stable, machine-readable scene blocks.
- `data/scenes.json` bridges source blocks to future visual-rendering scenes.
- `data/interstitials/earned-catalogue-first-movement.md` preserves the interstitial ledger table between Chapter Ten and Chapter Eleven as Markdown.
- `data/interstitials/earned-catalogue-first-movement.json` exposes that ledger as structured interstitial scene data.
- `SOURCE_LAYER_SUMMARY.json` records generation counts and validation notes for this source-layer pass.

## Architecture rule

The project keeps three layers separate:

1. **Manuscript source content** — prose, equations, headings, aphorisms, transition lines, and interstitial material.
2. **Visual logic** — the future visual asset registry and scene-to-visual assignments.
3. **Presentation runtime** — the eventual HTML/CSS/JavaScript visual-book application.

The manuscript is not hand-authored into HTML. Paragraphs become structured scene records. The visual runtime will render scenes later using the canonical substrate, the visual asset registry, and scene metadata.

## What this pass does not do

This pass does not:

- create one HTML page per paragraph;
- bake manuscript prose into bespoke HTML;
- invent visual IDs;
- duplicate visual assets;
- alter the canonical substrate;
- convert the interstitial ledger into an ordinary paragraph.

## Expected future runtime shape

A later runtime pass may add files such as:

- `index.html`
- `src/substrate.js`
- `src/book-runtime.js`
- `src/renderers/*.js`
- `data/visual-assets.json`

The runtime should consume `data/manuscript.json`, `data/scenes.json`, and the visual asset registry rather than hard-coding manuscript content.

## Source-layer status

The source layer currently represents:

- 2 parts;
- 23 chapters;
- the interstitial **Earned Catalogue of the First Movement** as a separate ledger-table scene;
- pending scene-to-visual assignments with `visual_id: null`.

Renderable paragraph-like, equation, aphorism, transition, heading, and table blocks are preserved as separate source blocks where required. This is deliberate: the source layer prioritizes structural fidelity over flattening everything into ordinary paragraphs.
