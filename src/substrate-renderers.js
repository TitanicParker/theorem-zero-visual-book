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
  'V009_primary_parallel_families'
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

function line(a, b, className = 'tz-line') {
  return el('line', { x1: a.x, y1: a.y, x2: b.x, y2: b.y, class: className });
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
  svg.appendChild(text(22, 34, title, 'tz-title'));
  svg.appendChild(text(22, 52, 'canonical orientation: A west, B north-west, C north-east', 'tz-subtitle'));
  return svg;
}

function appendCaption(svg, value) {
  const caption = el('text', { x: 180, y: 278, class: 'tz-caption', 'text-anchor': 'middle' });
  caption.textContent = value;
  svg.appendChild(caption);
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

function renderV001() {
  return withVerifiedSubstrate('V001 first radius sweep', (points) => {
    const svg = baseSvg('V001 first radius sweep');
    svg.appendChild(line(points.O, points.A, 'tz-radius tz-animate-draw'));
    svg.appendChild(circle(points, 'tz-circle tz-animate-circle'));
    svg.appendChild(point(points, 'O', 'tz-point tz-origin'));
    svg.appendChild(point(points, 'A'));
    svg.appendChild(text(100, 143, 'fixed opening', 'tz-callout'));
    appendCaption(svg, 'O fixes the opening; A is the west unit station on the canonical substrate.');
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
    svg.appendChild(text(86, 105, 'same opening carried', 'tz-callout'));
    appendCaption(svg, 'The compass opening moves from west station A to north-west station B.');
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
    svg.appendChild(text(104, 132, 'OA = OB = AB', 'tz-callout'));
    appendCaption(svg, 'Three equal substrate unit relations force the equilateral triangle OAB.');
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
    appendCaption(svg, 'The fixed opening steps A-B-C-D-E-F and closes on the canonical circle.');
    return svg;
  });
}

function renderV005() {
  return withVerifiedSubstrate('V005 seven-point residue', (points) => {
    const svg = baseSvg('V005 seven-point residue');
    svg.appendChild(circle(points, 'tz-circle tz-fading'));
    appendRadii(svg, points, 'tz-ghost-line');
    appendAllStations(svg, points, canonicalPerimeterNames());
    svg.appendChild(text(112, 68, 'curve released', 'tz-callout'));
    appendCaption(svg, 'When the curve is released, the lawful residue is O plus A-F.');
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
    svg.appendChild(text(86, 108, 'radii: same opening from O', 'tz-callout'));
    svg.appendChild(text(192, 102, 'chords: same length, new role', 'tz-callout tz-callout-blue'));
    appendCaption(svg, 'The same unit length appears as radius and as neighbouring chord; role changes, length does not.');
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
    svg.appendChild(text(116, 150, 'six forced cells', 'tz-callout'));
    appendCaption(svg, 'Each neighbouring boundary pair with O forms one equilateral cell around the centre.');
    return svg;
  });
}

function renderV008() {
  return withVerifiedSubstrate('V008 three diameters', (points) => {
    const svg = baseSvg('V008 three diameters');
    svg.appendChild(circle(points, 'tz-circle tz-muted'));
    svg.appendChild(line(points.A, points.D, 'tz-diameter tz-animate-draw'));
    svg.appendChild(line(points.B, points.E, 'tz-diameter tz-animate-draw'));
    svg.appendChild(line(points.C, points.F, 'tz-diameter tz-animate-draw'));
    appendAllStations(svg, points, ['A', 'B', 'C', 'D', 'E', 'F']);
    svg.appendChild(text(136, 142, 'AD · BE · CF', 'tz-callout'));
    svg.appendChild(text(124, 160, 'three straight centre-lines', 'tz-callout'));
    appendCaption(svg, 'Opposite boundary stations form three diameters through O and three straight angles.');
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
    appendAllStations(svg, points, ['A', 'B', 'C', 'D', 'E', 'F']);
    svg.appendChild(text(42, 78, 'q/r/q+r carriers', 'tz-callout'));
    svg.appendChild(text(42, 94, 'native triangular grain', 'tz-callout'));
    appendCaption(svg, 'The first circle discloses the three native carrier directions; no square grid is introduced.');
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
  V009_primary_parallel_families: renderV009
};

export function hasSubstrateRenderer(visualId) {
  return ACTIVE_VISUAL_IDS.has(visualId);
}

export function renderSubstrateVisual(visualId) {
  const renderer = RENDERERS[visualId];
  return renderer ? renderer() : null;
}
