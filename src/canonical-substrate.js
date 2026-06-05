export const CANONICAL_SUBSTRATE = Object.freeze({
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
  })
});

export function verifyCanonicalSubstrate() {
  const c = CANONICAL_SUBSTRATE;
  return c.status === 'canonical_substrate_v1_0'
    && c.orientation.A === 'west'
    && c.orientation.B === 'north-west'
    && c.orientation.C === 'north-east'
    && c.orientation.D === 'east'
    && c.orientation.E === 'south-east'
    && c.orientation.F === 'south-west'
    && c.offsets.A[0] === -1
    && c.offsets.A[1] === 0
    && c.offsets.D[0] === 1
    && c.offsets.D[1] === 0;
}

export function projectCanonicalStation(station, options = {}) {
  if (!verifyCanonicalSubstrate()) return null;
  const radius = options.radius ?? 90;
  const origin = options.origin ?? { x: 180, y: 150 };
  const offset = CANONICAL_SUBSTRATE.offsets[station];
  if (!offset) return null;

  const [q, r] = offset;
  const [bqx, bqy] = CANONICAL_SUBSTRATE.basis_q;
  const [brx, bry] = CANONICAL_SUBSTRATE.basis_r;
  const mathX = q * bqx + r * brx;
  const mathY = q * bqy + r * bry;
  return { x: origin.x + radius * mathX, y: origin.y - radius * mathY, q, r, label: station };
}

export function firstCircleStations(options = {}) {
  const names = ['O', 'A', 'B', 'C', 'D', 'E', 'F'];
  return Object.fromEntries(names.map((name) => [name, projectCanonicalStation(name, options)]));
}
