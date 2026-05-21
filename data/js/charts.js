/* ═══════════════════════════════════════════════
   charts.js — FIT2179 Data Visualisation 2
   Chart specs are loaded from vega-lite/*.json
   ═══════════════════════════════════════════════ */

/* ── Scroll reveal ── */
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.chart-block, .section__header')
  .forEach(el => observer.observe(el));

/* ── Vega-Lite embed helper ── */
const embedOpts = {
  actions: false,
  renderer: 'svg',
  theme: 'ggplot2'
};

async function loadChart(elementId, specPath) {
  try {
    const res  = await fetch(specPath);
    const spec = await res.json();
    await vegaEmbed(`#${elementId}`, spec, embedOpts);
  } catch (err) {
    console.warn(`Could not load chart: ${specPath}`, err);
  }
}

/* ── Load all charts ── */
loadChart('chart-donut',          'vega-lite/donut.json');
loadChart('chart-bar-year',       'vega-lite/bar_year.json');
loadChart('chart-stacked-decade', 'vega-lite/stacked_decade.json');
loadChart('chart-choropleth',     'vega-lite/choropleth.json');
loadChart('chart-point-map',      'vega-lite/point_map.json');
loadChart('chart-heatmap',        'vega-lite/heatmap.json');
loadChart('chart-fatalities',     'vega-lite/fatalities.json');
loadChart('chart-strip',          'vega-lite/strip.json');
loadChart('chart-damage',         'vega-lite/damage.json');
loadChart('chart-rank',           'vega-lite/rank.json');
loadChart('chart-deadliest',      'vega-lite/deadliest.json');
