# Theorem Zero Documentation Target

This directory holds human-review documentation and handoff material for the Theorem Zero visual book repository.

The runtime source data lives under `data/`. The locked canonical substrate lives under `canonical/`. Files in this `docs/` target explain or support those production files; they should not be treated as runtime source unless explicitly imported by a build step.

## Forward documentation files

- `theorem-zero-forward-file-manifest.md` records which complete files supersede earlier partial registers.
- `theorem-zero-complete-visual-asset-catalogue.md` is the human-readable, deduplicated, Visual-ID-first catalogue.
- `theorem-zero-complete-html-implementation-prompt.txt` is the implementation handoff prompt for the eventual HTML visual-book runtime.
- `theorem-zero-visual-assets-validation-report.md` records the validation result for `data/visual-assets.json`.
- `scene-visual-mapping-report.md` records the scene-to-Visual-ID mapping pass and validation counts.

## Runtime-adjacent data

The machine-readable visual registry is stored at:

`data/visual-assets.json`

The mapped scene manifest is stored at:

`data/scenes.json`

The machine-readable mapping audit is stored at:

`data/scene-visual-mapping.json`

## Canonical rule

Do not modify `canonical/theorem_zero_canonical_substrate_v1_0_final.html` to fit a scene. The substrate remains locked. Scene work must happen through manuscript data, scene mapping, visual assets, activation programs, overlay programs, and rendering programs.
