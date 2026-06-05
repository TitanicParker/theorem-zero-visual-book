import { hasSubstrateRenderer, renderSubstrateVisual } from './substrate-renderers.js?v=20260605-r10';

const position = document.querySelector('#reader-position');
const backButton = document.querySelector('#reader-back');
const forwardButton = document.querySelector('#reader-forward');
const frame = document.querySelector('#canonical-substrate-frame');
const renderStage = document.querySelector('#family-render-stage');
const familyLabel = document.querySelector('#family-label');

const RENDER_FAMILIES = [
  {
    tier: 'Family 1',
    title: 'First-circle foundation',
    ids: [
      'V001_first_radius_sweep',
      'V002_carried_opening_to_B',
      'V003_forced_equilateral_OAB',
      'V004_six_step_boundary_closure',
      'V005_release_curve_seven_point_residue',
      'V006_radii_chords_role_change',
      'V007_six_equilateral_fan',
      'V008_three_diameters_straight_angles',
      'V009_primary_parallel_families'
    ]
  },
  {
    tier: 'Family 2',
    title: 'Pair and relation family',
    ids: [
      'V010_local_inventory_plate',
      'V011_pair_catalogue_unit_classes',
      'V012_pair_catalogue_length_classes',
      'V013_segments_vs_carriers',
      'V014_direction_vs_line_parallelism',
      'V015_modes_of_sameness',
      'V027_pair_as_relation',
      'V030_role_count_closure_21',
      'V033_recurrent_direction_field_pressure',
      'V034_join_attribute_inspector',
      'V036_invariance_not_appearance'
    ]
  },
  {
    tier: 'Family 3',
    title: 'Triple catalogue family',
    ids: [
      'V016_triple_catalogue_degenerate_genuine',
      'V017_centre_boundary_triples',
      'V018_boundary_triangle_gap_catalogue',
      'V019_identity_vs_instance'
    ]
  },
  {
    tier: 'Family 4',
    title: 'Right-angle and root-three family',
    ids: [
      'V020_right_angle_root_three_lock',
      'V021_notice_vs_use_root_three',
      'V022_ratio_pattern_30_60_90'
    ]
  },
  {
    tier: 'Family 5',
    title: 'Coordinate pressure and synthesis family',
    ids: [
      'V023_native_coordinate_pressure',
      'V024_algebra_as_memory',
      'V025_relation_cascade_summary',
      'V026_field_disclosure_closing'
    ]
  }
];

const frameScreens = [
  {
    type: 'frame',
    key: 'arrow-centrality-navigator',
    tier: 'Toy',
    label: 'arrow centrality navigator',
    title: 'Arrow / Centrality Navigator',
    src: 'canonical/theorem-zero-arrow-centrality-navigator.html'
  },
  {
    type: 'frame',
    key: 'canonical-substrate',
    tier: 'Tier 0',
    label: 'canonical substrate',
    title: 'Canonical substrate',
    src: 'canonical/theorem_zero_canonical_substrate_v1_0_final.html'
  }
];

const renderScreens = RENDER_FAMILIES.flatMap((family) => family.ids.map((visualId) => ({
  type: 'render',
  key: visualId,
  tier: family.tier,
  label: visualId.replace(/^V(\d+)_/, 'V$1 · ').replaceAll('_', ' '),
  title: family.title,
  visualId
})));

const screens = [...frameScreens, ...renderScreens];
let activeScreen = 1;

function wrapIndex(index) {
  return ((index % screens.length) + screens.length) % screens.length;
}

function setLabel(screen, index) {
  if (position) position.textContent = `${screen.tier} · ${screen.label}`;
  if (familyLabel) {
    familyLabel.innerHTML = `
      <p class="family-tier">${screen.tier} · ${index + 1}/${screens.length}</p>
      <h1>${screen.title}</h1>
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

backButton?.addEventListener('click', () => step(-1));
forwardButton?.addEventListener('click', () => step(1));

window.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') step(-1);
  if (event.key === 'ArrowRight') step(1);
});

activateScreen(activeScreen);
