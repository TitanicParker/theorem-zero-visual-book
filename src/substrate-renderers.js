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

const ACTIVE_VISUAL_IDS = new Set([
  'V001_first_radius_sweep',
  'V002_carried_opening_to_B',
  'V003_forced_equilateral_OAB',
  'V004_six_step_boundary_closure',
  'V005_release_curve_seven_point_residue',
  'V006_radii_chords_role_change',
  'V007_six_equilateral_fan',
  'V008_three_diameters_straight_angles',
  'V009_primary_parallel_families',
  'V010_local_inventory_plate',
  'V011_pair_catalogue_unit_classes',
  'V012_pair_catalogue_length_classes',
  'V013_segments_vs_carriers',
  'V014_direction_vs_line_parallelism',
  'V015_modes_of_sameness',
  'V016_triple_catalogue_degenerate_genuine',
  'V017_centre_boundary_triples',
  'V018_boundary_triangle_gap_catalogue',
  'V019_identity_vs_instance',
  'V020_right_angle_root_three_lock',
  'V021_notice_vs_use_root_three',
  'V022_ratio_pattern_30_60_90',
  'V023_native_coordinate_pressure',
  'V024_algebra_as_memory',
  'V025_relation_cascade_summary',
  'V026_field_disclosure_closing',
  'V027_pair_as_relation',
  'V030_role_count_closure_21',
  'V033_recurrent_direction_field_pressure',
  'V034_join_attribute_inspector',
  'V036_invariance_not_appearance'
]);

const UNIT_CHORDS = Object.freeze(['AB', 'BC', 'CD', 'DE', 'EF', 'FA']);
const RADII = Object.freeze(['OA', 'OB', 'OC', 'OD', 'OE', 'OF']);
const NEXT_CHORDS = Object.freeze(['AC', 'BD', 'CE', 'DF', 'EA', 'FB']);
const DIAMETERS = Object.freeze(['AD', 'BE', 'CF']);
const DEGENERATE_TRIPLES = Object.freeze([Object.freeze(['O', 'A', 'D']), Object.freeze(['O', 'B', 'E']), Object.freeze(['O', 'C', 'F'])]);
const CENTRE_FAN_TRIPLES = Object.freeze([Object.freeze(['O', 'A', 'B']), Object.freeze(['O', 'B', 'C']), Object.freeze(['O', 'C', 'D']), Object.freeze(['O', 'D', 'E']), Object.freeze(['O', 'E', 'F']), Object.freeze(['O', 'F', 'A'])]);
const BOUNDARY_GAP_TRIPLES = Object.freeze([Object.freeze(['A', 'B', 'C']), Object.freeze(['A', 'C', 'D']), Object.freeze(['A', 'C', 'E']), Object.freeze(['B', 'D', 'F'])]);
const ROOT_THREE_TRIANGLE = Object.freeze(['B', 'F', 'E']);
const CARRIER_GROUPS = Object.freeze([
  Object.freeze(['AO', 'OD', 'AD']),
  Object.freeze(['BO', 'OE', 'BE']),
  Object.freeze(['CO', 'OF', 'CF'])
]);
const PARALLEL_FAMILIES = Object.freeze([
  Object.freeze(['AB', 'CF', 'DE']),
  Object.freeze(['BC', 'AD', 'EF']),
  Object.freeze(['CD', 'BE', 'FA'])
]);

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

function perimeterNamesClosed() {
  const names = canonicalPerimeterNames();
  return [...names, names[0]];
}

function allStationNames() {
  return ['O', ...canonicalPerimeterNames()];
}

function pairNames(pair) {
  return pair.split('');
}

function line(a, b, className = 'tz-line') {
  return el('line', { x1: a.x, y1: a.y, x2: b.x, y2: b.y, class: className });
}

function pairLine(points, pair, className = 'tz-line') {
  const [a, b] = pairNames(pair);
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

function polygon(points, names, className = 'tz-fill') {
  return el('polygon', { points: names.map((name) => `${points[name].x},${points[name].y}`).join(' '), class: className });
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

function arcPath(points, names) {
  let d = `M ${points[names[0]].x} ${points[names[0]].y}`;
  for (let i = 1; i < names.length; i += 1) {
    const p = points[names[i]];
    d += ` L ${p.x} ${p.y}`;
  }
  return d;
}

function baseSvg(title) {
  const svg = el('svg', { viewBox: VIEW_BOX, role: 'img', class: 'substrate-svg', 'aria-label': title });
  svg.appendChild(el('rect', { x: 12, y: 12, width: 336, height: 276, rx: 18, class: 'tz-frame' }));
  return svg;
}

function withVerifiedSubstrate(title, render) {
  const verification = verifyCanonicalSubstrate();
  if (!verification.ok) return diagnosticSvg(title, verification);
  const points = substratePoints();
  if (!points) return diagnosticSvg(title, verification);
  return render(points);
}

function appendAllStations(svg, points, activeNames = []) {
  const active = new Set(activeNames);
  allStationNames().forEach((name) => {
    const className = name === 'O' ? 'tz-point tz-origin' : active.has(name) ? 'tz-point tz-active' : 'tz-point';
    svg.appendChild(point(points, name, className));
  });
}

function appendBoundarySteps(svg, points, className = 'tz-step') {
  const names = perimeterNamesClosed();
  for (let i = 0; i < names.length - 1; i += 1) svg.appendChild(line(points[names[i]], points[names[i + 1]], className));
}

function appendRadii(svg, points, className = 'tz-radius') {
  canonicalPerimeterNames().forEach((name) => svg.appendChild(line(points.O, points[name], className)));
}

function appendDiameters(svg, points, className = 'tz-diameter') {
  appendPairSet(svg, points, DIAMETERS, className);
}

function appendFirstCircleBase(svg, points) {
  svg.appendChild(circle(points, 'tz-circle tz-muted'));
  appendAllStations(svg, points);
}

function appendParallelFamilies(svg, points) {
  PARALLEL_FAMILIES.forEach((family, index) => appendPairSet(svg, points, family, `tz-carrier-segment tz-family-${index + 1}`));
}

function appendCarrierCollapse(svg, points) {
  svg.appendChild(extendedLine(points.A, points.D, 'tz-carrier tz-carrier-a'));
  svg.appendChild(extendedLine(points.B, points.E, 'tz-carrier tz-carrier-b'));
  svg.appendChild(extendedLine(points.C, points.F, 'tz-carrier tz-carrier-c'));
  CARRIER_GROUPS.forEach((group, index) => appendPairSet(svg, points, group, `tz-nested-segment tz-family-${index + 1}`));
}

function appendTriangleEdges(svg, points, names, className = 'tz-proof') {
  svg.appendChild(line(points[names[0]], points[names[1]], className));
  svg.appendChild(line(points[names[1]], points[names[2]], className));
  svg.appendChild(line(points[names[2]], points[names[0]], className));
}

function appendTriangleSet(svg, points, triples, fillClass = 'tz-fill', edgeClass = 'tz-proof') {
  triples.forEach((names, index) => {
    svg.appendChild(polygon(points, names, `${fillClass} ${index % 2 ? 'tz-cell-fill-b' : 'tz-cell-fill-a'}`));
    appendTriangleEdges(svg, points, names, edgeClass);
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

function renderV001() { return withVerifiedSubstrate('V001 first radius sweep', (points) => { const svg = baseSvg('V001 first radius sweep'); svg.appendChild(line(points.O, points.A, 'tz-radius tz-animate-draw')); svg.appendChild(circle(points, 'tz-circle tz-animate-circle')); svg.appendChild(point(points, 'O', 'tz-point tz-origin')); svg.appendChild(point(points, 'A')); return svg; }); }
function renderV002() { return withVerifiedSubstrate('V002 carried opening to B', (points) => { const svg = baseSvg('V002 carried opening to B'); svg.appendChild(circle(points, 'tz-circle')); svg.appendChild(line(points.O, points.A, 'tz-radius')); svg.appendChild(line(points.A, points.B, 'tz-step tz-animate-draw')); svg.appendChild(point(points, 'O', 'tz-point tz-origin')); svg.appendChild(point(points, 'A')); svg.appendChild(point(points, 'B', 'tz-point tz-active')); return svg; }); }
function renderV003() { return withVerifiedSubstrate('V003 forced equilateral OAB', (points) => { const svg = baseSvg('V003 forced equilateral OAB'); svg.appendChild(circle(points, 'tz-circle tz-muted')); svg.appendChild(polygon(points, ['O', 'A', 'B'], 'tz-fill')); appendTriangleEdges(svg, points, ['O', 'A', 'B'], 'tz-proof'); svg.appendChild(point(points, 'O', 'tz-point tz-origin')); svg.appendChild(point(points, 'A')); svg.appendChild(point(points, 'B', 'tz-point tz-active')); return svg; }); }
function renderV004() { return withVerifiedSubstrate('V004 six-step boundary closure', (points) => { const svg = baseSvg('V004 six-step boundary closure'); svg.appendChild(circle(points, 'tz-circle')); const names = perimeterNamesClosed(); appendBoundarySteps(svg, points, 'tz-step'); svg.appendChild(el('path', { d: arcPath(points, names), class: 'tz-walk tz-animate-draw' })); appendAllStations(svg, points); return svg; }); }
function renderV005() { return withVerifiedSubstrate('V005 seven-point residue', (points) => { const svg = baseSvg('V005 seven-point residue'); svg.appendChild(circle(points, 'tz-circle tz-fading')); appendRadii(svg, points, 'tz-ghost-line'); appendAllStations(svg, points, canonicalPerimeterNames()); return svg; }); }
function renderV006() { return withVerifiedSubstrate('V006 radii/chords role change', (points) => { const svg = baseSvg('V006 radii and chords'); svg.appendChild(circle(points, 'tz-circle tz-muted')); appendRadii(svg, points, 'tz-radius tz-role-radius'); appendBoundarySteps(svg, points, 'tz-step tz-role-chord'); appendAllStations(svg, points, canonicalPerimeterNames()); return svg; }); }
function renderV007() { return withVerifiedSubstrate('V007 six equilateral fan', (points) => { const svg = baseSvg('V007 six equilateral fan'); svg.appendChild(circle(points, 'tz-circle tz-muted')); appendTriangleSet(svg, points, CENTRE_FAN_TRIPLES, 'tz-fill', 'tz-proof'); appendAllStations(svg, points, canonicalPerimeterNames()); return svg; }); }
function renderV008() { return withVerifiedSubstrate('V008 three diameters', (points) => { const svg = baseSvg('V008 three diameters'); svg.appendChild(circle(points, 'tz-circle tz-muted')); appendDiameters(svg, points, 'tz-diameter tz-animate-draw'); appendAllStations(svg, points, canonicalPerimeterNames()); return svg; }); }
function renderV009() { return withVerifiedSubstrate('V009 primary carrier families', (points) => { const svg = baseSvg('V009 primary carrier families'); svg.appendChild(circle(points, 'tz-circle tz-muted')); svg.appendChild(extendedLine(points.A, points.D, 'tz-carrier tz-carrier-a')); svg.appendChild(extendedLine(points.B, points.E, 'tz-carrier tz-carrier-b')); svg.appendChild(extendedLine(points.C, points.F, 'tz-carrier tz-carrier-c')); appendAllStations(svg, points, canonicalPerimeterNames()); return svg; }); }
function renderV010() { return withVerifiedSubstrate('V010 local inventory plate', (points) => { const svg = baseSvg('V010 local inventory'); appendFirstCircleBase(svg, points); appendRadii(svg, points, 'tz-radius tz-role-radius'); appendBoundarySteps(svg, points, 'tz-step tz-role-chord'); appendDiameters(svg, points, 'tz-diameter tz-soft'); appendParallelFamilies(svg, points); return svg; }); }
function renderV011() { return withVerifiedSubstrate('V011 pair catalogue unit classes', (points) => { const svg = baseSvg('V011 pair catalogue: unit classes'); svg.appendChild(circle(points, 'tz-circle tz-muted')); appendRadii(svg, points, 'tz-radius tz-role-radius'); appendPairSet(svg, points, UNIT_CHORDS, 'tz-step tz-role-chord'); appendAllStations(svg, points, canonicalPerimeterNames()); return svg; }); }
function renderV012() { return withVerifiedSubstrate('V012 pair catalogue length classes', (points) => { const svg = baseSvg('V012 pair length classes'); svg.appendChild(circle(points, 'tz-circle tz-muted')); appendPairSet(svg, points, UNIT_CHORDS, 'tz-unit-class'); appendRadii(svg, points, 'tz-unit-class'); appendPairSet(svg, points, NEXT_CHORDS, 'tz-next-class'); appendDiameters(svg, points, 'tz-diameter'); appendAllStations(svg, points, canonicalPerimeterNames()); return svg; }); }
function renderV013() { return withVerifiedSubstrate('V013 segments vs carriers', (points) => { const svg = baseSvg('V013 segments vs carriers'); svg.appendChild(circle(points, 'tz-circle tz-muted')); appendCarrierCollapse(svg, points); appendAllStations(svg, points, canonicalPerimeterNames()); return svg; }); }
function renderV014() { return withVerifiedSubstrate('V014 direction vs line parallelism', (points) => { const svg = baseSvg('V014 direction and parallelism'); svg.appendChild(circle(points, 'tz-circle tz-muted')); appendParallelFamilies(svg, points); svg.appendChild(extendedLine(points.A, points.D, 'tz-carrier tz-carrier-a tz-soft')); svg.appendChild(extendedLine(points.B, points.E, 'tz-carrier tz-carrier-b tz-soft')); svg.appendChild(extendedLine(points.C, points.F, 'tz-carrier tz-carrier-c tz-soft')); appendAllStations(svg, points, canonicalPerimeterNames()); return svg; }); }
function renderV015() { return withVerifiedSubstrate('V015 modes of sameness', (points) => { const svg = baseSvg('V015 modes of sameness'); svg.appendChild(circle(points, 'tz-circle tz-muted')); appendPairSet(svg, points, ['OA', 'AB'], 'tz-unit-class'); appendPairSet(svg, points, ['AO', 'AD'], 'tz-diameter'); appendPairSet(svg, points, ['AB', 'DE'], 'tz-carrier-segment tz-family-1'); appendPairSet(svg, points, ['BC', 'EF'], 'tz-carrier-segment tz-family-2'); appendAllStations(svg, points, canonicalPerimeterNames()); return svg; }); }
function renderV016() { return withVerifiedSubstrate('V016 triple catalogue degenerate genuine', (points) => { const svg = baseSvg('V016 triple catalogue'); svg.appendChild(circle(points, 'tz-circle tz-muted')); DEGENERATE_TRIPLES.forEach((names) => appendTriangleEdges(svg, points, names, 'tz-diameter tz-soft')); appendTriangleSet(svg, points, [['O', 'A', 'B'], ['A', 'C', 'E'], ['B', 'D', 'F']], 'tz-fill', 'tz-proof'); appendAllStations(svg, points, canonicalPerimeterNames()); return svg; }); }
function renderV017() { return withVerifiedSubstrate('V017 centre boundary triples', (points) => { const svg = baseSvg('V017 centre boundary triples'); svg.appendChild(circle(points, 'tz-circle tz-muted')); appendTriangleSet(svg, points, CENTRE_FAN_TRIPLES, 'tz-fill', 'tz-proof'); appendDiameters(svg, points, 'tz-diameter tz-soft'); appendAllStations(svg, points, canonicalPerimeterNames()); return svg; }); }
function renderV018() { return withVerifiedSubstrate('V018 boundary triangle catalogue', (points) => { const svg = baseSvg('V018 boundary triangle catalogue'); svg.appendChild(circle(points, 'tz-circle tz-muted')); appendTriangleSet(svg, points, BOUNDARY_GAP_TRIPLES, 'tz-fill', 'tz-proof'); appendBoundarySteps(svg, points, 'tz-ghost-line'); appendAllStations(svg, points, canonicalPerimeterNames()); return svg; }); }
function renderV019() { return withVerifiedSubstrate('V019 identity vs instance', (points) => { const svg = baseSvg('V019 identity vs instance'); svg.appendChild(circle(points, 'tz-circle tz-muted')); appendTriangleSet(svg, points, [['O', 'A', 'B'], ['O', 'B', 'C'], ['O', 'C', 'D']], 'tz-fill', 'tz-proof'); appendAllStations(svg, points, canonicalPerimeterNames()); return svg; }); }
function renderV020() { return withVerifiedSubstrate('V020 right angle root three lock', (points) => { const svg = baseSvg('V020 right angle root three'); svg.appendChild(circle(points, 'tz-circle tz-muted')); svg.appendChild(polygon(points, ROOT_THREE_TRIANGLE, 'tz-fill tz-cell-fill-a')); appendTriangleEdges(svg, points, ROOT_THREE_TRIANGLE, 'tz-proof'); svg.appendChild(pairLine(points, 'BE', 'tz-diameter')); svg.appendChild(pairLine(points, 'FE', 'tz-unit-class')); svg.appendChild(pairLine(points, 'BF', 'tz-next-class')); appendRightAngleMarker(svg, points, 'F', 'B', 'E'); appendAllStations(svg, points, ['B', 'F', 'E']); return svg; }); }
function renderV021() { return withVerifiedSubstrate('V021 notice vs use root three', (points) => { const svg = baseSvg('V021 notice vs use root three'); svg.appendChild(circle(points, 'tz-circle tz-muted')); appendPairSet(svg, points, NEXT_CHORDS, 'tz-next-class'); appendAllStations(svg, points, canonicalPerimeterNames()); return svg; }); }
function renderV022() { return withVerifiedSubstrate('V022 ratio pattern 30 60 90', (points) => { const svg = baseSvg('V022 ratio pattern'); svg.appendChild(circle(points, 'tz-circle tz-muted')); svg.appendChild(polygon(points, ROOT_THREE_TRIANGLE, 'tz-fill tz-cell-fill-b')); svg.appendChild(pairLine(points, 'BE', 'tz-diameter')); svg.appendChild(pairLine(points, 'FE', 'tz-unit-class')); svg.appendChild(pairLine(points, 'BF', 'tz-next-class')); appendRightAngleMarker(svg, points, 'F', 'B', 'E'); appendAllStations(svg, points, ['B', 'F', 'E']); return svg; }); }
function renderV023() { return withVerifiedSubstrate('V023 native coordinate pressure', (points) => { const svg = baseSvg('V023 coordinate pressure'); svg.appendChild(circle(points, 'tz-circle tz-muted')); appendParallelFamilies(svg, points); svg.appendChild(extendedLine(points.A, points.D, 'tz-carrier tz-carrier-a')); svg.appendChild(extendedLine(points.B, points.E, 'tz-carrier tz-carrier-b')); svg.appendChild(extendedLine(points.C, points.F, 'tz-carrier tz-carrier-c')); appendRadii(svg, points, 'tz-ghost-line'); appendAllStations(svg, points, canonicalPerimeterNames()); return svg; }); }
function renderV024() { return withVerifiedSubstrate('V024 algebra as memory', (points) => { const svg = baseSvg('V024 algebra memory'); svg.appendChild(circle(points, 'tz-circle tz-muted')); appendPairSet(svg, points, ['OA', 'OB', 'AB', 'AD', 'BE', 'CF'], 'tz-unit-class'); appendParallelFamilies(svg, points); appendAllStations(svg, points, canonicalPerimeterNames()); return svg; }); }
function renderV025() { return withVerifiedSubstrate('V025 relation cascade summary', (points) => { const svg = baseSvg('V025 relation cascade'); appendFirstCircleBase(svg, points); appendRadii(svg, points, 'tz-ghost-line'); appendBoundarySteps(svg, points, 'tz-step tz-soft'); appendPairSet(svg, points, NEXT_CHORDS, 'tz-next-class'); appendDiameters(svg, points, 'tz-diameter'); appendParallelFamilies(svg, points); return svg; }); }
function renderV026() { return withVerifiedSubstrate('V026 field disclosure closing', (points) => { const svg = baseSvg('V026 field disclosure'); svg.appendChild(circle(points, 'tz-circle tz-fading')); appendRadii(svg, points, 'tz-ghost-line'); appendBoundarySteps(svg, points, 'tz-ghost-line'); appendAllStations(svg, points, canonicalPerimeterNames()); return svg; }); }
function renderV027() { return withVerifiedSubstrate('V027 pair as relation', (points) => { const svg = baseSvg('V027 pair as relation'); svg.appendChild(circle(points, 'tz-circle tz-muted')); appendAllStations(svg, points, canonicalPerimeterNames()); svg.appendChild(pairLine(points, 'AB', 'tz-step tz-animate-draw')); return svg; }); }
function renderV030() { return withVerifiedSubstrate('V030 role count closure', (points) => { const svg = baseSvg('V030 role count closure'); svg.appendChild(circle(points, 'tz-circle tz-muted')); appendRadii(svg, points, 'tz-radius tz-soft'); appendPairSet(svg, points, UNIT_CHORDS, 'tz-step tz-role-chord'); appendPairSet(svg, points, NEXT_CHORDS, 'tz-next-class'); appendDiameters(svg, points, 'tz-diameter'); appendAllStations(svg, points, canonicalPerimeterNames()); return svg; }); }
function renderV033() { return withVerifiedSubstrate('V033 recurrent direction pressure', (points) => { const svg = baseSvg('V033 recurrent direction'); svg.appendChild(circle(points, 'tz-circle tz-muted')); appendParallelFamilies(svg, points); svg.appendChild(extendedLine(points.A, points.D, 'tz-carrier tz-carrier-a')); svg.appendChild(extendedLine(points.B, points.E, 'tz-carrier tz-carrier-b')); svg.appendChild(extendedLine(points.C, points.F, 'tz-carrier tz-carrier-c')); appendAllStations(svg, points, canonicalPerimeterNames()); return svg; }); }
function renderV034() { return withVerifiedSubstrate('V034 join attribute inspector', (points) => { const svg = baseSvg('V034 join inspector'); svg.appendChild(circle(points, 'tz-circle tz-muted')); appendPairSet(svg, points, ['OA', 'AB', 'AD', 'AC'], 'tz-inspector-line'); appendAllStations(svg, points, canonicalPerimeterNames()); return svg; }); }
function renderV036() { return withVerifiedSubstrate('V036 invariance not appearance', (points) => { const svg = baseSvg('V036 invariance'); svg.appendChild(circle(points, 'tz-circle tz-muted')); appendPairSet(svg, points, ['OA', 'AB', 'AD', 'AC', 'BE', 'CF'], 'tz-inspector-line'); appendParallelFamilies(svg, points); appendAllStations(svg, points, canonicalPerimeterNames()); return svg; }); }

const RENDERERS = {
  V001_first_radius_sweep: renderV001,
  V002_carried_opening_to_B: renderV002,
  V003_forced_equilateral_OAB: renderV003,
  V004_six_step_boundary_closure: renderV004,
  V005_release_curve_seven_point_residue: renderV005,
  V006_radii_chords_role_change: renderV006,
  V007_six_equilateral_fan: renderV007,
  V008_three_diameters_straight_angles: renderV008,
  V009_primary_parallel_families: renderV009,
  V010_local_inventory_plate: renderV010,
  V011_pair_catalogue_unit_classes: renderV011,
  V012_pair_catalogue_length_classes: renderV012,
  V013_segments_vs_carriers: renderV013,
  V014_direction_vs_line_parallelism: renderV014,
  V015_modes_of_sameness: renderV015,
  V016_triple_catalogue_degenerate_genuine: renderV016,
  V017_centre_boundary_triples: renderV017,
  V018_boundary_triangle_gap_catalogue: renderV018,
  V019_identity_vs_instance: renderV019,
  V020_right_angle_root_three_lock: renderV020,
  V021_notice_vs_use_root_three: renderV021,
  V022_ratio_pattern_30_60_90: renderV022,
  V023_native_coordinate_pressure: renderV023,
  V024_algebra_as_memory: renderV024,
  V025_relation_cascade_summary: renderV025,
  V026_field_disclosure_closing: renderV026,
  V027_pair_as_relation: renderV027,
  V030_role_count_closure_21: renderV030,
  V033_recurrent_direction_field_pressure: renderV033,
  V034_join_attribute_inspector: renderV034,
  V036_invariance_not_appearance: renderV036
};

export function hasSubstrateRenderer(visualId) {
  return ACTIVE_VISUAL_IDS.has(visualId);
}

export function renderSubstrateVisual(visualId) {
  const renderer = RENDERERS[visualId];
  return renderer ? renderer() : null;
}
