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

`37cb507e6f152f403a58aca28cb4121b1f8780bda3b3bb388337778dd1ec3962`

## Notes

The JSON was generated from the complete human-review catalogue and is suitable for the next mapping pass. It preserves Visual-ID-first asset records, occurrence references, canonical summaries, build tiers, and activation/overlay/rendering program variant strings.

The canonical substrate remains separate and locked. This registry does not modify `substrate_definition`.
