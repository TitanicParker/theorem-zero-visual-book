const SVG_NS = 'http://www.w3.org/2000/svg';

const ORIGIN = { x: 180, y: 150 };
const R = 90;
const SQRT3_OVER_2 = 0.8660254037844386;

const AXIAL = {
  O: { q: 0, r: 0, label: 'O' },
  A: { q: -1, r: 0, label: 'A' },
  B: { q: 0, r: -1, label: 'B' },
  C: { q: 1, r: -1, label: 'C' },
  D: { q: 1, r: 0, label: 'D' },
  E: { q: 0, r: 1, label: 'E' },
  F: { q: -1, r: 1, label: 'F' }
};

function project({ q, r, label }) {
  return {
    x: ORIGIN.x + R * (q + 0.5 * r),
    y: ORIGIN.y + R * (SQRT3_OVER_2 * r),
    q,
    r,
    label
  };
}

const P = Object.fromEntries(Object.entries(AXIAL).map(([name, coord]) => [name, project(coord)]));

const FIRST_FIVE = new Set([
  'V001_first_radius_sweep',
  'V002_carried_opening_to_B',
  'V003_forced_equilateral_OAB',
  'V004_six_step_boundary_closure',
  'V005_release_curve_seven_point_residue'
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

function line(a, b, className = 'tz-line') {
  return el('line', { x1: a.x, y1: a.y, x2: b.x, y2: b.y, class: className });
}

function point(name, className = 'tz-point') {
  const p = P[name];
  const dx = name === 'A' || name === 'D' ? -18 : 8;
  const dy = name === 'E' || name === 'F' ? 18 : -8;
  return el('g', {}, [
    el('circle', { cx: p.x, cy: p.y, r: 4.5, class: className }),
    text(p.x + dx, p.y + dy, p.label)
  ]);
}

function circle(className = 'tz-circle') {
  return el('circle', { cx: P.O.x, cy: P.O.y, r: R, class: className });
}

function arcPath(names) {
  let d = `M ${P[names[0]].x} ${P[names[0]].y}`;
  for (let i = 1; i < names.length; i += 1) {
    const p = P[names[i]];
    d += ` L ${p.x} ${p.y}`;
  }
  return d;
}

function baseSvg(title) {
  const svg = el('svg', {
    viewBox: '0 0 360 300',
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

function renderV001() {
  const svg = baseSvg('V001 first radius sweep');
  svg.appendChild(line(P.O, P.A, 'tz-radius tz-animate-draw'));
  svg.appendChild(circle('tz-circle tz-animate-circle'));
  svg.appendChild(point('O', 'tz-point tz-origin'));
  svg.appendChild(point('A'));
  svg.appendChild(text(100, 143, 'fixed opening', 'tz-callout'));
  appendCaption(svg, 'O fixes the opening; A is the west unit station on the canonical substrate.');
  return svg;
}

function renderV002() {
  const svg = baseSvg('V002 carried opening to B');
  svg.appendChild(circle('tz-circle'));
  svg.appendChild(line(P.O, P.A, 'tz-radius'));
  svg.appendChild(line(P.A, P.B, 'tz-step tz-animate-draw'));
  svg.appendChild(point('O', 'tz-point tz-origin'));
  svg.appendChild(point('A'));
  svg.appendChild(point('B', 'tz-point tz-active'));
  svg.appendChild(text(86, 105, 'same opening carried', 'tz-callout'));
  appendCaption(svg, 'The compass opening moves from west station A to north-west station B.');
  return svg;
}

function renderV003() {
  const svg = baseSvg('V003 forced equilateral OAB');
  svg.appendChild(circle('tz-circle tz-muted'));
  svg.appendChild(el('polygon', { points: `${P.O.x},${P.O.y} ${P.A.x},${P.A.y} ${P.B.x},${P.B.y}`, class: 'tz-fill' }));
  svg.appendChild(line(P.O, P.A, 'tz-proof'));
  svg.appendChild(line(P.O, P.B, 'tz-proof'));
  svg.appendChild(line(P.A, P.B, 'tz-proof'));
  svg.appendChild(point('O', 'tz-point tz-origin'));
  svg.appendChild(point('A'));
  svg.appendChild(point('B', 'tz-point tz-active'));
  svg.appendChild(text(104, 132, 'OA = OB = AB', 'tz-callout'));
  appendCaption(svg, 'Three equal substrate unit relations force the equilateral triangle OAB.');
  return svg;
}

function renderV004() {
  const svg = baseSvg('V004 six-step boundary closure');
  svg.appendChild(circle('tz-circle'));
  const names = ['A', 'B', 'C', 'D', 'E', 'F', 'A'];
  for (let i = 0; i < names.length - 1; i += 1) {
    svg.appendChild(line(P[names[i]], P[names[i + 1]], 'tz-step'));
  }
  svg.appendChild(el('path', { d: arcPath(names), class: 'tz-walk tz-animate-draw' }));
  ['O', 'A', 'B', 'C', 'D', 'E', 'F'].forEach((name) => svg.appendChild(point(name, name === 'O' ? 'tz-point tz-origin' : 'tz-point')));
  appendCaption(svg, 'The fixed opening steps A-B-C-D-E-F and closes on the canonical circle.');
  return svg;
}

function renderV005() {
  const svg = baseSvg('V005 seven-point residue');
  svg.appendChild(circle('tz-circle tz-fading'));
  ['A', 'B', 'C', 'D', 'E', 'F'].forEach((name) => svg.appendChild(line(P.O, P[name], 'tz-ghost-line')));
  ['O', 'A', 'B', 'C', 'D', 'E', 'F'].forEach((name) => svg.appendChild(point(name, name === 'O' ? 'tz-point tz-origin' : 'tz-point tz-active')));
  svg.appendChild(text(112, 68, 'curve released', 'tz-callout'));
  appendCaption(svg, 'When the curve is released, the lawful residue is O plus A-F.');
  return svg;
}

const RENDERERS = {
  V001_first_radius_sweep: renderV001,
  V002_carried_opening_to_B: renderV002,
  V003_forced_equilateral_OAB: renderV003,
  V004_six_step_boundary_closure: renderV004,
  V005_release_curve_seven_point_residue: renderV005
};

export function hasSubstrateRenderer(visualId) {
  return FIRST_FIVE.has(visualId);
}

export function renderSubstrateVisual(visualId) {
  const renderer = RENDERERS[visualId];
  return renderer ? renderer() : null;
}
