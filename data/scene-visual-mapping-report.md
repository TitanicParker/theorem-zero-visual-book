# Theorem Zero Scene-to-Visual-ID Mapping Report

## Input files used

- `data/manuscript.json`
- `data/scenes.json`
- `data/visual-assets.json`
- `data/interstitials/earned-catalogue-first-movement.json`
- `canonical/theorem_zero_canonical_substrate_v1_0_final.html`

## Validation checks performed

- Confirmed local input files exist.
- Parsed `data/manuscript.json` as JSON.
- Parsed `data/scenes.json` as JSON.
- Parsed `data/visual-assets.json` as JSON.
- Confirmed `data/visual-assets.json` begins with `V001_first_radius_sweep`.
- Confirmed unique Visual IDs = 255.
- Confirmed expanded occurrence rows = 348.
- Confirmed priority Visual IDs = 94.
- Confirmed first visual occurrence global_no = 1.
- Confirmed last visual occurrence global_no = 348.
- Flattened manuscript blocks while preserving source IDs, source type, part metadata, chapter metadata, local index, global index, and text.
- Mapped only to existing registry Visual IDs.
- Preserved equation scenes as attached non-visual inline content where possible.
- Preserved unmatched transition and aphorism scenes as inline-only non-visual content.
- Preserved `scene-earned-catalogue-first-movement` as a special ledger-table scene.
- Confirmed every scene has `visual_mapping_status`.
- Confirmed every scene has `visual_bearing`.
- Confirmed no mapped `visual_id` is absent from `data/visual-assets.json`.
- Confirmed no new Visual IDs were invented.
- Confirmed canonical substrate SHA-256 remains `9c8085212c2672780aae5249481826e3e4d14b7cecf65e12e5d060df537e5837`.

## Counts

| Measure | Count |
|---|---:|
| Total scenes | 366 |
| Visual-bearing scenes | 358 |
| Non-visual scenes | 8 |
| Mapped high-confidence scenes | 324 |
| Mapped medium-confidence scenes | 24 |
| Attached non-visual scenes | 7 |
| Inline-only scenes | 1 |
| Manual-review scenes | 0 |
| Unmapped scenes | 9 |
| Special scenes | 1 |
| Registry occurrence rows used | 348 |
| Registry occurrence rows not used | 0 |
| Total registry occurrence rows | 348 |
| Reused Visual IDs represented | 62 |
| Reused Visual IDs in registry | 62 |
| Priority Visual IDs represented | 94 |
| Priority Visual IDs in registry | 94 |

## Manual-review cases

None.

## Unmapped cases

- `scene-P1-C06-005` / `P1-C06-005` / source global `81` / candidate `None` / No existing registry occurrence satisfied conservative matching constraints.
- `scene-P1-C06-007` / `P1-C06-007` / source global `83` / candidate `None` / No existing registry occurrence satisfied conservative matching constraints.
- `scene-P1-C06-009` / `P1-C06-009` / source global `85` / candidate `None` / No existing registry occurrence satisfied conservative matching constraints.
- `scene-P1-C08-005` / `P1-C08-005` / source global `106` / candidate `None` / No existing registry occurrence satisfied conservative matching constraints.
- `scene-P1-C08-007` / `P1-C08-007` / source global `108` / candidate `None` / No existing registry occurrence satisfied conservative matching constraints.
- `scene-P2-C21-009` / `P2-C21-009` / source global `308` / candidate `None` / No existing registry occurrence satisfied conservative matching constraints.
- `scene-P2-C21-010` / `P2-C21-010` / source global `309` / candidate `None` / No existing registry occurrence satisfied conservative matching constraints.
- `scene-P2-C21-021` / `P2-C21-021` / source global `320` / candidate `None` / No existing registry occurrence satisfied conservative matching constraints.
- `scene-P2-C21-022` / `P2-C21-022` / source global `321` / candidate `None` / No existing registry occurrence satisfied conservative matching constraints.

## Confirmation no new Visual IDs were invented

No new Visual IDs were invented. Every mapped scene references a Visual ID already present in `data/visual-assets.json`.

## Confirmation canonical substrate was not modified

The canonical substrate was not modified. Its SHA-256 after generation is `9c8085212c2672780aae5249481826e3e4d14b7cecf65e12e5d060df537e5837`.

## Ledger table confirmation

`scene-earned-catalogue-first-movement` remains `special_scene` with `rendering_mode: static_table_with_optional_row_focus`.
