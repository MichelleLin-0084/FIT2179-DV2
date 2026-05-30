/* ═══════════════════════════════════════════════
   charts.js — FIT2179 Data Visualisation 2
   ═══════════════════════════════════════════════ */

/* ── Charts that need a measured pixel width injected at runtime.
   Covers map specs and vconcat specs — both fail with width:"container" ── */
const PIXEL_WIDTH_CHARTS = new Set([
  'chart-choropleth',
  'chart-point-map',
  'chart-stacked-decade',
  'chart-damage'
]);

/* ── Recursively patch width on every child view in a vconcat/hconcat spec.
   Rules:
     - vconcat/hconcat: recurse into children, remove top-level width
     - layered view (has "layer"): set width at this level, stop recursing
     - single view (has "mark"):   set width at this level                   ── */
function patchWidth(spec, w) {
  delete spec.autosize;
  if (spec.vconcat) {
    delete spec.width;
    spec.vconcat.forEach(function(v) { patchWidth(v, w); });
  } else if (spec.hconcat) {
    delete spec.width;
    spec.hconcat.forEach(function(v) { patchWidth(v, w); });
  } else {
    /* Single view OR layered view — set width here, do not go deeper */
    spec.width = w;
  }
}

/* ── Embed helper ── */
async function loadChart(elementId, specPath) {
  try {
    const containerEl = document.getElementById(elementId);
    if (!containerEl) return;

    const res = await fetch(specPath);
    if (!res.ok) {
      console.warn('Failed to fetch', specPath, res.status);
      return;
    }
    const spec = await res.json();

    /* Clear any previous embed to avoid duplicate signal registration */
    containerEl.innerHTML = '';

    const opts = { actions: false, renderer: 'svg' };

    if (PIXEL_WIDTH_CHARTS.has(elementId)) {
      const w = Math.max(Math.floor(containerEl.getBoundingClientRect().width) - 56, 300);
      patchWidth(spec, w);
      opts.width = w;
    } else {
      opts.width = 'container';
    }

    await vegaEmbed('#' + elementId, spec, opts);
  } catch (err) {
    console.error('loadChart error for', elementId, ':', err);
  }
}

/* ── Chart registry ── */
const CHARTS = [
  { id: 'chart-donut',          path: 'vega-lite/donut.json'          },
  { id: 'chart-bar-year',       path: 'vega-lite/bar_year.json'       },
  { id: 'chart-stacked-decade', path: 'vega-lite/stacked_decade.json' },
  { id: 'chart-choropleth',     path: 'vega-lite/choropleth.json'     },
  { id: 'chart-point-map',      path: 'vega-lite/point_map.json'      },
  { id: 'chart-heatmap',        path: 'vega-lite/heatmap.json'        },
  { id: 'chart-fatalities',     path: 'vega-lite/fatalities.json'     },
  { id: 'chart-strip',          path: 'vega-lite/strip.json'          },
  { id: 'chart-damage',         path: 'vega-lite/damage.json'         },
  { id: 'chart-rank',           path: 'vega-lite/rank.json'           },
  { id: 'chart-deadliest',      path: 'vega-lite/deadliest.json'      },
];

/* ── Scroll reveal + lazy chart loading ──
   Charts render only once their .chart-block is intersecting,
   ensuring getBoundingClientRect() returns a real painted width.  ── */
const loadedCharts = new Set();

const observer = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry, i) {
    if (!entry.isIntersecting) return;

    const block = entry.target;
    setTimeout(function() { block.classList.add('visible'); }, i * 80);

    block.querySelectorAll('.chart-container[id]').forEach(function(chartEl) {
      const chartId = chartEl.id;
      if (loadedCharts.has(chartId)) return;

      const job = CHARTS.find(function(c) { return c.id === chartId; });
      if (!job) return;

      loadedCharts.add(chartId);  /* mark immediately — before the timeout */
      setTimeout(function() { loadChart(job.id, job.path); }, 200);
    });

    observer.unobserve(block);
  });
}, { threshold: 0.05 });

document.querySelectorAll('.section__header').forEach(function(el) {
  const ho = new IntersectionObserver(function(entries) {
    entries.forEach(function(e, i) {
      if (e.isIntersecting) {
        setTimeout(function() { e.target.classList.add('visible'); }, i * 80);
        ho.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  ho.observe(el);
});

document.querySelectorAll('.chart-block').forEach(function(el) {
  observer.observe(el);
});
