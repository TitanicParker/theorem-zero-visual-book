import { hasSubstrateRenderer, renderSubstrateVisual } from './substrate-renderers.js?v=20260605-r13';

const RENDERER_SOURCE_URL = 'src/substrate-renderers.js?v=20260605-r13';
const VISUAL_ID_PATTERN = /V\d{3}_[A-Za-z0-9_]+/g;

const position = document.querySelector('#reader-position');
const backButton = document.querySelector('#reader-back');
const forwardButton = document.querySelector('#reader-forward');
const frame = document.querySelector('#canonical-substrate-frame');
const renderStage = document.querySelector('#family-render-stage');
const familyLabel = document.querySelector('#family-label');

const frameScreens = [
  { type: 'frame', key: 'arrow-centrality-navigator', tier: 'Toy', label: 'arrow centrality navigator', title: 'Arrow / Centrality Navigator', src: 'canonical/theorem-zero-arrow-centrality-navigator.html' },
  { type: 'frame', key: 'canonical-substrate', tier: 'Tier 0', label: 'canonical substrate', title: 'Canonical substrate', src: 'canonical/theorem_zero_canonical_substrate_v1_0_final.html' }
];

let screens = [...frameScreens];
let activeScreen = 1;

function wrapIndex(index) {
  return ((index % screens.length) + screens.length) % screens.length;
}

function visualFamilyTitle(visualId) {
  const number = Number.parseInt(visualId.slice(1, 4), 10);
  if (number <= 9) return 'First-circle foundation';
  if (number <= 15) return 'Pair and relation family';
  if (number <= 19) return 'Triple catalogue family';
  if (number <= 22) return 'Right-angle and root-three family';
  if (number <= 40) return 'Pair, field, and transition family';
  if (number <= 71) return 'Ratio, similarity, and trigonometric family';
  if (number <= 91) return 'Coordinate and recurrence family';
  if (number <= 113) return 'Cell, area, and transformation family';
  if (number <= 143) return 'Reinspection lens family';
  if (number <= 191) return 'Circle and station-role reinspection family';
  if (number <= 238) return 'Selection, identity, and sameness family';
  if (number <= 274) return 'Recurrence and field-to-body family';
  if (number <= 321) return 'Assembly, decomposition, and recomposition family';
  return 'Closing synthesis family';
}

function visualLabel(visualId) {
  return visualId.replace(/^V(\d+)_/, 'V$1 · ').replaceAll('_', ' ');
}

function uniqueRegisteredIdsFromSource(sourceText) {
  const seen = new Set();
  const ids = [];
  for (const match of sourceText.matchAll(VISUAL_ID_PATTERN)) {
    const visualId = match[0];
    if (seen.has(visualId) || !hasSubstrateRenderer(visualId)) continue;
    seen.add(visualId);
    ids.push(visualId);
  }
  return ids;
}

async function registeredRendererIds() {
  const response = await fetch(RENDERER_SOURCE_URL, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Unable to load renderer registry: ${response.status}`);
  return uniqueRegisteredIdsFromSource(await response.text());
}

function buildRenderScreens(visualIds) {
  return visualIds.map((visualId) => ({
    type: 'render',
    key: visualId,
    tier: 'Rendered',
    label: visualLabel(visualId),
    title: visualFamilyTitle(visualId),
    visualId,
    renderId: visualId
  }));
}

function setLabel(screen, index) {
  if (position) position.textContent = `${screen.tier} · ${screen.label}`;
  if (familyLabel) {
    familyLabel.innerHTML = `<p class="family-tier">${screen.tier} · ${index + 1}/${screens.length}</p><h1>${screen.title}</h1>${screen.visualId ? `<p class="family-visual-id">${screen.visualId}</p>` : ''}`;
  }
}

function renderFamilyScreen(screen) {
  renderStage.replaceChildren();
  const renderId = screen.renderId ?? screen.visualId;
  if (!renderId || !hasSubstrateRenderer(renderId)) {
    const fallback = document.createElement('section');
    fallback.className = 'render-fallback';
    fallback.textContent = `${screen.visualId || screen.label} is not implemented yet.`;
    renderStage.appendChild(fallback);
    return;
  }
  const mount = document.createElement('div');
  mount.className = 'family-render-mount';
  mount.appendChild(renderSubstrateVisual(renderId));
  renderStage.appendChild(mount);
}

function activateScreen(index) {
  activeScreen = wrapIndex(index);
  const screen = screens[activeScreen];
  setLabel(screen, activeScreen);

  if (screen.type === 'frame') {
    frame.hidden = false;
    renderStage.hidden = true;
    renderStage.replaceChildren();
    if (frame.getAttribute('src') !== screen.src) frame.setAttribute('src', screen.src);
    return;
  }

  frame.hidden = true;
  renderStage.hidden = false;
  renderFamilyScreen(screen);
}

function step(delta) {
  activateScreen(activeScreen + delta);
}

function showRegistryError(error) {
  screens = [...frameScreens];
  activeScreen = 1;
  activateScreen(activeScreen);
  if (familyLabel) {
    familyLabel.innerHTML = `<p class="family-tier">Registry error</p><h1>Renderer sequence unavailable</h1><p class="family-visual-id">${error.message}</p>`;
  }
}

backButton?.addEventListener('click', () => step(-1));
forwardButton?.addEventListener('click', () => step(1));

window.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') step(-1);
  if (event.key === 'ArrowRight') step(1);
});

registeredRendererIds()
  .then((visualIds) => {
    screens = [...frameScreens, ...buildRenderScreens(visualIds)];
    activeScreen = Math.min(activeScreen, screens.length - 1);
    activateScreen(activeScreen);
  })
  .catch(showRegistryError);
