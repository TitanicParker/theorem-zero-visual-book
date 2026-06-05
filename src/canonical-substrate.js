const EXPECTED_CANONICAL_SUBSTRATE = Object.freeze({
  status: 'canonical_substrate_v1_0',
  sha256: '9c8085212c2672780aae5249481826e3e4d14b7cecf65e12e5d060df537e5837',
  basis_q: Object.freeze([1, 0]),
  basis_r: Object.freeze([0.5, -0.8660254037844386]),
  squared_norm: 'q^2 + q*r + r^2',
  orientation: Object.freeze({
    A: 'west',
    B: 'north-west',
    C: 'north-east',
    D: 'east',
    E: 'south-east',
    F: 'south-west'
  }),
  offsets: Object.freeze({
    O: Object.freeze([0, 0]),
    A: Object.freeze([-1, 0]),
    B: Object.freeze([0, -1]),
    C: Object.freeze([1, -1]),
    D: Object.freeze([1, 0]),
    E: Object.freeze([0, 1]),
    F: Object.freeze([-1, 1])
  }),
  station_order: Object.freeze(['O', 'A', 'B', 'C', 'D', 'E', 'F']),
  perimeter_order: Object.freeze(['A', 'B', 'C', 'D', 'E', 'F'])
});

export const CANONICAL_SUBSTRATE = EXPECTED_CANONICAL_SUBSTRATE;

function isPlainObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]';
}

function strictDeepEqual(a, b) {
  if (Object.is(a, b)) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return false;
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    return a.every((value, index) => strictDeepEqual(value, b[index]));
  }
  if (isPlainObject(a) || isPlainObject(b)) {
    if (!isPlainObject(a) || !isPlainObject(b)) return false;
    const ak = Object.keys(a).sort();
    const bk = Object.keys(b).sort();
    if (!strictDeepEqual(ak, bk)) return false;
    return ak.every((key) => strictDeepEqual(a[key], b[key]));
  }
  return false;
}

function clonePair(pair) {
  return Object.freeze([pair[0], pair[1]]);
}

function clonePoint(point) {
  return Object.freeze({ ...point });
}

export function verifyCanonicalSubstrate(candidate = CANONICAL_SUBSTRATE) {
  const expected = EXPECTED_CANONICAL_SUBSTRATE;
  const checks = [
    ['status', candidate?.status, expected.status],
    ['sha256', candidate?.sha256, expected.sha256],
    ['basis_q', candidate?.basis_q, expected.basis_q],
    ['basis_r', candidate?.basis_r, expected.basis_r],
    ['squared_norm', candidate?.squared_norm, expected.squared_norm],
    ['orientation', candidate?.orientation, expected.orientation],
    ['offsets', candidate?.offsets, expected.offsets],
    ['station_order', candidate?.station_order, expected.station_order],
    ['perimeter_order', candidate?.perimeter_order, expected.perimeter_order]
  ];

  const failures = checks
    .filter(([, actual, required]) => !strictDeepEqual(actual, required))
    .map(([label, actual, required]) => ({ label, actual, required }));

  return Object.freeze({
    ok: failures.length === 0,
    status: expected.status,
    sha256: expected.sha256,
    failures
  });
}

export function requireCanonicalSubstrate() {
  const verification = verifyCanonicalSubstrate();
  if (!verification.ok) {
    throw new Error(`Canonical substrate verification failed: ${JSON.stringify(verification.failures)}`);
  }
  return CANONICAL_SUBSTRATE;
}

export function canonicalOffset(stationName) {
  const substrate = requireCanonicalSubstrate();
  const offset = substrate.offsets[stationName];
  if (!offset) throw new Error(`Unknown canonical station: ${stationName}`);
  return clonePair(offset);
}

export function canonicalOrientation(stationName) {
  const substrate = requireCanonicalSubstrate();
  if (stationName === 'O') return 'origin';
  const value = substrate.orientation[stationName];
  if (!value) throw new Error(`Unknown canonical station orientation: ${stationName}`);
  return value;
}

export function canonicalStationNames() {
  return [...requireCanonicalSubstrate().station_order];
}

export function canonicalPerimeterNames() {
  return [...requireCanonicalSubstrate().perimeter_order];
}

export function squaredNorm(q, r) {
  requireCanonicalSubstrate();
  if (!Number.isFinite(q) || !Number.isFinite(r)) throw new Error('squaredNorm requires finite q and r.');
  return q * q + q * r + r * r;
}

export function projectCanonicalAxial(q, r, options = {}) {
  const substrate = requireCanonicalSubstrate();
  if (!Number.isFinite(q) || !Number.isFinite(r)) throw new Error('projectCanonicalAxial requires finite q and r.');
  const radius = options.radius ?? 90;
  const origin = options.origin ?? { x: 180, y: 150 };
  const [bqx, bqy] = substrate.basis_q;
  const [brx, bry] = substrate.basis_r;
  const mathX = q * bqx + r * brx;
  const mathY = q * bqy + r * bry;
  return clonePoint({
    x: origin.x + radius * mathX,
    y: origin.y - radius * mathY,
    q,
    r,
    norm2: squaredNorm(q, r)
  });
}

export function projectCanonicalStation(stationName, options = {}) {
  const [q, r] = canonicalOffset(stationName);
  return clonePoint({
    ...projectCanonicalAxial(q, r, options),
    label: stationName,
    direction: stationName === 'O' ? 'origin' : canonicalOrientation(stationName)
  });
}

export function firstCircleStations(options = {}) {
  const entries = canonicalStationNames().map((name) => [name, projectCanonicalStation(name, options)]);
  return Object.freeze(Object.fromEntries(entries));
}

export function generatedNeighbourStation(centre, directionName, options = {}) {
  const [dq, dr] = canonicalOffset(directionName);
  const q = centre.q + dq;
  const r = centre.r + dr;
  return clonePoint({
    ...projectCanonicalAxial(q, r, options),
    label: directionName,
    centre
  });
}
