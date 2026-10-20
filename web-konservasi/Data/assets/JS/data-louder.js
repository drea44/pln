/**
 * assets/js/data-loader.js
 * Master Controller: Fetching data, DOM Hydration, Filter, Search, & Program Tabs
 * Tipografi: Clean Helvetica / Inter Classes
 */

const App = (() => {
  const state = {
    summary: null,
    programs: [],
    speciesCatalog: [],
    activeCategory: 'Semua',
    searchQuery: '',
    activeProgramId: 'matoara'
  };

  const fetchData = async () => {
    try {
      const response = await fetch('data/biodiversity.json');
      if (!response.ok) {
        throw new Error(`Gagal memuat dataset: HTTP ${response.status}`);
      }
      const data = await response.json();
      state.summary = data.summary;
      state.programs = data.programs;
      state.speciesCatalog = data.speciesCatalog;
      return true;
    } catch (error) {
      console.error('Data Loader Error:', error);
      showGlobalError();
      return false;
    }
  };

  const showGlobalError = () => {
    const grid = document.getElementById('species-grid');
    if (grid) {
      grid.innerHTML = `
        <div class="col-span-full py-12 text-center bg-white rounded-2xl border border-red-200 p-6">
          <p class="text-xs font-bold text-red-700 uppercase tracking-wider mb-1">Gagal Menghubungkan ke Sumber Data</p>
          <p class="text-xs text-charcoal-600">Pastikan file <code>data/biodiversity.json</code> dapat diakses oleh browser.</p>
        </div>
      `;
    }
  };

  const animateCountUp = (element, endValue, duration, isDecimal = false, thousandSeparator = false) => {
    if (!element) return;
    let startTimestamp = null;
    const startValue = 0;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (endValue - startValue) * ease;

      if (isDecimal) {
        element.innerText = currentValue.toFixed(2).replace('.', ',');
      } else if (thousandSeparator) {
        element.innerText = Math.floor(currentValue).toLocaleString('id-ID');
      } else {
        element.innerText = Math.floor(currentValue);
      }

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        element.innerText = isDecimal 
          ? endValue.toFixed(2).replace('.', ',')
          : thousandSeparator ? endValue.toLocaleString('id-ID') : endValue;
      }
    };
    window.requestAnimationFrame(step);
  };

  const initMetrics = () => {
    const cur = state.summary.current;
    const areaEl = document.getElementById('stat-area');
    const speciesEl = document.getElementById('stat-species');
    const popEl = document.getElementById('stat-population');
    const wrapper = document.getElementById('statCardsWrapper');

    const milestoneContainer = document.getElementById('milestoneGrid');
    if (milestoneContainer && state.summary.historical) {
      milestoneContainer.innerHTML = state.summary.historical.map((h, i) => `
        <div class="pt-2 sm:pt-0 ${i === state.summary.historical.length - 1 ? 'text-forest-900 font-semibold' : ''}">
          <span class="font-mono text-charcoal-500 text-[10px] block font-bold">${h.year} &bull; ${h.phase}</span>
          <span class="font-bold text-sm block">${h.area.toFixed(1).replace('.', ',')} Ha</span>
          <div class="text-[11px] text-charcoal-500">${h.species} Sp &bull; ${h.total.toLocaleString('id-ID')} Ind.</div>
        </div>
      `).join('');
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCountUp(areaEl, cur.totalArea, 1800, true, false);
          animateCountUp(speciesEl, cur.totalSpecies, 1500, false, false);
          animateCountUp(popEl, cur.totalPopulation, 2000, false, true);
          obs.disconnect();
        }
      });
    }, { threshold: 0.15 });

    if (wrapper) observer.observe(wrapper);
  };

  const renderProgram = (progId) => {
    state.activeProgramId = progId;
    const p = state.programs.find(item => item.id === progId);
    if (!p) return;

    document.querySelectorAll('.prog-pill').forEach(btn => {
      btn.classList.remove('active-pill', 'bg-forest-900', 'text-linen-50', 'shadow-xs');
      btn.classList.add('bg-linen-100', 'text-charcoal-700');
    });
    const activeBtn = document.getElementById(`btn-${progId}`);
    if (activeBtn) {
      activeBtn.classList.add('active-pill', 'bg-forest-900', 'text-linen-50', 'shadow-xs');
      activeBtn.classList.remove('bg-linen-100', 'text-charcoal-700');
    }

    const showcase = document.getElementById('programShowcase');
    if (!showcase) return;

    const speciesHtml = p.speciesList.map(s => `
      <div class="bg-white p-3.5 rounded-xl border border-linen-200 flex items-center justify-between">
        <div>
          <div class="font-bold text-xs text-forest-950">${s.name}</div>
          <div class="text-[11px] text-charcoal-500">${s.role}</div>
        </div>
        <span class="text-xs font-mono font-bold text-forest-900 bg-sage-100 px-3 py-1 rounded-md">
          ${s.count}
        </span>
      </div>
    `).join('');

    const highlightsHtml = p.highlights.map(h => `
      <li class="flex items-start gap-2.5 text-xs text-charcoal-700">
        <i data-lucide="check-circle-2" class="w-4 h-4 text-forest-700 shrink-0 mt-0.5"></i>
        <span>${h}</span>
      </li>
    `).join('');

    showcase.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div class="lg:col-span-7 space-y-4">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-xs font-bold text-forest-900 bg-sage-100 px-3 py-1 rounded-full font-mono">${p.area}</span>
            <span class="text-linen-300">&bull;</span>
            <span class="text-xs font-bold text-terracotta-700 bg-terracotta-100 px-3 py-1 rounded-full">Indeks Shannon H': ${p.shannonIndex}</span>
          </div>

          <div>
            <h3 class="text-2xl sm:text-3xl font-bold tracking-tight text-forest-950">${p.title} &mdash; <span class="font-medium text-charcoal-500 text-lg sm:text-xl">${p.subtitle}</span></h3>
            <p class="text-xs sm:text-sm text-charcoal-700 mt-2 leading-relaxed font-normal">${p.description}</p>
          </div>

          <div class="pt-2">
            <span class="text-xs font-bold uppercase text-charcoal-600 tracking-wider block mb-2">Fokus Capaian &amp; Tindakan Konservasi:</span>
            <ul class="space-y-2">
              ${highlightsHtml}
            </ul>
          </div>
        </div>

        <div class="lg:col-span-5 space-y-4">
          <div class="rounded-2xl overflow-hidden aspect-video border border-linen-200 shadow-sm relative group">
            <img src="${p.photo}" alt="${p.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy"/>
            <div class="absolute inset-0 bg-gradient-to-t from-forest-950/60 to-transparent"></div>
            <span class="absolute bottom-3 left-3 text-[10px] font-mono font-bold text-linen-50 bg-forest-950/70 px-2 py-0.5 rounded">
              Dokumentasi Kawasan
            </span>
          </div>

          <div class="space-y-2 max-h-56 overflow-y-auto pr-1">
            ${speciesHtml}
          </div>
        </div>
      </div>
    `;

    if (window.lucide) lucide.createIcons();
  };

  const initProgramTabs = () => {
    const container = document.getElementById('programsTabContainer');
    if (!container) return;

    container.innerHTML = state.programs.map((p, idx) => `
      <button 
        onclick="App.renderProgram('${p.id}')" 
        id="btn-${p.id}" 
        class="prog-pill ${idx === 0 ? 'active-pill bg-forest-900 text-linen-50 shadow-xs' : 'bg-linen-100 text-charcoal-700 hover:bg-linen-200'} px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2">
        <span>${idx + 1}. ${p.title} (${p.area})</span>
      </button>
    `).join('');

    renderProgram(state.programs[0]?.id || 'matoara');
  };

  const renderSpeciesGrid = () => {
    const grid = document.getElementById('species-grid');
    const emptyState = document.getElementById('emptyCatalog');
    if (!grid) return;

    const query = state.searchQuery.toLowerCase().trim();
    const category = state.activeCategory;

    const filtered = state.speciesCatalog.filter(sp => {
      const matchCat = (category === 'Semua') || (sp.taxa.toLowerCase() === category.toLowerCase());
      const matchQuery = sp.local.toLowerCase().includes(query) ||
                          sp.scientific.toLowerCase().includes(query) ||
                          sp.taxa.toLowerCase().includes(query) ||
                          sp.iucn.toLowerCase().includes(query) ||
                          sp.zones.toLowerCase().includes(query);
      return matchCat && matchQuery;
    });

    if (filtered.length === 0) {
      grid.innerHTML = '';
      if (emptyState) emptyState.classList.remove('hidden');
      return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    grid.innerHTML = filtered.map(sp => `
      <div 
        onclick="App.openModal('${sp.id}')" 
        class="group bg-white rounded-2xl border border-linen-200 overflow-hidden shadow-xs hover:shadow-md hover:border-forest-600 cursor-pointer transition-all duration-300 flex flex-col justify-between"
        tabindex="0"
        role="button"
        aria-label="Lihat detail ${sp.local}"
      >
        <div>
          <div class="relative aspect-[4/3] overflow-hidden bg-linen-100">
            <img src="${sp.img}" alt="${sp.local}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy"/>
            <div class="absolute inset-0 bg-gradient-to-t from-forest-950/70 via-transparent to-transparent"></div>
            
            <span class="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-xs text-forest-950 px-2 py-0.5 rounded shadow-xs">
              ${sp.taxa}
            </span>
            <span class="absolute top-3 right-3 text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${sp.iucnBadge}">
              ${sp.iucn}
            </span>

            <div class="absolute bottom-2.5 left-3 right-3 text-linen-50 flex items-baseline justify-between">
              <span class="text-xs font-semibold drop-shadow-sm truncate max-w-[65%]">${sp.zones}</span>
              <span class="text-xs font-mono font-bold bg-forest-900/80 px-2 py-0.5 rounded shrink-0">
                ${sp.count} ${sp.unit}
              </span>
            </div>
          </div>

          <div class="p-4">
            <h4 class="font-bold text-base text-forest-950 group-hover:text-forest-700 transition-colors">
              ${sp.local}
            </h4>
            <p class="italic text-xs text-charcoal-500 mt-0.5">
              ${sp.scientific}
            </p>
            <p class="text-[11px] text-charcoal-700 mt-2.5 line-clamp-2 leading-relaxed">
              ${sp.description}
            </p>
          </div>
        </div>

        <div class="px-4 py-3 bg-linen-50/80 border-t border-linen-100 flex items-center justify-between text-[11px] text-forest-900 font-semibold group-hover:bg-sage-50 transition-colors">
          <span>Peran Ekologis &rarr;</span>
          <span class="text-charcoal-500 font-normal font-mono text-[10px]">${sp.cites}</span>
        </div>
      </div>
    `).join('');
  };

  const openModal = (spId) => {
    const sp = state.speciesCatalog.find(s => s.id === spId);
    if (!sp) return;

    const modalBody = document.getElementById('modalBody');
    if (!modalBody) return;

    modalBody.innerHTML = `
      <div class="space-y-5">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-[10px] font-bold uppercase tracking-wider bg-forest-900 text-linen-50 px-2.5 py-0.5 rounded">
            ${sp.taxa}
          </span>
          <span class="text-xs font-mono font-bold px-2.5 py-0.5 rounded border ${sp.iucnBadge}">
            IUCN: ${sp.iucn} &bull; ${sp.iucnLabel}
          </span>
          <span class="text-xs font-mono font-bold bg-linen-100 text-charcoal-700 px-2.5 py-0.5 rounded border border-linen-200">
            ${sp.cites}
          </span>
        </div>

        <div class="flex flex-col sm:flex-row gap-5 items-start">
          <div class="w-full sm:w-44 h-44 rounded-2xl overflow-hidden shrink-0 border border-linen-200">
            <img src="${sp.img}" alt="${sp.local}" class="w-full h-full object-cover"/>
          </div>

          <div class="space-y-2">
            <h3 class="text-2xl sm:text-3xl font-bold tracking-tight text-forest-950 leading-tight">${sp.local}</h3>
            <p class="italic text-sm text-charcoal-600">${sp.scientific}</p>
            
            <div class="pt-2 text-xs text-charcoal-700 space-y-1">
              <div><strong>Populasi Terdata (2026):</strong> <span class="font-mono text-forest-900 font-bold">${sp.count} ${sp.unit}</span></div>
              <div><strong>Zona Konservasi:</strong> ${sp.zones}</div>
              <div><strong>Regulasi Permen LHK:</strong> <span class="text-forest-800 font-semibold">${sp.permen}</span></div>
            </div>
          </div>
        </div>

        <div class="p-4 rounded-xl bg-linen-100/70 border border-linen-200 space-y-1.5">
          <span class="text-xs font-bold uppercase tracking-wider text-forest-950 block">Peran Ekologis di Catchment Area:</span>
          <p class="text-xs text-charcoal-700 leading-relaxed">${sp.ecologicalRole}</p>
        </div>

        <div class="text-xs text-charcoal-600 leading-relaxed">
          <p>${sp.description}</p>
        </div>
      </div>
    `;

    const modal = document.getElementById('speciesModal');
    const modalCard = document.getElementById('modalCard');
    if (modal && modalCard) {
      modal.classList.remove('hidden');
      setTimeout(() => {
        modalCard.classList.remove('scale-95');
        modalCard.classList.add('scale-100');
      }, 10);
    }
  };

  const closeModal = () => {
    const modal = document.getElementById('speciesModal');
    const modalCard = document.getElementById('modalCard');
    if (modal && modalCard) {
      modalCard.classList.remove('scale-100');
      modalCard.classList.add('scale-95');
      setTimeout(() => {
        modal.classList.add('hidden');
      }, 150);
    }
  };

  const filterCategory = (category, btnElement) => {
    state.activeCategory = category;
    document.querySelectorAll('.filter-pill').forEach(btn => {
      btn.classList.remove('active-gal-pill', 'bg-white', 'text-forest-950', 'shadow-xs');
      btn.classList.add('text-charcoal-700');
    });
    if (btnElement) {
      btnElement.classList.add('active-gal-pill', 'bg-white', 'text-forest-950', 'shadow-xs');
      btnElement.classList.remove('text-charcoal-700');
    }
    renderSpeciesGrid();
  };

  const handleSearch = (event) => {
    state.searchQuery = event.target.value;
    renderSpeciesGrid();
  };

  const initScrollSpy = () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
      let current = '';
      const scrollPos = window.scrollY + 140;

      sections.forEach(sec => {
        const top = sec.offsetTop;
        const height = sec.offsetHeight;
        if (scrollPos >= top && scrollPos < top + height) {
          current = sec.getAttribute('id');
        }
      });

      navLinks.forEach(link => {
        link.classList.remove('text-forest-950', 'font-bold', 'border-forest-900');
        link.classList.add('border-transparent');
        if (link.getAttribute('data-section') === current) {
          link.classList.add('text-forest-950', 'font-bold', 'border-forest-900');
          link.classList.remove('border-transparent');
        }
      });
    });
  };

  const init = async () => {
    const loaded = await fetchData();
    if (!loaded) return;

    initMetrics();
    initProgramTabs();
    renderSpeciesGrid();
    initScrollSpy();

    if (typeof ChartModule !== 'undefined' && ChartModule.init) {
      ChartModule.init(state.summary.historical);
    }

    if (window.lucide) {
      lucide.createIcons();
    }

    window.addEventListener('click', (e) => {
      const modal = document.getElementById('speciesModal');
      if (e.target === modal) closeModal();
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });
  };

  return {
    init,
    renderProgram,
    openModal,
    closeModal,
    filterCategory,
    handleSearch
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});