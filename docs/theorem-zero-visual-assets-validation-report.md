# Theorem Zero — Visual Assets JSON Validation Report

Generated from `theorem-zero-complete-visual-asset-catalogue.md`.

## Result

PASS: `data/visual-assets.json` is valid JSON and matches the complete catalogue counts available in the forward manifest.

## Checks

- Unique Visual IDs: 255 / expected 255
- Occurrence rows from assets: 348 / expected 348
- Priority Visual IDs: 94 / expected 94
- Reused Visual IDs by occurrence count: 62
- Assets missing activation/overlay/rendering variants: 0

## Generated JSON SHA-256

`dc3e139f02107bde5ea5fada39ab807ed3dd0e7877ac0874f504d76322c3ba7f`

## Notes

The JSON was generated from the complete human-review catalogue and is suitable for the next mapping pass. It preserves Visual-ID-first asset records, occurrence references, canonical summaries, build tiers, and activation/overlay/rendering program variant strings.

The canonical substrate remains separate and locked. This registry does not modify `substrate_definition`.
