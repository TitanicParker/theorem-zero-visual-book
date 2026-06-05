# Runtime Rendering Contract

The canonical substrate is the only geometry authority for Theorem Zero runtime rendering.

The locked canonical substrate defines the viewer-native triangular / barycentric field, the first-circle station offsets, the canonical station orientation, the projection basis, carrier-family identity, and the native squared norm. Runtime renderer code must not redefine any of those facts. The canonical substrate manual states that the substrate is fixed, while activation, overlay, and rendering are programmable layers above it. It also states the viewer-native orientation as A west, B north-west, C north-east, D east, E south-east, and F south-west, with offsets O=(0,0), A=(-1,0), B=(0,-1), C=(1,-1), D=(1,0), E=(0,1), and F=(-1,1).

## Source-to-rendering architecture

Scenes do not become standalone HTML files.

Scenes become runtime component instances inside the single visual-book application. The route is:

```text
data/scenes.json
→ scene runtime object
→ visual_id
→ visual asset record
→ renderer registry
→ canonical substrate module
→ generated SVG/HTML/Canvas inside the page
```

HTML is the runtime output, not the manuscript source unit.

## Geometry authority

`src/canonical-substrate.js` is the sole runtime module allowed to define canonical station coordinates, unit-neighbour offsets, canonical orientation, projection basis, and squared norm.

Renderer modules may request projected stations from `src/canonical-substrate.js`. They may not define their own local maps for O, A, B, C, D, E, or F. They may not define local first-circle coordinate objects, local unit-neighbour offset objects, local canonical orientation objects, or replacement projection bases.

Permitted renderer responsibilities include SVG generation, HTML composition, labels, visual grouping, animation timing, class names, captions, and overlay selection. These are rendering concerns, not substrate authority.

## Fail-closed rule

If the canonical substrate contract does not verify, renderers must fail closed. They must display a diagnostic and draw no theorem geometry. A mismatch is not a recoverable warning. It invalidates the viewer state until corrected.

## Initial proof-of-contract renderers

The first five active renderers are the initial proof-of-contract:

```text
V001_first_radius_sweep
V002_carried_opening_to_B
V003_forced_equilateral_OAB
V004_six_step_boundary_closure
V005_release_curve_seven_point_residue
```

These renderers must draw through `firstCircleStations()` or equivalent canonical substrate projection APIs only.

## Expansion policy

The remaining 343 visual occurrence rows should be implemented by renderer families, not one-off bespoke files or bespoke scene geometry.

A renderer family is a reusable grammar over the canonical substrate: first-circle construction, seven-point residue, pair catalogue, triple catalogue, right-angle/root-three lock, ratio/similarity, native coordinates, rings and recurrence, cell/area recomposition, transformation/invariant, Part Two reinspection overlays, and ledger/table scenes.

Each family should consume scene metadata and visual asset records, select lawful stations and relations from the substrate, then express them through overlays. Renderer expansion must preserve the same authority order:

```text
substrate fixed
activation selects
overlay expresses
rendering displays
```

No future renderer should draw arbitrary illustrations or hand-code scene geometry independently of the canonical substrate contract.
