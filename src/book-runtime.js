import { hasSubstrateRenderer, renderSubstrateVisual } from './substrate-renderers.js?v=20260605-r6';

const DATA_PATHS = {
  manuscript: 'data/manuscript.json',
  scenes: 'data/scenes.json',
  visualAssets: 'data/visual-assets.json',
  mapping: 'data/scene-visual-mapping.json',
  interstitial: 'data/interstitials/earned-catalogue-first-movement.json'
};

const LANDING_VISUAL_SEQUENCE = [
  'V001_first_radius_sweep',
  'V002_carried_opening_to_B',
  'V003_forced_equilateral_OAB',
  'V004_six_step_boundary_closure',
  'V005_release_curve_seven_point_residue',
  'V006_radii_chords_role_change',
  'V007_six_equilateral_fan',
  'V008_three_diameters_straight_angles',
  'V009_primary_parallel_families'
];

const CYCLE_MS = 4200;
const viewport = document.querySelector('#substrate-viewport');
const textPanel = document.querySelector('#scene-text-panel');
const backButton = document.querySelector('#reader-back');
const forwardButton = document.querySelector('#reader-forward');
const position = document.querySelector('#reader-position');

const state = {
  scenes: [],
  blocks: new Map(),
  assets: new Map(),
  activeIndex: 0,
  timer: null,
  landingMode: true
};

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

async function loadJson(path) {
  const response = await fetch(path, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Could not load ${path}: ${response.status}`);
  return response.json();
}

function flattenBlocks(manuscript) {
  const blocks = new Map();
  for (const part of manuscript.parts ?? []) {
    for (const chapter of part.chapters ?? []) {
      for (const block of chapter.blocks ?? []) blocks.set(block.block_id, block);
    }
  }
  return blocks;
}

function indexAssets(visualAssets) {
  return new Map((visualAssets.assets ?? []).map((asset) => [asset.visual_id, asset]));
}

function sceneStatusClass(status) {
  if (status === 'mapped_high_confidence') return 'ok';
  if (status === 'unmapped' || status === 'manual_review') return 'warn';
  return '';
}

function activeScene() {
  return state.scenes[state.activeIndex] ?? null;
}

function assetForScene(scene) {
  return scene?.visual_id ? state.assets.get(scene.visual_id) : null;
}

function visualForLandingIndex(index) {
  return LANDING_VISUAL_SEQUENCE[index % LANDING_VISUAL_SEQUENCE.length];
}

function findSceneIndexByVisualId(visualId) {
  const found = state.scenes.findIndex((scene) => scene.visual_id === visualId);
  return found >= 0 ? found : 0;
}

function clearViewport() {
  viewport.replaceChildren();
}

function renderViewportVisual(visualId, asset) {
  clearViewport();

  if (visualId && hasSubstrateRenderer(visualId)) {
    const stage = document.createElement('div');
    stage.className = 'substrate-stage lens-substrate-stage';
    stage.appendChild(renderSubstrateVisual(visualId));
    viewport.appendChild(stage);
    return;
  }

  const fallback = document.createElement('section');
  fallback.className = 'viewport-fallback';
  fallback.innerHTML = `
    <p class="scene-kicker">Canonical substrate ready</p>
    <h2>${escapeHtml(visualId || 'No visual ID')}</h2>
    <p>${asset ? 'Renderer family not implemented yet.' : 'This scene has no mapped renderer yet.'}</p>
    ${asset ? `
      <dl>
        <dt>Activation</dt><dd>${escapeHtml(asset.activation_variants?.[0] ?? '')}</dd>
        <dt>Overlay</dt><dd>${escapeHtml(asset.overlay_variants?.[0] ?? '')}</dd>
        <dt>Rendering</dt><dd>${escapeHtml(asset.rendering_variants?.[0] ?? '')}</dd>
      </dl>
    ` : ''}
  `;
  viewport.appendChild(fallback);
}

function renderTextForLanding(visualId) {
  const sceneIndex = findSceneIndexByVisualId(visualId);
  const scene = state.scenes[sceneIndex];
  const block = state.blocks.get(scene?.source_block_id);
  const asset = state.assets.get(visualId);

  textPanel.innerHTML = `
    <p class="scene-kicker">Landing substrate cycle</p>
    <h2>${escapeHtml(asset?.visual_id ?? visualId)}</h2>
    <p>${escapeHtml(asset?.canonical_summary ?? 'The canonical substrate opens in its first construction sequence.')}</p>
    <div class="badge-row">
      <span class="badge ok">substrate renderer active</span>
      <span class="badge">initial cycle</span>
      ${scene ? `<span class="badge ${sceneStatusClass(scene.visual_mapping_status)}">${escapeHtml(scene.visual_mapping_status)}</span>` : ''}
    </div>
    ${block?.text ? `<blockquote>${escapeHtml(block.text)}</blockquote>` : ''}
    <p class="reader-hint">Use the arrows below to step backward or forward. The substrate lens remains the landing apparatus.</p>
  `;
}

function renderTextForScene(scene, asset) {
  const block = state.blocks.get(scene?.source_block_id);
  const visualId = scene?.visual_id ?? '';
  textPanel.innerHTML = `
    <p class="scene-kicker">${escapeHtml(block?.chapter_title ?? scene?.scene_id ?? 'Scene')}</p>
    <h2>${escapeHtml(visualId || scene?.visual_mapping_status || 'Unmapped scene')}</h2>
    ${block?.text ? `<p class="active-paragraph">${escapeHtml(block.text)}</p>` : '<p class="active-paragraph">No paragraph text available.</p>'}
    <div class="badge-row">
      <span class="badge ${sceneStatusClass(scene?.visual_mapping_status)}">${escapeHtml(scene?.visual_mapping_status ?? 'unknown')}</span>
      ${scene?.visual_occurrence_global_no ? `<span class="badge">global ${escapeHtml(scene.visual_occurrence_global_no)}</span>` : ''}
      ${asset?.build_tier ? `<span class="badge">${escapeHtml(asset.build_tier)}</span>` : ''}
      ${visualId && hasSubstrateRenderer(visualId) ? '<span class="badge ok">renderer active</span>' : '<span class="badge">registry notes only</span>'}
    </div>
    ${asset?.canonical_summary ? `<p class="asset-summary">${escapeHtml(asset.canonical_summary)}</p>` : ''}
  `;
}

function updatePositionLabel() {
  if (state.landingMode) {
    position.textContent = `substrate ${state.activeIndex + 1}/${LANDING_VISUAL_SEQUENCE.length}`;
  } else {
    position.textContent = `scene ${state.activeIndex + 1}/${state.scenes.length}`;
  }
}

function activateLandingStep(index) {
  state.landingMode = true;
  state.activeIndex = (index + LANDING_VISUAL_SEQUENCE.length) % LANDING_VISUAL_SEQUENCE.length;
  const visualId = visualForLandingIndex(state.activeIndex);
  renderViewportVisual(visualId, state.assets.get(visualId));
  renderTextForLanding(visualId);
  updatePositionLabel();
}

function activateScene(index) {
  state.landingMode = false;
  state.activeIndex = Math.max(0, Math.min(index, state.scenes.length - 1));
  const scene = activeScene();
  const asset = assetForScene(scene);
  renderViewportVisual(scene?.visual_id, asset);
  renderTextForScene(scene, asset);
  updatePositionLabel();
}

function step(delta) {
  stopLandingCycle();
  if (state.landingMode) {
    activateLandingStep(state.activeIndex + delta);
    return;
  }
  activateScene(state.activeIndex + delta);
}

function startLandingCycle() {
  stopLandingCycle();
  state.timer = window.setInterval(() => {
    if (state.landingMode) activateLandingStep(state.activeIndex + 1);
  }, CYCLE_MS);
}

function stopLandingCycle() {
  if (state.timer) window.clearInterval(state.timer);
  state.timer = null;
}

function installControls() {
  backButton?.addEventListener('click', () => step(-1));
  forwardButton?.addEventListener('click', () => step(1));
  window.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') step(-1);
    if (event.key === 'ArrowRight') step(1);
    if (event.key === 'Enter' && state.landingMode) {
      stopLandingCycle();
      activateScene(findSceneIndexByVisualId(visualForLandingIndex(state.activeIndex)));
    }
  });
}

async function main() {
  try {
    const [manuscript, scenes, visualAssets] = await Promise.all([
      loadJson(DATA_PATHS.manuscript),
      loadJson(DATA_PATHS.scenes),
      loadJson(DATA_PATHS.visualAssets)
    ]);

    state.blocks = flattenBlocks(manuscript);
    state.assets = indexAssets(visualAssets);
    state.scenes = (scenes.scenes ?? []).filter((scene) => scene.scene_type !== 'ledger_table');

    installControls();
    activateLandingStep(0);
    startLandingCycle();
  } catch (error) {
    clearViewport();
    textPanel.innerHTML = `
      <p class="scene-kicker">Runtime load failed</p>
      <h2>Could not prepare substrate</h2>
      <p>${escapeHtml(error.message)}</p>
    `;
    console.error(error);
  }
}

main();
