# Renderer Family Plan

This plan groups the 348 mapped visual occurrence rows into reusable renderer families. It is an expansion plan, not a claim that all visuals are already rendered.

The controlling rule is: renderer families over the canonical substrate, not bespoke scene files. Every family must consume `src/canonical-substrate.js` for station projection, offset authority, orientation, carrier family identity, and native norm logic.

The data layer currently reports 366 total scenes, 255 unique Visual IDs, 348 expanded occurrence rows, and 94 represented priority Visual IDs. The family counts below are implementation planning buckets. Exact per-row validation remains the responsibility of `scripts/validate-runtime.js` and the mapping audit.

## 1. First-circle construction

Visual IDs covered: V001-V009 and reused Part Two first-circle reinspections where the asset records route back to these IDs, including V001_first_radius_sweep, V002_carried_opening_to_B, V003_forced_equilateral_OAB, V004_six_step_boundary_closure, V005_release_curve_seven_point_residue, V006_radii_chords_role_change, V007_six_equilateral_fan, V008_three_diameters_straight_angles, V009_primary_parallel_families.

Occurrence rows covered: opening construction rows plus reuse rows in Part Two where fixed opening, residue, radii/chords, and carrier readings are reinspected. Initial proof-of-contract coverage is the first five renderer IDs only.

Priority Visual IDs covered: high. These are the foundation visuals and must be implemented before larger catalogue renderers.

Renderer primitives needed: first-circle station projection, circle trace, radius line, chord line, closed boundary walk, centre/perimeter labels, ghosted circle fade, six-neighbour fan, diameter triplets, carrier-line overlays.

Implementation order: complete V001-V005 hardening first; then add V006 role comparison, V007 triangular fan, V008 diameter triplets, and V009 carrier families.

Open questions: whether carrier-family visuals should show finite clipped line spans or full panel-crossing carriers; whether V006 should animate role change or remain a static comparison.

## 2. Seven-point residue and relation overlays

Visual IDs covered: V005-V018, plus later reused residue/role/identity records that explicitly return to O plus A-F.

Occurrence rows covered: all seven-point residue, radii/chords, central triangles, diameters, and same-length/different-role rows.

Priority Visual IDs covered: high.

Renderer primitives needed: station set activation, relation selector, equal-length tick marks, role labels, proof labels, ghost overlays, sequential reveal windows.

Implementation order: build a generic `renderFirstCircleRelations(config)` that supports radii, neighbouring chords, diameters, triangle fills, and selected relation labels.

Open questions: how aggressively to deduplicate overlays when a single scene asks for both relation grammar and proof commentary.

## 3. Pair catalogue

Visual IDs covered: pair-catalogue IDs in Chapter Two and their Part Two reinspection counterparts; approximate planning range V019-V040, including rows for 21 joins, radii, unit chords, diameters, skipped chords, and long joins.

Occurrence rows covered: pair catalogue rows and all scene mappings where the asset summary refers to pairwise joins, join classes, 21 joins, or relation grouping.

Priority Visual IDs covered: high to medium.

Renderer primitives needed: complete pair generator over seven stations, relation class grouping, selectable join set, length-class styling, hover/step focus, pair ledger mini-table.

Implementation order: implement pair generator and one renderer config schema first; then support chapter-specific presets.

Open questions: whether to draw all 21 joins simultaneously, in grouped phases, or as a catalogue carousel within a single scene card.

## 4. Triple catalogue

Visual IDs covered: triple-catalogue IDs in Chapter Three and reuse rows; approximate planning range V041-V075, including boundary triples, centre triples, gap patterns, equilateral families, isosceles families, and scalene/residue cases.

Occurrence rows covered: all rows whose asset summaries mention triples, triangle catalogue, boundary families, 20 boundary triples, or triangle classification.

Priority Visual IDs covered: high.

Renderer primitives needed: triple selector, triangle fill, side-length classifier, gap-pattern classifier, family labels, catalogue pagination/stepping.

Implementation order: create a generic triangle activation primitive over station triples; then add classifier badges and grouped stepping.

Open questions: whether the triple catalogue should be rendered as a single compact catalogue panel or one highlighted triangle per scene.

## 5. Right-angle and root-three lock

Visual IDs covered: right-angle, 30-60-90, height, diameter-standing triangle, and root-three lock visuals; approximate planning range V076-V105 and reuse IDs in Part Two.

Occurrence rows covered: all rows mentioning right angle, diameter proof, height, half-equilateral, root-three relation, trigonometric values, or 30-60-90 lock.

Priority Visual IDs covered: high.

Renderer primitives needed: right-angle marker, altitude construction, midpoint/diameter relation, side-length annotations, root-three label, half-cell overlay, proof-step sequencing.

Implementation order: implement one canonical 30-60-90 renderer with configurable station triple and derived labels; then connect all right-angle/root-three Visual IDs to that grammar.

Open questions: exact visual convention for right-angle marker on triangular axial projection; whether to display numeric values or symbolic labels only.

## 6. Ratio and similarity

Visual IDs covered: ratio, scale, proportionality, similarity, and comparison rows; approximate planning range V106-V130 and Part Two invariant/sameness counterparts.

Occurrence rows covered: all rows referring to ratio, same shape/different scale, similarity, length class comparison, or proportional preservation.

Priority Visual IDs covered: medium.

Renderer primitives needed: matched triangle overlay, scale ghost, ratio bracket, side-pair highlighting, comparison captions.

Implementation order: after right-angle primitives, reuse triangle and side-label systems for similarity comparisons.

Open questions: whether non-unit scaled figures must be generated from lawful substrate coordinates only or may use overlay transforms while preserving source coordinate disclosure.

## 7. Native coordinates

Visual IDs covered: Chapter Six native-coordinate IDs and Part Two recurrence-memory coordinate IDs; approximate planning range V131-V160 plus V263_coordinates_as_recurrence_memory.

Occurrence rows covered: all coordinate-system rows, q/r movement rows, carrier families, station naming, and native distance rule rows.

Priority Visual IDs covered: medium to high.

Renderer primitives needed: finite axial field, q/r labels, carrier families, coordinate readout, native norm display, selected path arrows.

Implementation order: implement finite substrate field renderer with clipped carriers, then add coordinate badges and path highlighting.

Open questions: how much grid density is legible inside the current scene-card visual panel.

## 8. Rings and recurrence

Visual IDs covered: ring, shell, recurrence, generated neighbourhood, repeated centre, and field-extension IDs; approximate planning range V161-V190 and Part Two recurrence IDs V253-V269.

Occurrence rows covered: first-circle recurrence, local sixfold neighbourhood recurrence, distance classes, repeated unit edges, seed catalogue, field extension, and lawful station-centre reuse.

Priority Visual IDs covered: high for recurrence rows.

Renderer primitives needed: generated-neighbourhood function, multiple active centres, duplicate removal, shell rings, recurrence arrows, field catchment points.

Implementation order: reuse canonical generation rules from the substrate module, then implement local-neighbourhood and multi-centre expansion presets.

Open questions: whether recurrence should be shown as animated expansion or stepped still layers.

## 9. Cell and area recomposition

Visual IDs covered: cell, area, hexagon, rhombus, parallelogram, decomposition, recomposition, and area-invariant IDs; approximate planning range V191-V225 plus V277-V324.

Occurrence rows covered: all rows mentioning equilateral cells, six-cell hexagon, two-cell rhombus, lawful decomposition, piece accounting, recomposition, rearrangement, and area preservation.

Priority Visual IDs covered: high in Part Two assembly/decomposition/recomposition.

Renderer primitives needed: cell tiling, polygon assembly, lawful cut line, piece identity labels, piece translation/rotation/reflection overlays, before/after comparison, invariant area badge.

Implementation order: implement static cell assemblies first, then lawful decomposition overlays, then recomposition motion/paired before-after layouts.

Open questions: exact representation of piece motion without implying unearned geometry; whether each piece needs a stable internal ID for proof accounting.

## 10. Transformation and invariant

Visual IDs covered: transformation, invariant, sameness-under-change, turn/reflect/translate, and governing invariant rows; approximate planning range V226-V252 and V315-V331.

Occurrence rows covered: all rows that ask which facts remain under movement, recomposition, reflection, translation, or outline change.

Priority Visual IDs covered: medium to high.

Renderer primitives needed: source/target ghost, transformation arrow, invariant badge, changed-outline marker, unchanged-piece marker, before/after pairing.

Implementation order: build after cell/recomposition primitives because transformation visuals depend on stable piece identities.

Open questions: whether transformation arrows are overlay-only or must be tied to discrete substrate station correspondences.

## 11. Part Two reinspection overlays

Visual IDs covered: Part Two reinspection IDs from Chapter Twelve through Chapter Twenty-Three, especially reused IDs and recap/transition visuals V140-V348 where summaries reread earlier constructions.

Occurrence rows covered: all reinspection, reread, transition, recap, and known-fact-as-lens rows.

Priority Visual IDs covered: high for reused foundational IDs; medium for aphoristic transitions.

Renderer primitives needed: previous-visual ghosting, lens overlay, before/after semantic labels, relation emphasis, subdued recap state, transition card overlay.

Implementation order: route reused foundational IDs to existing renderer families first; then add semantic overlay presets for reread/reinspection scenes.

Open questions: whether purely conceptual reread scenes should receive minimal visual overlays or remain registry-note scenes until a concrete activation is identified.

## 12. Ledger and table scenes

Visual IDs covered: ledger special scene and table/interstitial scene records; no one-off geometry renderer required unless later mapped to visual IDs.

Occurrence rows covered: the interstitial earned-catalogue table between Chapter Ten and Chapter Eleven, plus any future ledger/table scenes.

Priority Visual IDs covered: special-scene priority, not geometry priority.

Renderer primitives needed: accessible table renderer, sortable or grouped row display, links back to Visual IDs and scenes, no canonical geometry unless a table row requests a visual focus.

Implementation order: keep current table rendering; later add row-to-scene anchors.

Open questions: whether the interstitial ledger should have a compact visual index of earned primitives next to the table.

## Recommended implementation sequence

1. Finish first-circle family: V006-V009.
2. Implement generic first-circle relation renderer to cover residue, radii/chords, fan, and diameters.
3. Implement pair catalogue generator.
4. Implement triple catalogue generator.
5. Implement right-angle/root-three lock.
6. Implement recurrence field generator.
7. Implement cell/area assembly and decomposition.
8. Implement recomposition/invariant before-after layouts.
9. Add Part Two reinspection overlay presets.
10. Enhance ledger/table navigation.

## Validation gate for each family

Before a family is merged, `scripts/validate-runtime.js` must pass. No renderer family may introduce local canonical station maps, local unit-neighbour offsets, local orientation objects, or replacement projection bases outside `src/canonical-substrate.js`.
