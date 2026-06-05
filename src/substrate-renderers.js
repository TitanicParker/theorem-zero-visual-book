import {
  canonicalPerimeterNames,
  firstCircleStations,
  requireCanonicalSubstrate,
  verifyCanonicalSubstrate
} from './canonical-substrate.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const ORIGIN = Object.freeze({ x: 180, y: 150 });
const R = 90;
const VIEW_BOX = '0 0 360 300';

const UNIT_CHORDS = Object.freeze(['AB', 'BC', 'CD', 'DE', 'EF', 'FA']);
const NEXT_CHORDS = Object.freeze(['AC', 'BD', 'CE', 'DF', 'EA', 'FB']);
const DIAMETERS = Object.freeze(['AD', 'BE', 'CF']);
const CENTRE_FAN = Object.freeze([['O', 'A', 'B'], ['O', 'B', 'C'], ['O', 'C', 'D'], ['O', 'D', 'E'], ['O', 'E', 'F'], ['O', 'F', 'A']]);
const DEGENERATE = Object.freeze([['O', 'A', 'D'], ['O', 'B', 'E'], ['O', 'C', 'F']]);
const BOUNDARY_TRIPLES = Object.freeze([['A', 'B', 'C'], ['A', 'C', 'D'], ['A', 'C', 'E'], ['B', 'D', 'F'], ['B', 'F', 'E']]);
const BFE = Object.freeze(['B', 'F', 'E']);
const CARRIER_GROUPS = Object.freeze([['AO', 'OD', 'AD'], ['BO', 'OE', 'BE'], ['CO', 'OF', 'CF']]);
const PARALLEL_FAMILIES = Object.freeze([['AB', 'CF', 'DE'], ['BC', 'AD', 'EF'], ['CD', 'BE', 'FA']]);

function el(name, attrs = {}, children = []) {
  const node = document.createElementNS(SVG_NS, name);
  for (const [key, value] of Object.entries(attrs)) {
    if (value !== undefined && value !== null) node.setAttribute(key, String(value));
  }
  for (const child of children) node.appendChild(child);
  return node;
}

function text(x, y, value, className = 'tz-label') {
  const node = el('text', { x, y, class: className });
  node.textContent = value;
  return node;
}

function diagnosticSvg(title, verification) {
  const svg = el('svg', { viewBox: VIEW_BOX, role: 'img', class: 'substrate-svg substrate-diagnostic', 'aria-label': `${title} diagnostic` });
  svg.appendChild(el('rect', { x: 12, y: 12, width: 336, height: 276, rx: 18, class: 'tz-frame' }));
  svg.appendChild(text(22, 38, 'SUBSTRATE CONTRACT FAILED', 'tz-title'));
  svg.appendChild(text(22, 62, 'Renderer failed closed; no geometry drawn.', 'tz-subtitle'));
  const message = verification?.failures?.[0] ? `${verification.failures[0].label} mismatch` : 'canonical verification did not pass';
  svg.appendChild(text(22, 86, message, 'tz-caption'));
  return svg;
}

function substratePoints() {
  const verification = verifyCanonicalSubstrate();
  if (!verification.ok) return null;
  requireCanonicalSubstrate();
  return firstCircleStations({ origin: ORIGIN, radius: R });
}

function withVerifiedSubstrate(title, render) {
  const verification = verifyCanonicalSubstrate();
  if (!verification.ok) return diagnosticSvg(title, verification);
  const points = substratePoints();
  if (!points) return diagnosticSvg(title, verification);
  return render(points);
}

function baseSvg(title) {
  const svg = el('svg', { viewBox: VIEW_BOX, role: 'img', class: 'substrate-svg', 'aria-label': title });
  svg.appendChild(el('rect', { x: 12, y: 12, width: 336, height: 276, rx: 18, class: 'tz-frame' }));
  return svg;
}

function perimeterClosed() {
  const names = canonicalPerimeterNames();
  return [...names, names[0]];
}

function stationNames() {
  return ['O', ...canonicalPerimeterNames()];
}

function names(pair) {
  return pair.split('');
}

function line(a, b, className = 'tz-line') {
  return el('line', { x1: a.x, y1: a.y, x2: b.x, y2: b.y, class: className });
}

function pairLine(points, pair, className = 'tz-line') {
  const [a, b] = names(pair);
  return line(points[a], points[b], className);
}

function appendPairSet(svg, points, pairs, className) {
  pairs.forEach((pair) => svg.appendChild(pairLine(points, pair, className)));
}

function extendedLine(a, b, className = 'tz-carrier') {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = Math.hypot(dx, dy) || 1;
  const reach = 260;
  const ux = dx / length;
  const uy = dy / length;
  return el('line', { x1: ORIGIN.x - ux * reach, y1: ORIGIN.y - uy * reach, x2: ORIGIN.x + ux * reach, y2: ORIGIN.y + uy * reach, class: className });
}

function polygon(points, stationList, className = 'tz-fill') {
  return el('polygon', { points: stationList.map((name) => `${points[name].x},${points[name].y}`).join(' '), class: className });
}

function point(points, name, className = 'tz-point') {
  const p = points[name];
  const dx = name === 'A' || name === 'D' ? -18 : 8;
  const dy = name === 'E' || name === 'F' ? 18 : -8;
  return el('g', {}, [el('circle', { cx: p.x, cy: p.y, r: 4.5, class: className }), text(p.x + dx, p.y + dy, p.label)]);
}

function circle(points, className = 'tz-circle') {
  return el('circle', { cx: points.O.x, cy: points.O.y, r: R, class: className });
}

function arcPath(points, stationList) {
  let d = `M ${points[stationList[0]].x} ${points[stationList[0]].y}`;
  for (let i = 1; i < stationList.length; i += 1) d += ` L ${points[stationList[i]].x} ${points[stationList[i]].y}`;
  return d;
}

function appendAllStations(svg, points, activeNames = []) {
  const active = new Set(activeNames);
  stationNames().forEach((name) => svg.appendChild(point(points, name, name === 'O' ? 'tz-point tz-origin' : active.has(name) ? 'tz-point tz-active' : 'tz-point')));
}

function appendBoundary(svg, points, className = 'tz-step') {
  const stationList = perimeterClosed();
  for (let i = 0; i < stationList.length - 1; i += 1) svg.appendChild(line(points[stationList[i]], points[stationList[i + 1]], className));
}

function appendRadii(svg, points, className = 'tz-radius') {
  canonicalPerimeterNames().forEach((name) => svg.appendChild(line(points.O, points[name], className)));
}

function appendDiameters(svg, points, className = 'tz-diameter') {
  appendPairSet(svg, points, DIAMETERS, className);
}

function appendParallelFamilies(svg, points) {
  PARALLEL_FAMILIES.forEach((family, index) => appendPairSet(svg, points, family, `tz-carrier-segment tz-family-${index + 1}`));
}

function appendCarriers(svg, points, soft = false) {
  svg.appendChild(extendedLine(points.A, points.D, `tz-carrier tz-carrier-a${soft ? ' tz-soft' : ''}`));
  svg.appendChild(extendedLine(points.B, points.E, `tz-carrier tz-carrier-b${soft ? ' tz-soft' : ''}`));
  svg.appendChild(extendedLine(points.C, points.F, `tz-carrier tz-carrier-c${soft ? ' tz-soft' : ''}`));
}

function appendCarrierCollapse(svg, points) {
  appendCarriers(svg, points);
  CARRIER_GROUPS.forEach((group, index) => appendPairSet(svg, points, group, `tz-nested-segment tz-family-${index + 1}`));
}

function appendTriangleEdges(svg, points, stationList, className = 'tz-proof') {
  svg.appendChild(line(points[stationList[0]], points[stationList[1]], className));
  svg.appendChild(line(points[stationList[1]], points[stationList[2]], className));
  svg.appendChild(line(points[stationList[2]], points[stationList[0]], className));
}

function appendTriangleSet(svg, points, triples, fillClass = 'tz-fill', edgeClass = 'tz-proof') {
  triples.forEach((triple, index) => {
    svg.appendChild(polygon(points, triple, `${fillClass} ${index % 2 ? 'tz-cell-fill-b' : 'tz-cell-fill-a'}`));
    appendTriangleEdges(svg, points, triple, edgeClass);
  });
}

function appendRightAngleMarker(svg, points, corner, a, b) {
  const p = points[corner];
  const pa = points[a];
  const pb = points[b];
  const size = 14;
  const va = { x: pa.x - p.x, y: pa.y - p.y };
  const vb = { x: pb.x - p.x, y: pb.y - p.y };
  const la = Math.hypot(va.x, va.y) || 1;
  const lb = Math.hypot(vb.x, vb.y) || 1;
  const a1 = { x: p.x + (va.x / la) * size, y: p.y + (va.y / la) * size };
  const b1 = { x: p.x + (vb.x / lb) * size, y: p.y + (vb.y / lb) * size };
  const mid = { x: a1.x + (vb.x / lb) * size, y: a1.y + (vb.y / lb) * size };
  svg.appendChild(el('path', { d: `M ${a1.x} ${a1.y} L ${mid.x} ${mid.y} L ${b1.x} ${b1.y}`, class: 'tz-angle-marker' }));
}

function renderBasic(type) {
  return withVerifiedSubstrate(type, (points) => {
    const svg = baseSvg(type);
    svg.appendChild(circle(points, type === 'residue' ? 'tz-circle tz-fading' : 'tz-circle tz-muted'));
    if (type === 'sweep') svg.appendChild(line(points.O, points.A, 'tz-radius tz-animate-draw'));
    if (type === 'sweep') svg.appendChild(circle(points, 'tz-circle tz-animate-circle'));
    if (type === 'carry') { svg.appendChild(line(points.O, points.A, 'tz-radius')); svg.appendChild(line(points.A, points.B, 'tz-step tz-animate-draw')); }
    if (type === 'equilateral') appendTriangleSet(svg, points, [['O', 'A', 'B']], 'tz-fill', 'tz-proof');
    if (type === 'closure') { appendBoundary(svg, points, 'tz-step'); svg.appendChild(el('path', { d: arcPath(points, perimeterClosed()), class: 'tz-walk tz-animate-draw' })); }
    if (type === 'residue') appendRadii(svg, points, 'tz-ghost-line');
    appendAllStations(svg, points, type === 'carry' ? ['B'] : type === 'sweep' ? ['A'] : canonicalPerimeterNames());
    return svg;
  });
}

function renderRadiiChords() { return withVerifiedSubstrate('radii chords', (points) => { const svg = baseSvg('radii chords'); svg.appendChild(circle(points, 'tz-circle tz-muted')); appendRadii(svg, points, 'tz-radius tz-role-radius'); appendBoundary(svg, points, 'tz-step tz-role-chord'); appendAllStations(svg, points, canonicalPerimeterNames()); return svg; }); }
function renderSixFan() { return withVerifiedSubstrate('six fan', (points) => { const svg = baseSvg('six fan'); svg.appendChild(circle(points, 'tz-circle tz-muted')); appendTriangleSet(svg, points, CENTRE_FAN, 'tz-fill', 'tz-proof'); appendAllStations(svg, points, canonicalPerimeterNames()); return svg; }); }
function renderDiameters() { return withVerifiedSubstrate('diameters', (points) => { const svg = baseSvg('diameters'); svg.appendChild(circle(points, 'tz-circle tz-muted')); appendDiameters(svg, points, 'tz-diameter tz-animate-draw'); appendAllStations(svg, points, canonicalPerimeterNames()); return svg; }); }
function renderCarriers() { return withVerifiedSubstrate('carriers', (points) => { const svg = baseSvg('carriers'); svg.appendChild(circle(points, 'tz-circle tz-muted')); appendCarriers(svg, points); appendAllStations(svg, points, canonicalPerimeterNames()); return svg; }); }
function renderInventory() { return withVerifiedSubstrate('inventory', (points) => { const svg = baseSvg('inventory'); svg.appendChild(circle(points, 'tz-circle tz-muted')); appendRadii(svg, points, 'tz-radius tz-role-radius'); appendBoundary(svg, points, 'tz-step tz-role-chord'); appendDiameters(svg, points, 'tz-diameter tz-soft'); appendParallelFamilies(svg, points); appendAllStations(svg, points, canonicalPerimeterNames()); return svg; }); }
function renderUnitPairs() { return withVerifiedSubstrate('unit pairs', (points) => { const svg = baseSvg('unit pairs'); svg.appendChild(circle(points, 'tz-circle tz-muted')); appendRadii(svg, points, 'tz-radius tz-role-radius'); appendPairSet(svg, points, UNIT_CHORDS, 'tz-step tz-role-chord'); appendAllStations(svg, points, canonicalPerimeterNames()); return svg; }); }
function renderLengthClasses() { return withVerifiedSubstrate('length classes', (points) => { const svg = baseSvg('length classes'); svg.appendChild(circle(points, 'tz-circle tz-muted')); appendPairSet(svg, points, UNIT_CHORDS, 'tz-unit-class'); appendRadii(svg, points, 'tz-unit-class'); appendPairSet(svg, points, NEXT_CHORDS, 'tz-next-class'); appendDiameters(svg, points, 'tz-diameter'); appendAllStations(svg, points, canonicalPerimeterNames()); return svg; }); }
function renderCarrierCollapse() { return withVerifiedSubstrate('carrier collapse', (points) => { const svg = baseSvg('carrier collapse'); svg.appendChild(circle(points, 'tz-circle tz-muted')); appendCarrierCollapse(svg, points); appendAllStations(svg, points, canonicalPerimeterNames()); return svg; }); }
function renderParallelism() { return withVerifiedSubstrate('parallelism', (points) => { const svg = baseSvg('parallelism'); svg.appendChild(circle(points, 'tz-circle tz-muted')); appendParallelFamilies(svg, points); appendCarriers(svg, points, true); appendAllStations(svg, points, canonicalPerimeterNames()); return svg; }); }
function renderSameness() { return withVerifiedSubstrate('sameness', (points) => { const svg = baseSvg('sameness'); svg.appendChild(circle(points, 'tz-circle tz-muted')); appendPairSet(svg, points, ['OA', 'AB'], 'tz-unit-class'); appendPairSet(svg, points, ['AO', 'AD'], 'tz-diameter'); appendPairSet(svg, points, ['AB', 'DE'], 'tz-carrier-segment tz-family-1'); appendPairSet(svg, points, ['BC', 'EF'], 'tz-carrier-segment tz-family-2'); appendAllStations(svg, points, canonicalPerimeterNames()); return svg; }); }
function renderTripleCatalogue() { return withVerifiedSubstrate('triple catalogue', (points) => { const svg = baseSvg('triple catalogue'); svg.appendChild(circle(points, 'tz-circle tz-muted')); DEGENERATE.forEach((triple) => appendTriangleEdges(svg, points, triple, 'tz-diameter tz-soft')); appendTriangleSet(svg, points, [['O', 'A', 'B'], ['A', 'C', 'E'], ['B', 'D', 'F']], 'tz-fill', 'tz-proof'); appendAllStations(svg, points, canonicalPerimeterNames()); return svg; }); }
function renderCentreTriples() { return withVerifiedSubstrate('centre triples', (points) => { const svg = baseSvg('centre triples'); svg.appendChild(circle(points, 'tz-circle tz-muted')); appendTriangleSet(svg, points, CENTRE_FAN, 'tz-fill', 'tz-proof'); appendDiameters(svg, points, 'tz-diameter tz-soft'); appendAllStations(svg, points, canonicalPerimeterNames()); return svg; }); }
function renderBoundaryTriples() { return withVerifiedSubstrate('boundary triples', (points) => { const svg = baseSvg('boundary triples'); svg.appendChild(circle(points, 'tz-circle tz-muted')); appendTriangleSet(svg, points, BOUNDARY_TRIPLES, 'tz-fill', 'tz-proof'); appendBoundary(svg, points, 'tz-ghost-line'); appendAllStations(svg, points, canonicalPerimeterNames()); return svg; }); }
function renderRightAngle() { return withVerifiedSubstrate('right angle', (points) => { const svg = baseSvg('right angle'); svg.appendChild(circle(points, 'tz-circle tz-muted')); svg.appendChild(polygon(points, BFE, 'tz-fill tz-cell-fill-a')); appendTriangleEdges(svg, points, BFE, 'tz-proof'); svg.appendChild(pairLine(points, 'BE', 'tz-diameter')); svg.appendChild(pairLine(points, 'FE', 'tz-unit-class')); svg.appendChild(pairLine(points, 'BF', 'tz-next-class')); appendRightAngleMarker(svg, points, 'F', 'B', 'E'); appendAllStations(svg, points, ['B', 'F', 'E']); return svg; }); }
function renderNextChords() { return withVerifiedSubstrate('next chords', (points) => { const svg = baseSvg('next chords'); svg.appendChild(circle(points, 'tz-circle tz-muted')); appendPairSet(svg, points, NEXT_CHORDS, 'tz-next-class'); appendAllStations(svg, points, canonicalPerimeterNames()); return svg; }); }
function renderProjection() { return withVerifiedSubstrate('projection', (points) => { const svg = baseSvg('projection'); svg.appendChild(circle(points, 'tz-circle tz-muted')); appendCarriers(svg, points, true); svg.appendChild(line(points.O, points.C, 'tz-radius')); svg.appendChild(line(points.C, points.D, 'tz-projection-leg')); svg.appendChild(line(points.O, points.D, 'tz-projection-leg tz-soft')); appendAllStations(svg, points, ['O', 'C', 'D']); return svg; }); }
function renderCoordinatePressure() { return withVerifiedSubstrate('coordinate pressure', (points) => { const svg = baseSvg('coordinate pressure'); svg.appendChild(circle(points, 'tz-circle tz-muted')); appendParallelFamilies(svg, points); appendCarriers(svg, points); appendRadii(svg, points, 'tz-ghost-line'); appendAllStations(svg, points, canonicalPerimeterNames()); return svg; }); }
function renderCoordinateRoute() { return withVerifiedSubstrate('coordinate route', (points) => { const svg = baseSvg('coordinate route'); svg.appendChild(circle(points, 'tz-circle tz-muted')); appendCarriers(svg, points, true); svg.appendChild(pairLine(points, 'OD', 'tz-route-step')); svg.appendChild(pairLine(points, 'DC', 'tz-route-step')); svg.appendChild(pairLine(points, 'OC', 'tz-next-class')); appendAllStations(svg, points, ['O', 'D', 'C']); return svg; }); }
function renderCascade() { return withVerifiedSubstrate('cascade', (points) => { const svg = baseSvg('cascade'); svg.appendChild(circle(points, 'tz-circle tz-muted')); appendRadii(svg, points, 'tz-ghost-line'); appendBoundary(svg, points, 'tz-step tz-soft'); appendPairSet(svg, points, NEXT_CHORDS, 'tz-next-class'); appendDiameters(svg, points, 'tz-diameter'); appendParallelFamilies(svg, points); appendAllStations(svg, points, canonicalPerimeterNames()); return svg; }); }
function renderPairIntro() { return withVerifiedSubstrate('pair intro', (points) => { const svg = baseSvg('pair intro'); svg.appendChild(circle(points, 'tz-circle tz-muted')); appendAllStations(svg, points, canonicalPerimeterNames()); svg.appendChild(pairLine(points, 'AB', 'tz-step tz-animate-draw')); return svg; }); }
function renderInspector() { return withVerifiedSubstrate('inspector', (points) => { const svg = baseSvg('inspector'); svg.appendChild(circle(points, 'tz-circle tz-muted')); appendPairSet(svg, points, ['OA', 'AB', 'AD', 'AC', 'BE', 'CF'], 'tz-inspector-line'); appendParallelFamilies(svg, points); appendAllStations(svg, points, canonicalPerimeterNames()); return svg; }); }

const RENDERERS = {
  V001_first_radius_sweep: () => renderBasic('sweep'),
  V002_carried_opening_to_B: () => renderBasic('carry'),
  V003_forced_equilateral_OAB: () => renderBasic('equilateral'),
  V004_six_step_boundary_closure: () => renderBasic('closure'),
  V005_release_curve_seven_point_residue: () => renderBasic('residue'),
  V006_radii_chords_role_change: renderRadiiChords,
  V007_six_equilateral_fan: renderSixFan,
  V008_three_diameters_straight_angles: renderDiameters,
  V009_primary_parallel_families: renderCarriers,
  V010_local_inventory_plate: renderInventory,
  V011_pair_catalogue_unit_classes: renderUnitPairs,
  V012_pair_catalogue_length_classes: renderLengthClasses,
  V013_segments_vs_carriers: renderCarrierCollapse,
  V014_direction_vs_line_parallelism: renderParallelism,
  V015_modes_of_sameness: renderSameness,
  V016_triple_catalogue_degenerate_genuine: renderTripleCatalogue,
  V017_centre_boundary_triples: renderCentreTriples,
  V018_boundary_triangle_gap_catalogue: renderBoundaryTriples,
  V019_identity_vs_instance: renderCentreTriples,
  V020_right_angle_root_three_lock: renderRightAngle,
  V021_notice_vs_use_root_three: renderNextChords,
  V022_ratio_pattern_30_60_90: renderRightAngle,
  V023_native_coordinate_pressure: renderCoordinatePressure,
  V024_algebra_as_memory: renderSameness,
  V025_relation_cascade_summary: renderCascade,
  V026_field_disclosure_closing: () => renderBasic('residue'),
  V027_pair_as_relation: renderPairIntro,
  V030_role_count_closure_21: renderLengthClasses,
  V033_recurrent_direction_field_pressure: renderCoordinatePressure,
  V034_join_attribute_inspector: renderInspector,
  V036_invariance_not_appearance: renderInspector,
  V042_triple_count_lock_35_3_32: renderTripleCatalogue,
  V045_boundary_gap_family_examples: renderBoundaryTriples,
  V046_boundary_catalogue_count_lock: renderBoundaryTriples,
  V047_full_triple_catalogue_summary: renderTripleCatalogue,
  V048_triples_generate_angle_families: renderBoundaryTriples,
  V049_angle_from_triple_forcing: renderTripleCatalogue,
  V050_right_angle_family_pending: renderRightAngle,
  V052_triple_catalogue_to_right_angle_transition: renderRightAngle,
  V053_BFE_proof_setup: renderRightAngle,
  V054_diameter_forces_right_angle: renderRightAngle,
  V069_trig_names_from_ratios: renderRightAngle,
  V070_BFE_trig_values: renderRightAngle,
  V071_trig_dependency_chain: renderRightAngle,
  V072_unit_radius_projection_reading: renderProjection,
  V073_ratio_to_coordinate_transition: renderProjection,
  V075_native_basis_uv: renderCoordinateRoute,
  V076_negative_native_steps: renderCoordinatePressure,
  V077_route_vs_straight_distance: renderCoordinateRoute,
  V078_native_distance_derivation: renderCoordinateRoute
};

Object.assign(RENDERERS, {
  V086_hexagonal_number_count: renderCoordinatePressure,
  V087_shell_route_distance_distinction: renderCoordinateRoute,
  V089_exact_not_equal_angle: renderCoordinatePressure,
  V090_four_field_search_modes: renderInspector,
  V091_portable_relation_seed_catalogue: renderCascade,
  V092_recurrence_to_cells_transition: renderSixFan,
  V093_cells_enter_field: renderSixFan,
  V094_unit_equilateral_area_cell: () => renderBasic('equilateral'),
  V095_unit_cell_area_derivation: renderRightAngle,
  V100_piece_accounting_area_proof: renderSixFan,
  V101_area_to_transformation_transition: renderInspector,
  V102_first_invariant_governed_change: renderInspector,
  V103_transformation_grammar_overview: renderInspector,
  V104_sixth_turn_rotation: renderSixFan,
  V105_reflection_across_AD: renderParallelism,
  V106_translation_across_field: renderCoordinatePressure,
  V130_station_role_wheel: renderSameness,
  V131_selection_activates_relation: renderCentreTriples,
  V132_triangle_catalogue_as_identity_lens: renderBoundaryTriples,
  V133_field_as_recurrence_place: renderCascade,
  V135_invariant_as_lens: renderInspector,
  V136_fixed_opening_engine: renderRadiiChords,
  V137_practical_rule_fixed_opening: renderRadiiChords,
  V139_radius_to_chord_portability: renderRadiiChords,
  V143_four_roles_one_length: renderSameness,
  V165_circle_as_diameter_carrier: renderDiameters,
  V168_instance_vs_family_on_circle: renderRightAngle,
  V169_circle_symmetry_display: renderSixFan,
  V170_circle_as_local_origin: renderCoordinatePressure,
  V171_circle_vs_field_distinction: renderCoordinatePressure,
  V173_circle_reading_dependency_chain: renderCascade,
  V174_same_curve_many_lenses: renderCascade,
  V175_circle_to_station_roles_transition: renderSameness,
  V176_station_label_vs_role: renderSameness,
  V178_station_as_radius_endpoint: renderRadiiChords,
  V181_neighbour_role_unit_chords_cells: renderSixFan,
  V182_opposite_role_diameters: renderRightAngle,
  V183_station_as_selection_participant: renderInspector,
  V186_station_coordinate_memory_role: renderCoordinateRoute,
  V188_station_role_catalogue: renderSameness,
  V189_A_role_timeline: renderSameness,
  V190_identity_survives_use: renderInspector,
  V191_station_roles_to_selection_transition: renderInspector,
  V193_available_vs_active_relation: renderInspector,
  V194_pair_selection_role_switch: renderInspector,
  V197_selected_triple_family_examples: renderBoundaryTriples,
  V200_transformation_identity_survival: renderInspector,
  V201_difference_then_invariant: renderInspector,
  V202_field_selection_opportunities: renderCoordinatePressure,
  V203_selection_not_proof_warning: renderInspector,
  V204_select_inspect_classify_lock_reinspect: renderCascade,
  V216_scaling_separates_identity_readings: renderInspector,
  V217_same_requires_reading: renderInspector,
  V218_identity_readings_on_residue: renderSameness,
  V220_identity_recurrence_in_field: renderCoordinatePressure,
  V221_instance_identity_definition_plate: renderCentreTriples,
  V222_what_kind_of_same_transition: renderSameness,
  V223_same_length_different_role_opening: renderRadiiChords,
  V224_same_length_inspector: renderRadiiChords,
  V226_same_direction_parallelism: renderParallelism,
  V227_same_angle_pattern: renderRightAngle,
  V233_resemblance_vs_invariant: renderInspector,
  V275_identity_assembly_into_bodies: renderCascade,
  V276_lawful_assembly_not_arbitrary_drawing: renderInspector,
  V277_first_hexagon_as_assembled_body: renderSixFan,
  V278_two_cell_rhombus_assembly: renderSixFan,
  V279_boundary_vs_cell_reading: renderSixFan,
  V280_body_sameness_invariants: renderInspector,
  V281_lawful_cuts_decomposition: renderInspector,
  V282_accountable_decomposition: renderSixFan,
  V284_assembly_to_recomposition_chain: renderCascade,
  V296_larger_triangle_decomposition_options: renderBoundaryTriples,
  V297_decomposition_disciplined: renderInspector,
  V298_lawful_vs_arbitrary_cutting: renderInspector,
  V299_cut_availability_rule: renderInspector,
  V301_cut_changes_reading_not_surface: renderSixFan,
  V302_piece_account_checklist: renderCascade,
  V303_diagram_vs_piece_accounting: renderInspector,
  V304_cell_grammar_of_parts: renderSixFan,
  V305_right_triangle_as_half_cell: renderRightAngle,
  V306_distinct_routes_warning: renderInspector,
  V323_recomposition_invariant_profile: renderInspector,
  V324_field_supports_recomposition_sequence: renderCascade,
  V325_recomposition_reveals_measure: renderSixFan,
  V326_piece_account_proof_transfer: renderInspector,
  V327_lawful_recomposition_definition: renderCascade,
  V328_reinspection_lens_synthesis: renderCascade,
  V329_part_two_reinspection_frame: renderCascade,
  V343_enrichment_without_mythology: renderInspector,
  V344_reinspection_method_loop: renderCascade,
  V345_method_protects_from_drift: renderInspector,
  V346_part_three_discipline_gate: renderCascade,
  V347_part_two_teaching_chain: renderCascade,
  V348_part_two_closing_aphorism: renderInspector
});

const ACTIVE_VISUAL_IDS = new Set(Object.keys(RENDERERS));

export function hasSubstrateRenderer(visualId) {
  return ACTIVE_VISUAL_IDS.has(visualId);
}

export function renderSubstrateVisual(visualId) {
  const renderer = RENDERERS[visualId];
  return renderer ? renderer() : null;
}
