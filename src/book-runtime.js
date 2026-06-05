const DATA_PATHS = {
  manuscript: 'data/manuscript.json',
  scenes: 'data/scenes.json',
  visualAssets: 'data/visual-assets.json',
  mapping: 'data/scene-visual-mapping.json',
  interstitial: 'data/interstitials/earned-catalogue-first-movement.json'
};

const app = document.querySelector('#app');
const template = document.querySelector('#scene-template');

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
  if (!response.ok) {
    throw new Error(`Could not load ${path}: ${response.status}`);
  }
  return response.json();
}

function flattenBlocks(manuscript) {
  const blocks = new Map();
  for (const part of manuscript.parts ?? []) {
    for (const chapter of part.chapters ?? []) {
      for (const block of chapter.blocks ?? []) {
        blocks.set(block.block_id, block);
      }
    }
  }
  return blocks;
}

function indexAssets(visualAssets) {
  return new Map((visualAssets.assets ?? []).map((asset) => [asset.visual_id, asset]));
}

function buildSummary(manuscript, scenes, mapping) {
  const counts = mapping.counts ?? {};
  return `
    <section class="summary-card">
      <h2>Mapped runtime source</h2>
      <p class="lede">This preview renders manuscript blocks through the mapped scene manifest. It does not mutate the locked canonical substrate.</p>
      <div class="summary-grid">
        <div class="metric"><strong>${manuscript.counts?.chapters ?? 0}</strong><span>chapters</span></div>
        <div class="metric"><strong>${scenes.scenes?.length ?? 0}</strong><span>scenes</span></div>
        <div class="metric"><strong>${counts.mapped_high_confidence ?? 0}</strong><span>high-confidence mappings</span></div>
        <div class="metric"><strong>${counts.mapped_medium_confidence ?? 0}</strong><span>medium-confidence mappings</span></div>
        <div class="metric"><strong>${counts.unmapped ?? 0}</strong><span>unmapped scenes</span></div>
        <div class="metric"><strong>${counts.registry_occurrence_rows_used ?? 0}</strong><span>visual rows used</span></div>
      </div>
    </section>
    <section class="summary-card toolbar" aria-label="Scene filters">
      <input id="scene-search" type="search" placeholder="Search scenes, Visual IDs, or manuscript text" />
      <button type="button" data-filter="all">All</button>
      <button type="button" data-filter="unmapped">Unmapped</button>
      <button type="button" data-filter="mapped_medium_confidence">Medium confidence</button>
      <button type="button" data-filter="special_scene">Ledger</button>
    </section>
  `;
}

function buildChapterNav(chapters) {
  return `
    <nav class="chapter-nav" aria-label="Chapter navigation">
      ${chapters.map((chapter) => `<a href="#chapter-${chapter.chapter_number}">C${chapter.chapter_number}</a>`).join('')}
    </nav>
  `;
}

function sceneStatusClass(status) {
  if (status === 'mapped_high_confidence') return 'ok';
  if (status === 'unmapped' || status === 'manual_review') return 'warn';
  return '';
}

function blockTextHtml(block, scene) {
  const text = escapeHtml(block?.text ?? scene.source_block_id ?? '');
  if (scene.scene_type === 'equation_block') return `<pre class="equation-block">${text}</pre>`;
  if (scene.scene_type === 'transition' || scene.scene_type === 'aphorism') return `<div class="inline-block">${text}</div>`;
  return `<p>${text}</p>`;
}

function renderLedger(interstitial) {
  const columns = interstitial.columns ?? [];
  const rows = interstitial.rows ?? [];
  return `
    <section class="chapter-section" id="earned-catalogue">
      <header>
        <div>
          <p class="scene-kicker">Interstitial ledger</p>
          <h2>${escapeHtml(interstitial.title)}</h2>
        </div>
        <span class="badge ok">special_scene</span>
      </header>
      <div class="ledger-table">
        <table>
          <thead><tr>${columns.map((column) => `<th>${escapeHtml(column.replaceAll('_', ' '))}</th>`).join('')}</tr></thead>
          <tbody>
            ${rows.map((row) => `<tr>${columns.map((column) => `<td>${escapeHtml(row[column])}</td>`).join('')}</tr>`).join('')}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderVisualPanel(scene, asset) {
  const status = scene.visual_mapping_status ?? 'unknown';
  if (!asset) {
    return `
      <p class="visual-kicker">${escapeHtml(scene.scene_type)}</p>
      <h3>${escapeHtml(status)}</h3>
      <div class="badge-row">
        <span class="badge ${sceneStatusClass(status)}">${escapeHtml(status)}</span>
        ${scene.attached_to_scene_id ? `<span class="badge">attached to ${escapeHtml(scene.attached_to_scene_id)}</span>` : ''}
      </div>
      <p>${escapeHtml(scene.notes ?? 'No Visual ID assigned.')}</p>
    `;
  }

  return `
    <p class="visual-kicker">Visual asset</p>
    <h3 class="visual-id">${escapeHtml(asset.visual_id)}</h3>
    <div class="badge-row">
      <span class="badge ${sceneStatusClass(status)}">${escapeHtml(status)}</span>
      <span class="badge">global ${escapeHtml(scene.visual_occurrence_global_no)}</span>
      <span class="badge">${escapeHtml(asset.build_tier)}</span>
    </div>
    <p>${escapeHtml(asset.canonical_summary)}</p>
    <ul class="variant-list">
      <li><strong>Activation:</strong> ${escapeHtml(asset.activation_variants?.[0] ?? '')}</li>
      <li><strong>Overlay:</strong> ${escapeHtml(asset.overlay_variants?.[0] ?? '')}</li>
      <li><strong>Rendering:</strong> ${escapeHtml(asset.rendering_variants?.[0] ?? '')}</li>
    </ul>
  `;
}

function renderScene(scene, block, asset) {
  const node = template.content.firstElementChild.cloneNode(true);
  node.dataset.status = scene.visual_mapping_status ?? '';
  node.dataset.visualId = scene.visual_id ?? '';
  node.dataset.text = `${block?.text ?? ''} ${scene.visual_id ?? ''} ${scene.source_block_id ?? ''}`.toLowerCase();

  node.querySelector('.scene-main').innerHTML = `
    <p class="scene-kicker">${escapeHtml(scene.source_block_id)} / ${escapeHtml(scene.scene_type)}</p>
    <h3 class="scene-title">${escapeHtml(block?.chapter_title ?? scene.scene_id)}</h3>
    ${blockTextHtml(block, scene)}
  `;
  node.querySelector('.visual-panel').innerHTML = renderVisualPanel(scene, asset);
  return node;
}

function chapterRecords(manuscript) {
  return (manuscript.parts ?? []).flatMap((part) =>
    (part.chapters ?? []).map((chapter) => ({ ...chapter, part_title: part.title }))
  );
}

function installFilters() {
  const search = document.querySelector('#scene-search');
  const buttons = [...document.querySelectorAll('[data-filter]')];
  let filter = 'all';

  function apply() {
    const query = (search?.value ?? '').trim().toLowerCase();
    for (const card of document.querySelectorAll('.scene-card')) {
      const matchesQuery = !query || card.dataset.text.includes(query);
      const matchesFilter = filter === 'all' || card.dataset.status === filter;
      card.classList.toggle('hidden', !(matchesQuery && matchesFilter));
    }
  }

  search?.addEventListener('input', apply);
  for (const button of buttons) {
    button.addEventListener('click', () => {
      filter = button.dataset.filter;
      apply();
    });
  }
}

function renderBook(data) {
  const { manuscript, scenes, visualAssets, mapping, interstitial } = data;
  const blocks = flattenBlocks(manuscript);
  const assets = indexAssets(visualAssets);
  const chapters = chapterRecords(manuscript);
  const scenesByChapter = new Map();

  for (const scene of scenes.scenes ?? []) {
    if (scene.scene_type === 'ledger_table') continue;
    const block = blocks.get(scene.source_block_id);
    const key = block?.chapter_number ?? 'unknown';
    if (!scenesByChapter.has(key)) scenesByChapter.set(key, []);
    scenesByChapter.get(key).push(scene);
  }

  app.innerHTML = buildSummary(manuscript, scenes, mapping) + buildChapterNav(chapters);

  for (const chapter of chapters) {
    const section = document.createElement('section');
    section.className = 'chapter-section';
    section.id = `chapter-${chapter.chapter_number}`;
    section.innerHTML = `
      <header>
        <div>
          <p class="scene-kicker">${escapeHtml(chapter.part_title)}</p>
          <h2>${escapeHtml(chapter.title)}</h2>
        </div>
        <span class="badge">${(scenesByChapter.get(chapter.chapter_number) ?? []).length} scenes</span>
      </header>
    `;

    for (const scene of scenesByChapter.get(chapter.chapter_number) ?? []) {
      const block = blocks.get(scene.source_block_id);
      const asset = scene.visual_id ? assets.get(scene.visual_id) : null;
      section.appendChild(renderScene(scene, block, asset));
    }

    app.appendChild(section);

    if (chapter.chapter_number === 10) {
      app.insertAdjacentHTML('beforeend', renderLedger(interstitial));
    }
  }

  installFilters();
}

async function main() {
  try {
    const [manuscript, scenes, visualAssets, mapping, interstitial] = await Promise.all([
      loadJson(DATA_PATHS.manuscript),
      loadJson(DATA_PATHS.scenes),
      loadJson(DATA_PATHS.visualAssets),
      loadJson(DATA_PATHS.mapping),
      loadJson(DATA_PATHS.interstitial)
    ]);
    renderBook({ manuscript, scenes, visualAssets, mapping, interstitial });
  } catch (error) {
    app.innerHTML = `
      <section class="error-card">
        <h2>Runtime load failed</h2>
        <p>${escapeHtml(error.message)}</p>
      </section>
    `;
    console.error(error);
  }
}

main();
