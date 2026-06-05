import { hasSubstrateRenderer, renderSubstrateVisual } from './substrate-renderers.js?v=20260605-r11';

const position = document.querySelector('#reader-position');
const backButton = document.querySelector('#reader-back');
const forwardButton = document.querySelector('#reader-forward');
const frame = document.querySelector('#canonical-substrate-frame');
const renderStage = document.querySelector('#family-render-stage');
const familyLabel = document.querySelector('#family-label');

const VISUAL_ALIASES = {
  V086_hexagonal_number_count: 'V023_native_coordinate_pressure',
  V087_shell_route_distance_distinction: 'V077_route_vs_straight_distance',
  V089_exact_not_equal_angle: 'V033_recurrent_direction_field_pressure',
  V090_four_field_search_modes: 'V034_join_attribute_inspector',
  V091_portable_relation_seed_catalogue: 'V025_relation_cascade_summary',
  V092_recurrence_to_cells_transition: 'V007_six_equilateral_fan',
  V093_cells_enter_field: 'V007_six_equilateral_fan',
  V094_unit_equilateral_area_cell: 'V003_forced_equilateral_OAB',
  V095_unit_cell_area_derivation: 'V020_right_angle_root_three_lock',
  V100_piece_accounting_area_proof: 'V007_six_equilateral_fan',
  V101_area_to_transformation_transition: 'V036_invariance_not_appearance',
  V102_first_invariant_governed_change: 'V036_invariance_not_appearance',
  V103_transformation_grammar_overview: 'V036_invariance_not_appearance',
  V104_sixth_turn_rotation: 'V007_six_equilateral_fan',
  V105_reflection_across_AD: 'V014_direction_vs_line_parallelism',
  V106_translation_across_field: 'V023_native_coordinate_pressure',
  V130_station_role_wheel: 'V015_modes_of_sameness',
  V131_selection_activates_relation: 'V019_identity_vs_instance',
  V132_triangle_catalogue_as_identity_lens: 'V018_boundary_triangle_gap_catalogue',
  V133_field_as_recurrence_place: 'V025_relation_cascade_summary',
  V135_invariant_as_lens: 'V036_invariance_not_appearance',
  V136_fixed_opening_engine: 'V006_radii_chords_role_change',
  V137_practical_rule_fixed_opening: 'V006_radii_chords_role_change',
  V139_radius_to_chord_portability: 'V006_radii_chords_role_change',
  V143_four_roles_one_length: 'V015_modes_of_sameness',
  V165_circle_as_diameter_carrier: 'V008_three_diameters_straight_angles',
  V168_instance_vs_family_on_circle: 'V020_right_angle_root_three_lock',
  V169_circle_symmetry_display: 'V007_six_equilateral_fan',
  V170_circle_as_local_origin: 'V023_native_coordinate_pressure',
  V171_circle_vs_field_distinction: 'V023_native_coordinate_pressure',
  V173_circle_reading_dependency_chain: 'V025_relation_cascade_summary',
  V174_same_curve_many_lenses: 'V025_relation_cascade_summary',
  V175_circle_to_station_roles_transition: 'V015_modes_of_sameness',
  V176_station_label_vs_role: 'V015_modes_of_sameness',
  V178_station_as_radius_endpoint: 'V006_radii_chords_role_change',
  V181_neighbour_role_unit_chords_cells: 'V007_six_equilateral_fan',
  V182_opposite_role_diameters: 'V020_right_angle_root_three_lock',
  V183_station_as_selection_participant: 'V034_join_attribute_inspector',
  V186_station_coordinate_memory_role: 'V075_native_basis_uv',
  V188_station_role_catalogue: 'V015_modes_of_sameness',
  V189_A_role_timeline: 'V015_modes_of_sameness',
  V190_identity_survives_use: 'V036_invariance_not_appearance',
  V191_station_roles_to_selection_transition: 'V034_join_attribute_inspector',
  V193_available_vs_active_relation: 'V034_join_attribute_inspector',
  V194_pair_selection_role_switch: 'V034_join_attribute_inspector',
  V197_selected_triple_family_examples: 'V018_boundary_triangle_gap_catalogue',
  V200_transformation_identity_survival: 'V036_invariance_not_appearance',
  V201_difference_then_invariant: 'V036_invariance_not_appearance',
  V202_field_selection_opportunities: 'V023_native_coordinate_pressure',
  V203_selection_not_proof_warning: 'V034_join_attribute_inspector',
  V204_select_inspect_classify_lock_reinspect: 'V025_relation_cascade_summary',
  V216_scaling_separates_identity_readings: 'V036_invariance_not_appearance',
  V217_same_requires_reading: 'V036_invariance_not_appearance',
  V218_identity_readings_on_residue: 'V015_modes_of_sameness',
  V220_identity_recurrence_in_field: 'V023_native_coordinate_pressure',
  V221_instance_identity_definition_plate: 'V019_identity_vs_instance',
  V222_what_kind_of_same_transition: 'V015_modes_of_sameness',
  V223_same_length_different_role_opening: 'V006_radii_chords_role_change',
  V224_same_length_inspector: 'V006_radii_chords_role_change',
  V226_same_direction_parallelism: 'V014_direction_vs_line_parallelism',
  V227_same_angle_pattern: 'V020_right_angle_root_three_lock',
  V233_resemblance_vs_invariant: 'V036_invariance_not_appearance',
  V275_identity_assembly_into_bodies: 'V025_relation_cascade_summary',
  V276_lawful_assembly_not_arbitrary_drawing: 'V034_join_attribute_inspector',
  V277_first_hexagon_as_assembled_body: 'V007_six_equilateral_fan',
  V278_two_cell_rhombus_assembly: 'V007_six_equilateral_fan',
  V279_boundary_vs_cell_reading: 'V007_six_equilateral_fan',
  V280_body_sameness_invariants: 'V036_invariance_not_appearance',
  V281_lawful_cuts_decomposition: 'V034_join_attribute_inspector',
  V282_accountable_decomposition: 'V007_six_equilateral_fan',
  V284_assembly_to_recomposition_chain: 'V025_relation_cascade_summary',
  V296_larger_triangle_decomposition_options: 'V018_boundary_triangle_gap_catalogue',
  V297_decomposition_disciplined: 'V034_join_attribute_inspector',
  V298_lawful_vs_arbitrary_cutting: 'V034_join_attribute_inspector',
  V299_cut_availability_rule: 'V034_join_attribute_inspector',
  V301_cut_changes_reading_not_surface: 'V007_six_equilateral_fan',
  V302_piece_account_checklist: 'V025_relation_cascade_summary',
  V303_diagram_vs_piece_accounting: 'V036_invariance_not_appearance',
  V304_cell_grammar_of_parts: 'V007_six_equilateral_fan',
  V305_right_triangle_as_half_cell: 'V020_right_angle_root_three_lock',
  V306_distinct_routes_warning: 'V034_join_attribute_inspector'
};

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
      'V019_identity_vs_instance',
      'V042_triple_count_lock_35_3_32',
      'V045_boundary_gap_family_examples',
      'V046_boundary_catalogue_count_lock',
      'V047_full_triple_catalogue_summary',
      'V048_triples_generate_angle_families',
      'V049_angle_from_triple_forcing'
    ]
  },
  {
    tier: 'Family 4',
    title: 'Right-angle and root-three family',
    ids: [
      'V020_right_angle_root_three_lock',
      'V021_notice_vs_use_root_three',
      'V022_ratio_pattern_30_60_90',
      'V050_right_angle_family_pending',
      'V052_triple_catalogue_to_right_angle_transition',
      'V053_BFE_proof_setup',
      'V054_diameter_forces_right_angle',
      'V069_trig_names_from_ratios',
      'V070_BFE_trig_values',
      'V071_trig_dependency_chain'
    ]
  },
  {
    tier: 'Family 5',
    title: 'Coordinate pressure and synthesis family',
    ids: [
      'V023_native_coordinate_pressure',
      'V024_algebra_as_memory',
      'V025_relation_cascade_summary',
      'V026_field_disclosure_closing',
      'V072_unit_radius_projection_reading',
      'V073_ratio_to_coordinate_transition',
      'V075_native_basis_uv',
      'V076_negative_native_steps',
      'V077_route_vs_straight_distance',
      'V078_native_distance_derivation'
    ]
  },
  {
    tier: 'Family 6',
    title: 'Ring and recurrence family',
    ids: [
      'V086_hexagonal_number_count',
      'V087_shell_route_distance_distinction',
      'V089_exact_not_equal_angle',
      'V090_four_field_search_modes',
      'V091_portable_relation_seed_catalogue',
      'V092_recurrence_to_cells_transition'
    ]
  },
  {
    tier: 'Family 7',
    title: 'Cell and area family',
    ids: [
      'V093_cells_enter_field',
      'V094_unit_equilateral_area_cell',
      'V095_unit_cell_area_derivation',
      'V100_piece_accounting_area_proof',
      'V101_area_to_transformation_transition'
    ]
  },
  {
    tier: 'Family 8',
    title: 'Transformation and invariant family',
    ids: [
      'V102_first_invariant_governed_change',
      'V103_transformation_grammar_overview',
      'V104_sixth_turn_rotation',
      'V105_reflection_across_AD',
      'V106_translation_across_field'
    ]
  },
  {
    tier: 'Family 9',
    title: 'Reinspection lens family',
    ids: [
      'V130_station_role_wheel',
      'V131_selection_activates_relation',
      'V132_triangle_catalogue_as_identity_lens',
      'V133_field_as_recurrence_place',
      'V135_invariant_as_lens',
      'V136_fixed_opening_engine',
      'V137_practical_rule_fixed_opening',
      'V139_radius_to_chord_portability',
      'V143_four_roles_one_length'
    ]
  },
  {
    tier: 'Family 10',
    title: 'Circle reinspection family',
    ids: [
      'V165_circle_as_diameter_carrier',
      'V168_instance_vs_family_on_circle',
      'V169_circle_symmetry_display',
      'V170_circle_as_local_origin',
      'V171_circle_vs_field_distinction',
      'V173_circle_reading_dependency_chain',
      'V174_same_curve_many_lenses',
      'V175_circle_to_station_roles_transition'
    ]
  },
  {
    tier: 'Family 11',
    title: 'Station role family',
    ids: [
      'V176_station_label_vs_role',
      'V178_station_as_radius_endpoint',
      'V181_neighbour_role_unit_chords_cells',
      'V182_opposite_role_diameters',
      'V183_station_as_selection_participant',
      'V186_station_coordinate_memory_role',
      'V188_station_role_catalogue',
      'V189_A_role_timeline',
      'V190_identity_survives_use',
      'V191_station_roles_to_selection_transition'
    ]
  },
  {
    tier: 'Family 12',
    title: 'Selection activation family',
    ids: [
      'V193_available_vs_active_relation',
      'V194_pair_selection_role_switch',
      'V197_selected_triple_family_examples',
      'V200_transformation_identity_survival',
      'V201_difference_then_invariant',
      'V202_field_selection_opportunities',
      'V203_selection_not_proof_warning',
      'V204_select_inspect_classify_lock_reinspect'
    ]
  },
  {
    tier: 'Family 13',
    title: 'Identity and sameness placeholder family',
    ids: [
      'V216_scaling_separates_identity_readings',
      'V217_same_requires_reading',
      'V218_identity_readings_on_residue',
      'V220_identity_recurrence_in_field',
      'V221_instance_identity_definition_plate',
      'V222_what_kind_of_same_transition',
      'V223_same_length_different_role_opening',
      'V224_same_length_inspector',
      'V226_same_direction_parallelism',
      'V227_same_angle_pattern',
      'V233_resemblance_vs_invariant'
    ]
  },
  {
    tier: 'Family 14',
    title: 'Body assembly placeholder family',
    ids: [
      'V275_identity_assembly_into_bodies',
      'V276_lawful_assembly_not_arbitrary_drawing',
      'V277_first_hexagon_as_assembled_body',
      'V278_two_cell_rhombus_assembly',
      'V279_boundary_vs_cell_reading',
      'V280_body_sameness_invariants',
      'V281_lawful_cuts_decomposition',
      'V282_accountable_decomposition',
      'V284_assembly_to_recomposition_chain'
    ]
  },
  {
    tier: 'Family 15',
    title: 'Decomposition and piece-accounting placeholder family',
    ids: [
      'V296_larger_triangle_decomposition_options',
      'V297_decomposition_disciplined',
      'V298_lawful_vs_arbitrary_cutting',
      'V299_cut_availability_rule',
      'V301_cut_changes_reading_not_surface',
      'V302_piece_account_checklist',
      'V303_diagram_vs_piece_accounting',
      'V304_cell_grammar_of_parts',
      'V305_right_triangle_as_half_cell',
      'V306_distinct_routes_warning'
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
  visualId,
  renderId: VISUAL_ALIASES[visualId] ?? visualId
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

backButton?.addEventListener('click', () => step(-1));
forwardButton?.addEventListener('click', () => step(1));

window.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') step(-1);
  if (event.key === 'ArrowRight') step(1);
});

activateScreen(activeScreen);
