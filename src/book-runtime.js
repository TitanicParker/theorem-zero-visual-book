import { hasSubstrateRenderer, renderSubstrateVisual } from './substrate-renderers.js?v=20260605-r8';

const position = document.querySelector('#reader-position');
const backButton = document.querySelector('#reader-back');
const forwardButton = document.querySelector('#reader-forward');
const frame = document.querySelector('#canonical-substrate-frame');
const renderStage = document.querySelector('#family-render-stage');
const familyLabel = document.querySelector('#family-label');

const screens = [
  {
    type: 'canonical',
    key: 'canonical-substrate',
    tier: 'Tier 0',
    label: 'canonical substrate',
    title: 'Canonical substrate',
    description: 'The locked browser-native substrate is running.',
    src: 'canonical/theorem_zero_canonical_substrate_v1_0_final.html'
  },
  {
    type: 'render',
    key: 'first-circle-foundation-001',
    tier: 'Family 1',
    label: 'V001 first radius sweep',
    title: 'First-circle foundation',
    visualId: 'V001_first_radius_sweep',
    description: 'O fixes the opening and the first circle appears.'
  },
  {
    type: 'render',
    key: 'first-circle-foundation-002',
    tier: 'Family 1',
    label: 'V002 carried opening',
    title: 'First-circle foundation',
    visualId: 'V002_carried_opening_to_B',
    description: 'The preserved opening is carried from A to B.'
  },
  {
    type: 'render',
    key: 'first-circle-foundation-003',
    tier: 'Family 1',
    label: 'V003 equilateral OAB',
    title: 'First-circle foundation',
    visualId: 'V003_forced_equilateral_OAB',
    description: 'OA, OB, and AB force the first equilateral triangle.'
  },
  {
    type: 'render',
    key: 'first-circle-foundation-004',
    tier: 'Family 1',
    label: 'V004 boundary closure',
    title: 'First-circle foundation',
    visualId: 'V004_six_step_boundary_closure',
    description: 'Six equal steps close the first boundary.'
  },
  {
    type: 'render',
    key: 'first-circle-foundation-005',
    tier: 'Family 1',
    label: 'V005 seven-point residue',
    title: 'First-circle foundation',
    visualId: 'V005_release_curve_seven_point_residue',
    description: 'The curve can fade while O plus A-F remain.'
  },
  {
    type: 'render',
    key: 'first-circle-foundation-006',
    tier: 'Family 1',
    label: 'V006 radii and chords',
    title: 'First-circle foundation',
    visualId: 'V006_radii_chords_role_change',
    description: 'The same length changes role as radius and chord.'
  },
  {
    type: 'render',
    key: 'first-circle-foundation-007',
    tier: 'Family 1',
    label: 'V007 six-cell fan',
    title: 'First-circle foundation',
    visualId: 'V007_six_equilateral_fan',
    description: 'Six equilateral cells surround the centre.'
  },
  {
    type: 'render',
    key: 'first-circle-foundation-008',
    tier: 'Family 1',
    label: 'V008 diameters',
    title: 'First-circle foundation',
    visualId: 'V008_three_diameters_straight_angles',
    description: 'AD, BE, and CF form three diameter carriers through O.'
  },
  {
    type: 'render',
    key: 'first-circle-foundation-009',
    tier: 'Family 1',
    label: 'V009 primary carrier families',
    title: 'First-circle foundation',
    visualId: 'V009_primary_parallel_families',
    description: 'The first circle discloses the native direction families.'
  },
  {
    type: 'render',
    key: 'pair-relation-family-010',
    tier: 'Family 2',
    label: 'V010 local inventory',
    title: 'Pair and relation family',
    visualId: 'V010_local_inventory_plate',
    description: 'A summary plate for what the first circle has earned.'
  },
  {
    type: 'render',
    key: 'pair-relation-family-011',
    tier: 'Family 2',
    label: 'V011 unit pair classes',
    title: 'Pair and relation family',
    visualId: 'V011_pair_catalogue_unit_classes',
    description: 'The pair catalogue begins with radii and unit chords.'
  },
  {
    type: 'render',
    key: 'pair-relation-family-012',
    tier: 'Family 2',
    label: 'V012 length classes',
    title: 'Pair and relation family',
    visualId: 'V012_pair_catalogue_length_classes',
    description: 'Unit joins, next-neighbour chords, and diameters separate.'
  },
  {
    type: 'render',
    key: 'pair-relation-family-013',
    tier: 'Family 2',
    label: 'V013 segments vs carriers',
    title: 'Pair and relation family',
    visualId: 'V013_segments_vs_carriers',
    description: 'Finite segments collapse onto fewer straight carriers.'
  },
  {
    type: 'render',
    key: 'pair-relation-family-014',
    tier: 'Family 2',
    label: 'V014 direction and parallelism',
    title: 'Pair and relation family',
    visualId: 'V014_direction_vs_line_parallelism',
    description: 'Parallelism reads as preserved direction under offset.'
  },
  {
    type: 'render',
    key: 'pair-relation-family-015',
    tier: 'Family 2',
    label: 'V015 modes of sameness',
    title: 'Pair and relation family',
    visualId: 'V015_modes_of_sameness',
    description: 'Endpoint, length, carrier, direction, and role give different sameness readings.'
  }
];

let activeScreen = 0;

function wrapIndex(index) {
  return ((index % screens.length) + screens.length) % screens.length;
}

function setLabel(screen, index) {
  if (position) position.textContent = `${screen.tier} · ${screen.label}`;
  if (familyLabel) {
    familyLabel.innerHTML = `
      <p class="family-tier">${screen.tier} · ${index + 1}/${screens.length}</p>
      <h1>${screen.title}</h1>
      <p>${screen.description}</p>
      ${screen.visualId ? `<p class="family-visual-id">${screen.visualId}</p>` : ''}
    `;
  }
}

function renderFamilyScreen(screen) {
  renderStage.replaceChildren();
  if (!screen.visualId || !hasSubstrateRenderer(screen.visualId)) {
    const fallback = document.createElement('section');
    fallback.className = 'render-fallback';
    fallback.textContent = `${screen.visualId || screen.label} is not implemented yet.`;
    renderStage.appendChild(fallback);
    return;
  }
  const mount = document.createElement('div');
  mount.className = 'family-render-mount';
  mount.appendChild(renderSubstrateVisual(screen.visualId));
  renderStage.appendChild(mount);
}

function activateScreen(index) {
  activeScreen = wrapIndex(index);
  const screen = screens[activeScreen];
  setLabel(screen, activeScreen);

  if (screen.type === 'canonical') {
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

backButton?.addEventListener('click', () => step(-1));
forwardButton?.addEventListener('click', () => step(1));

window.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') step(-1);
  if (event.key === 'ArrowRight') step(1);
});

activateScreen(0);
