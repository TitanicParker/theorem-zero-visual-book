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
  'V015_modes_of_sameness'
]);

const UNIT_CHORDS = Object.freeze(['AB', 'BC', 'CD', 'DE', 'EF', 'FA']);
const RADII = Object.freeze(['OA', 'OB', 'OC', 'OD', 'OE', 'OF']);
const NEXT_CHORDS = Object.freeze(['AC', 'BD', 'CE', 'DF', 'EA', 'FB']);
const DIAMETERS = Object.freeze(['AD', 'BE', 'CF']);
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
  const svg = el('svg', {
    viewBox: VIEW_BOX,
    role: 'img',
    class: 'substrate-svg substrate-diagnostic',
    'aria-label': `${title} diagnostic`
  });
  svg.appendChild(el('rect', { x: 12, y: 12, width: 336, height: 276, rx: 18, class: 'tz-frame' }));
  svg.appendChild(text(22, 38, 'SUBSTRATE CONTRACT FAILED', 'tz-title'));
  svg.appendChild(text(22, 62, 'Renderer failed closed; no geometry drawn.', 'tz-subtitle'));
  const message = verification?.failures?.[0]
    ? `${verification.failures[0].label} mismatch`
    : 'canonical verification did not pass';
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
  return el('line', {
    x1: ORIGIN.x - ux * reach,
    y1: ORIGIN.y - uy * reach,
    x2: ORIGIN.x + ux * reach,
    y2: ORIGIN.y + uy * reach,
    class: className
  });
}

function polygon(points, names, className = 'tz-fill') {
  return el('polygon', {
    points: names.map((name) => `${points[name].x},${points[name].y}`).join(' '),
    class: className
  });
}

function point(points, name, className = 'tz-point') {
  const p = points[name];
  const dx = name === 'A' || name === 'D' ? -18 : 8;
  const dy = name === 'E' || name === 'F' ? 18 : -8;
  return el('g', {}, [
    el('circle', { cx: p.x, cy: p.y, r: 4.5, class: className }),
    text(p.x + dx, p.y + dy, p.label)
  ]);
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
  const svg = el('svg', {
    viewBox: VIEW_BOX,
    role: 'img',
    class: 'substrate-svg',
    'aria-label': title
  });
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
    const className = name === 'O'
      ? 'tz-point tz-origin'
      : active.has(name)
        ? 'tz-point tz-active'
        : 'tz-point';
    svg.appendChild(point(points, name, className));
  });
}

function appendBoundarySteps(svg, points, className = 'tz-step') {
  const names = perimeterNamesClosed();
  for (let i = 0; i < names.length - 1; i += 1) {
    svg.appendChild(line(points[names[i]], points[names[i + 1]], className));
  }
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
  PARALLEL_FAMILIES.forEach((family, index) => {
    appendPairSet(svg, points, family, `tz-carrier-segment tz-family-${index + 1}`);
  });
}

function appendCarrierCollapse(svg, points) {
  svg.appendChild(extendedLine(points.A, points.D, 'tz-carrier tz-carrier-a'));
  svg.appendChild(extendedLine(points.B, points.E, 'tz-carrier tz-carrier-b'));
  svg.appendChild(extendedLine(points.C, points.F, 'tz-carrier tz-carrier-c'));
  CARRIER_GROUPS.forEach((group, index) => appendPairSet(svg, points, group, `tz-nested-segment tz-family-${index + 1}`));
}

function renderV001() {
  return withVerifiedSubstrate('V001 first radius sweep', (points) => {
    const svg = baseSvg('V001 first radius sweep');
    svg.appendChild(line(points.O, points.A, 'tz-radius tz-animate-draw'));
    svg.appendChild(circle(points, 'tz-circle tz-animate-circle'));
    svg.appendChild(point(points, 'O', 'tz-point tz-origin'));
    svg.appendChild(point(points, 'A'));
    return svg;
  });
}

function renderV002() {
  return withVerifiedSubstrate('V002 carried opening to B', (points) => {
    const svg = baseSvg('V002 carried opening to B');
    svg.appendChild(circle(points, 'tz-circle'));
    svg.appendChild(line(points.O, points.A, 'tz-radius'));
    svg.appendChild(line(points.A, points.B, 'tz-step tz-animate-draw'));
    svg.appendChild(point(points, 'O', 'tz-point tz-origin'));
    svg.appendChild(point(points, 'A'));
    svg.appendChild(point(points, 'B', 'tz-point tz-active'));
    return svg;
  });
}

function renderV003() {
  return withVerifiedSubstrate('V003 forced equilateral OAB', (points) => {
    const svg = baseSvg('V003 forced equilateral OAB');
    svg.appendChild(circle(points, 'tz-circle tz-muted'));
    svg.appendChild(polygon(points, ['O', 'A', 'B'], 'tz-fill'));
    svg.appendChild(line(points.O, points.A, 'tz-proof'));
    svg.appendChild(line(points.O, points.B, 'tz-proof'));
    svg.appendChild(line(points.A, points.B, 'tz-proof'));
    svg.appendChild(point(points, 'O', 'tz-point tz-origin'));
    svg.appendChild(point(points, 'A'));
    svg.appendChild(point(points, 'B', 'tz-point tz-active'));
    return svg;
  });
}

function renderV004() {
  return withVerifiedSubstrate('V004 six-step boundary closure', (points) => {
    const svg = baseSvg('V004 six-step boundary closure');
    svg.appendChild(circle(points, 'tz-circle'));
    const names = perimeterNamesClosed();
    appendBoundarySteps(svg, points, 'tz-step');
    svg.appendChild(el('path', { d: arcPath(points, names), class: 'tz-walk tz-animate-draw' }));
    appendAllStations(svg, points);
    return svg;
  });
}

function renderV005() {
  return withVerifiedSubstrate('V005 seven-point residue', (points) => {
    const svg = baseSvg('V005 seven-point residue');
    svg.appendChild(circle(points, 'tz-circle tz-fading'));
    appendRadii(svg, points, 'tz-ghost-line');
    appendAllStations(svg, points, canonicalPerimeterNames());
    return svg;
  });
}

function renderV006() {
  return withVerifiedSubstrate('V006 radii/chords role change', (points) => {
    const svg = baseSvg('V006 radii and chords');
    svg.appendChild(circle(points, 'tz-circle tz-muted'));
    appendRadii(svg, points, 'tz-radius tz-role-radius');
    appendBoundarySteps(svg, points, 'tz-step tz-role-chord');
    appendAllStations(svg, points, canonicalPerimeterNames());
    return svg;
  });
}

function renderV007() {
  return withVerifiedSubstrate('V007 six equilateral fan', (points) => {
    const svg = baseSvg('V007 six equilateral fan');
    svg.appendChild(circle(points, 'tz-circle tz-muted'));
    const names = perimeterNamesClosed();
    for (let i = 0; i < names.length - 1; i += 1) {
      svg.appendChild(polygon(points, ['O', names[i], names[i + 1]], i % 2 === 0 ? 'tz-fill tz-cell-fill-a' : 'tz-fill tz-cell-fill-b'));
    }
    appendRadii(svg, points, 'tz-proof tz-thin-proof');
    appendBoundarySteps(svg, points, 'tz-proof');
    appendAllStations(svg, points, canonicalPerimeterNames());
    return svg;
  });
}

function renderV008() {
  return withVerifiedSubstrate('V008 three diameters', (points) => {
    const svg = baseSvg('V008 three diameters');
    svg.appendChild(circle(points, 'tz-circle tz-muted'));
    appendDiameters(svg, points, 'tz-diameter tz-animate-draw');
    appendAllStations(svg, points, canonicalPerimeterNames());
    return svg;
  });
}

function renderV009() {
  return withVerifiedSubstrate('V009 primary carrier families', (points) => {
    const svg = baseSvg('V009 primary carrier families');
    svg.appendChild(circle(points, 'tz-circle tz-muted'));
    svg.appendChild(extendedLine(points.A, points.D, 'tz-carrier tz-carrier-a'));
    svg.appendChild(extendedLine(points.B, points.E, 'tz-carrier tz-carrier-b'));
    svg.appendChild(extendedLine(points.C, points.F, 'tz-carrier tz-carrier-c'));
    appendAllStations(svg, points, canonicalPerimeterNames());
    return svg;
  });
}

function renderV010() {
  return withVerifiedSubstrate('V010 local inventory plate', (points) => {
    const svg = baseSvg('V010 local inventory');
    appendFirstCircleBase(svg, points);
    appendRadii(svg, points, 'tz-radius tz-role-radius');
    appendBoundarySteps(svg, points, 'tz-step tz-role-chord');
    appendDiameters(svg, points, 'tz-diameter tz-soft');
    appendParallelFamilies(svg, points);
    return svg;
  });
}

function renderV011() {
  return withVerifiedSubstrate('V011 pair catalogue unit classes', (points) => {
    const svg = baseSvg('V011 pair catalogue: unit classes');
    svg.appendChild(circle(points, 'tz-circle tz-muted'));
    appendRadii(svg, points, 'tz-radius tz-role-radius');
    appendPairSet(svg, points, UNIT_CHORDS, 'tz-step tz-role-chord');
    appendAllStations(svg, points, canonicalPerimeterNames());
    return svg;
  });
}

function renderV012() {
  return withVerifiedSubstrate('V012 pair catalogue length classes', (points) => {
    const svg = baseSvg('V012 pair length classes');
    svg.appendChild(circle(points, 'tz-circle tz-muted'));
    appendPairSet(svg, points, UNIT_CHORDS, 'tz-unit-class');
    appendRadii(svg, points, 'tz-unit-class');
    appendPairSet(svg, points, NEXT_CHORDS, 'tz-next-class');
    appendDiameters(svg, points, 'tz-diameter');
    appendAllStations(svg, points, canonicalPerimeterNames());
    return svg;
  });
}

function renderV013() {
  return withVerifiedSubstrate('V013 segments vs carriers', (points) => {
    const svg = baseSvg('V013 segments vs carriers');
    svg.appendChild(circle(points, 'tz-circle tz-muted'));
    appendCarrierCollapse(svg, points);
    appendAllStations(svg, points, canonicalPerimeterNames());
    return svg;
  });
}

function renderV014() {
  return withVerifiedSubstrate('V014 direction vs line parallelism', (points) => {
    const svg = baseSvg('V014 direction and parallelism');
    svg.appendChild(circle(points, 'tz-circle tz-muted'));
    appendParallelFamilies(svg, points);
    svg.appendChild(extendedLine(points.A, points.D, 'tz-carrier tz-carrier-a tz-soft'));
    svg.appendChild(extendedLine(points.B, points.E, 'tz-carrier tz-carrier-b tz-soft'));
    svg.appendChild(extendedLine(points.C, points.F, 'tz-carrier tz-carrier-c tz-soft'));
    appendAllStations(svg, points, canonicalPerimeterNames());
    return svg;
  });
}

function renderV015() {
  return withVerifiedSubstrate('V015 modes of sameness', (points) => {
    const svg = baseSvg('V015 modes of sameness');
    svg.appendChild(circle(points, 'tz-circle tz-muted'));
    appendPairSet(svg, points, ['OA', 'AB'], 'tz-unit-class');
    appendPairSet(svg, points, ['AO', 'AD'], 'tz-diameter');
    appendPairSet(svg, points, ['AB', 'DE'], 'tz-carrier-segment tz-family-1');
    appendPairSet(svg, points, ['BC', 'EF'], 'tz-carrier-segment tz-family-2');
    appendAllStations(svg, points, canonicalPerimeterNames());
    return svg;
  });
}

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
  V015_modes_of_sameness: renderV015
};

export function hasSubstrateRenderer(visualId) {
  return ACTIVE_VISUAL_IDS.has(visualId);
}

export function renderSubstrateVisual(visualId) {
  const renderer = RENDERERS[visualId];
  return renderer ? renderer() : null;
}
