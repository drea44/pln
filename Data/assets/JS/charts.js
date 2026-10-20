/**
 * assets/js/charts.js
 * Modul Konfigurasi Visualisasi Data Tren Pertumbuhan (Chart.js)
 * Tipografi: Modern Sans-Serif (Inter ala Helvetica)
 */

const ChartModule = (() => {
  let areaSpeciesChartInstance = null;
  let populationChartInstance = null;

  // Font Stack Sans-Serif Modern
  const chartFont = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

  const commonTooltip = {
    backgroundColor: '#0F2B1D',
    titleFont: { family: chartFont, size: 12, weight: '700' },
    bodyFont: { family: chartFont, size: 11 },
    padding: 10,
    cornerRadius: 6,
    displayColors: true,
    borderColor: '#23573D',
    borderWidth: 1
  };

  const init = (historicalData) => {
    if (!historicalData || !historicalData.length) {
      console.warn('ChartModule: Data historis tidak ditemukan.');
      return;
    }

    const labels = historicalData.map(d => d.year);
    const areaData = historicalData.map(d => d.area);
    const speciesData = historicalData.map(d => d.species);
    const floraData = historicalData.map(d => d.flora);
    const faunaData = historicalData.map(d => d.fauna);

    if (areaSpeciesChartInstance) areaSpeciesChartInstance.destroy();
    if (populationChartInstance) populationChartInstance.destroy();

    // 1. Grafik Area vs Spesies
    const ctxArea = document.getElementById('chartAreaSpecies')?.getContext('2d');
    if (ctxArea) {
      areaSpeciesChartInstance = new Chart(ctxArea, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Luas Area Konservasi (Ha)',
              data: areaData,
              borderColor: '#0F2B1D',
              backgroundColor: 'rgba(15, 43, 29, 0.08)',
              borderWidth: 2.5,
              tension: 0.35,
              fill: true,
              yAxisID: 'yArea',
              pointBackgroundColor: '#0F2B1D',
              pointRadius: 4,
              pointHoverRadius: 6
            },
            {
              label: 'Spesies Kunci (Sp)',
              data: speciesData,
              borderColor: '#A3583E',
              backgroundColor: 'transparent',
              borderWidth: 2,
              borderDash: [4, 4],
              tension: 0.35,
              yAxisID: 'ySpecies',
              pointBackgroundColor: '#A3583E',
              pointRadius: 4,
              pointHoverRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: commonTooltip
          },
          scales: {
            x: {
              grid: { color: '#EBE7DE', drawBorder: false },
              ticks: { font: { family: chartFont, size: 11 }, color: '#7B8881' }
            },
            yArea: {
              type: 'linear',
              position: 'left',
              title: { display: true, text: 'Hektare (Ha)', font: { size: 10, family: chartFont, weight: '600' }, color: '#0F2B1D' },
              grid: { color: '#EBE7DE', drawBorder: false },
              ticks: { font: { family: chartFont, size: 10 }, color: '#0F2B1D' }
            },
            ySpecies: {
              type: 'linear',
              position: 'right',
              title: { display: true, text: 'Spesies Terdata', font: { size: 10, family: chartFont, weight: '600' }, color: '#A3583E' },
              grid: { drawOnChartArea: false },
              ticks: { font: { family: chartFont, size: 10 }, color: '#A3583E', stepSize: 3 }
            }
          }
        }
      });
    }

    // 2. Grafik Populasi (Flora vs Fauna)
    const ctxPop = document.getElementById('chartPopulation')?.getContext('2d');
    if (ctxPop) {
      populationChartInstance = new Chart(ctxPop, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Flora Terawat (Batang)',
              data: floraData,
              borderColor: '#3D5A45',
              backgroundColor: 'rgba(61, 90, 69, 0.12)',
              borderWidth: 2,
              tension: 0.35,
              fill: true,
              pointBackgroundColor: '#3D5A45',
              pointRadius: 4
            },
            {
              label: 'Fauna Terpantau (Ekor)',
              data: faunaData,
              borderColor: '#0F2B1D',
              backgroundColor: 'rgba(15, 43, 29, 0.25)',
              borderWidth: 2.5,
              tension: 0.35,
              fill: true,
              pointBackgroundColor: '#0F2B1D',
              pointRadius: 4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: commonTooltip
          },
          scales: {
            x: {
              grid: { color: '#EBE7DE', drawBorder: false },
              ticks: { font: { family: chartFont, size: 11 }, color: '#7B8881' }
            },
            y: {
              grid: { color: '#EBE7DE', drawBorder: false },
              ticks: { font: { family: chartFont, size: 10 }, color: '#7B8881' }
            }
          }
        }
      });
    }
  };

  return { init };
})();