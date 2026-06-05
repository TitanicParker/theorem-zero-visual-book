#!/usr/bin/env node

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const EXPECTED_CANONICAL_SHA256 = '9c8085212c2672780aae5249481826e3e4d14b7cecf65e12e5d060df537e5837';
const EXPECTED_FIRST_VISUAL_ID = 'V001_first_radius_sweep';
const EXPECTED_UNIQUE_VISUAL_IDS = 255;
const EXPECTED_EXPANDED_OCCURRENCE_ROWS = 348;
const EXPECTED_PRIORITY_VISUAL_IDS = 94;
const EXPECTED_TOTAL_SCENES = 366;
const EXPECTED_REGISTRY_ROWS_USED = 348;

const checks = [];

function pathOf(relativePath) {
  return join(ROOT, relativePath);
}

function readText(relativePath) {
  return readFileSync(pathOf(relativePath), 'utf8');
}

function pass(label, detail = '') {
  checks.push({ ok: true, label, detail });
}

function fail(label, detail = '') {
  checks.push({ ok: false, label, detail });
}

function assertCheck(condition, label, detail = '') {
  if (condition) pass(label, detail);
  else fail(label, detail);
}

function parseJson(relativePath) {
  try {
    const parsed = JSON.parse(readText(relativePath));
    pass(`${relativePath} parses`);
    return parsed;
  } catch (error) {
    fail(`${relativePath} parses`, error.message);
    return null;
  }
}

function sha256(relativePath) {
  return createHash('sha256').update(readFileSync(pathOf(relativePath))).digest('hex');
}

function listFilesRecursive(relativePath) {
  const absolute = pathOf(relativePath);
  if (!existsSync(absolute)) return [];
  const out = [];
  for (const name of readdirSync(absolute)) {
    const full = join(absolute, name);
    const rel = join(relativePath, name).replaceAll('\\', '/');
    if (statSync(full).isDirectory()) out.push(...listFilesRecursive(rel));
    else out.push(rel);
  }
  return out;
}

function collectMappedVisualIds(scenes, mapping) {
  const ids = new Set();
  for (const scene of scenes?.scenes ?? []) {
    if (scene.visual_id) ids.add(scene.visual_id);
  }
  for (const row of mapping?.mappings ?? []) {
    if (row.visual_id) ids.add(row.visual_id);
  }
  return ids;
}

function countExpandedRows(assets) {
  return (assets?.assets ?? []).reduce((sum, asset) => sum + Number(asset.occurrence_count || 0), 0);
}

function priorityVisualIds(mapping, assets) {
  const fromMapping = mapping?.counts?.priority_visual_ids_represented ?? mapping?.counts?.priority_visual_ids_total;
  if (Number.isInteger(fromMapping)) return fromMapping;
  return (assets?.assets ?? []).filter((asset) => /priority/i.test(asset.build_tier || '')).length;
}

function hasForbiddenRendererGeometry(relativePath, source) {
  const findings = [];
  const patterns = [
    { label: 'local P station object', regex: /\bconst\s+P\s*=\s*\{/ },
    { label: 'local P projected station map', regex: /\bconst\s+P\s*=\s*Object\.fromEntries/ },
    { label: 'local AXIAL station map', regex: /\bconst\s+AXIAL\s*=\s*\{/ },
    { label: 'local canonical station object with O-A-F keys', regex: /\bconst\s+\w+\s*=\s*\{\s*\n\s*O\s*:\s*[^\n]+\n\s*A\s*:/ },
    { label: 'unit_neighbour_offsets outside canonical substrate', regex: /unit_neighbour_offsets/i },
    { label: 'first_circle_station_coordinates outside canonical substrate', regex: /first_circle_station_coordinates/i },
    { label: 'local offset object outside canonical substrate', regex: /\boffsets\s*:\s*Object\.freeze\s*\(\s*\{/ },
    { label: 'local orientation object outside canonical substrate', regex: /\borientation\s*:\s*Object\.freeze\s*\(\s*\{/ },
    { label: 'local orientation const outside canonical substrate', regex: /\bconst\s+\w*ORIENTATION\w*\s*=\s*\{/i },
    { label: 'local station q/r literal for A', regex: /\bA\s*:\s*\{\s*q\s*:\s*-1\s*,\s*r\s*:\s*0/ },
    { label: 'local station array literal for A', regex: /\bA\s*:\s*\[\s*-1\s*,\s*0\s*\]/ }
  ];

  for (const pattern of patterns) {
    if (pattern.regex.test(source)) findings.push(`${relativePath}: ${pattern.label}`);
  }
  return findings;
}

const manuscript = parseJson('data/manuscript.json');
const scenes = parseJson('data/scenes.json');
const assets = parseJson('data/visual-assets.json');
const mapping = parseJson('data/scene-visual-mapping.json');

assertCheck(
  existsSync(pathOf('canonical/theorem_zero_canonical_substrate_v1_0_final.html')),
  'canonical substrate file exists'
);

if (existsSync(pathOf('canonical/theorem_zero_canonical_substrate_v1_0_final.html'))) {
  assertCheck(
    sha256('canonical/theorem_zero_canonical_substrate_v1_0_final.html') === EXPECTED_CANONICAL_SHA256,
    'canonical substrate SHA-256 unchanged',
    sha256('canonical/theorem_zero_canonical_substrate_v1_0_final.html')
  );
}

assertCheck(assets?.assets?.[0]?.visual_id === EXPECTED_FIRST_VISUAL_ID, 'data/visual-assets.json begins with V001_first_radius_sweep');
assertCheck(new Set((assets?.assets ?? []).map((asset) => asset.visual_id)).size === EXPECTED_UNIQUE_VISUAL_IDS, 'unique Visual IDs = 255');
assertCheck(countExpandedRows(assets) === EXPECTED_EXPANDED_OCCURRENCE_ROWS, 'expanded occurrence rows = 348');
assertCheck(priorityVisualIds(mapping, assets) === EXPECTED_PRIORITY_VISUAL_IDS, 'priority Visual IDs = 94');
assertCheck((scenes?.scenes ?? []).length === EXPECTED_TOTAL_SCENES, 'data/scenes.json total scenes = 366');
assertCheck(mapping?.counts?.registry_occurrence_rows_used === EXPECTED_REGISTRY_ROWS_USED, 'registry occurrence rows used = 348');
assertCheck(mapping?.preflight_validation?.expanded_occurrence_rows === EXPECTED_EXPANDED_OCCURRENCE_ROWS, 'mapping preflight expanded occurrence rows = 348');

const assetIds = new Set((assets?.assets ?? []).map((asset) => asset.visual_id));
const mappedIds = collectMappedVisualIds(scenes, mapping);
const missingIds = [...mappedIds].filter((id) => !assetIds.has(id));
assertCheck(missingIds.length === 0, 'mapped visual IDs all exist in data/visual-assets.json', missingIds.join(', '));

assertCheck(existsSync(pathOf('src/canonical-substrate.js')), 'src/canonical-substrate.js exists');
assertCheck(existsSync(pathOf('src/substrate-renderers.js')), 'src/substrate-renderers.js exists');

const rendererSource = existsSync(pathOf('src/substrate-renderers.js')) ? readText('src/substrate-renderers.js') : '';
assertCheck(
  /from ['"]\.\/canonical-substrate\.js['"]/.test(rendererSource),
  'src/substrate-renderers.js imports from ./canonical-substrate.js'
);

const rendererFiles = listFilesRecursive('src')
  .filter((file) => /renderer|renderers|runtime/i.test(file))
  .filter((file) => file !== 'src/canonical-substrate.js');

const forbiddenFindings = rendererFiles.flatMap((file) => hasForbiddenRendererGeometry(file, readText(file)));
assertCheck(
  forbiddenFindings.length === 0,
  'renderer modules do not define local canonical station coordinate maps or forbidden offsets/orientation objects',
  forbiddenFindings.join('\n')
);

assertCheck(Boolean(manuscript), 'manuscript JSON object loaded');

const failed = checks.filter((check) => !check.ok);
console.log('Theorem Zero runtime validation');
console.log('================================');
for (const check of checks) {
  const status = check.ok ? 'PASS' : 'FAIL';
  console.log(`${status} ${check.label}${check.detail ? ` :: ${check.detail}` : ''}`);
}
console.log('================================');
console.log(failed.length === 0 ? 'PASS runtime validation complete' : `FAIL ${failed.length} validation check(s) failed`);

if (failed.length > 0) process.exit(1);
