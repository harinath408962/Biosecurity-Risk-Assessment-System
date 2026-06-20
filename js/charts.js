/* charts.js */

class BiosecurityCharts {
  constructor() {
    this.distributionChartInstance = null;
    this.trendChartInstance = null;
  }

  /**
   * Updates the SVG Risk Score Gauge
   * @param {number} score - The risk score percentage (0-100)
   * @param {string} level - Risk level ('Low', 'Medium', 'High')
   * @param {string} containerId - Target container ID
   */
  updateSvgGauge(score, level, containerId = 'results-gauge-container') {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Reset gauge content
    container.innerHTML = '';

    // Choose color based on level
    let strokeColor = 'var(--risk-low)';
    if (level === 'Medium') strokeColor = 'var(--risk-medium)';
    if (level === 'High') strokeColor = 'var(--risk-high)';

    // Circular calculations
    const radius = 50;
    const circumference = 2 * Math.PI * radius; // ~314.16
    const offset = circumference - (score / 100) * circumference;

    const svgHTML = `
      <div class="gauge-svg-container">
        <svg class="gauge-svg" viewBox="0 0 120 120">
          <circle class="gauge-bg" cx="60" cy="60" r="${radius}"></circle>
          <circle class="gauge-fill" cx="60" cy="60" r="${radius}" 
            stroke="${strokeColor}" 
            style="stroke-dasharray: ${circumference}; stroke-dashoffset: ${circumference};">
          </circle>
        </svg>
        <div class="gauge-text">
          <span>${score}%</span>
          <span class="gauge-text-pct">Risk</span>
        </div>
      </div>
    `;

    container.innerHTML = svgHTML;

    // Trigger animation in next frame
    requestAnimationFrame(() => {
      const fillCircle = container.querySelector('.gauge-fill');
      if (fillCircle) {
        fillCircle.style.strokeDashoffset = offset;
      }
    });
  }

  /**
   * Initializes or updates dashboard analytics charts using Chart.js
   * @param {Array<object>} history - The history of biosecurity assessments
   */
  initDashboardCharts(history) {
    this._renderDistributionChart(history);
    this._renderTrendChart(history);
  }

  /**
   * Renders risk distribution pie/doughnut chart
   * @private
   */
  _renderDistributionChart(history) {
    const canvas = document.getElementById('distribution-chart');
    if (!canvas) return;

    // Count categories
    let lowCount = 0;
    let medCount = 0;
    let highCount = 0;

    history.forEach(run => {
      if (run.riskLevel === 'Low') lowCount++;
      if (run.riskLevel === 'Medium') medCount++;
      if (run.riskLevel === 'High') highCount++;
    });

    // Fallback if no history
    if (history.length === 0) {
      lowCount = 1; // Show dummy values for visual state if empty
      medCount = 0;
      highCount = 0;
    }

    const chartData = {
      labels: ['Low Risk', 'Medium Risk', 'High Risk'],
      datasets: [{
        data: [lowCount, medCount, highCount],
        backgroundColor: [
          getComputedStyle(document.documentElement).getPropertyValue('--risk-low').trim() || '#10b981',
          getComputedStyle(document.documentElement).getPropertyValue('--risk-medium').trim() || '#f59e0b',
          getComputedStyle(document.documentElement).getPropertyValue('--risk-high').trim() || '#f43f5e'
        ],
        borderWidth: 1,
        borderColor: getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim() || '#202b44',
        hoverOffset: 4
      }]
    };

    // Destroy existing instance to prevent hover bugs
    if (this.distributionChartInstance) {
      this.distributionChartInstance.destroy();
    }

    if (window.Chart) {
      const existingFallback = canvas.parentElement.querySelector('.chart-fallback');
      if (existingFallback) {
        existingFallback.remove();
      }
      canvas.style.display = 'block';

      this.distributionChartInstance = new window.Chart(canvas, {
        type: 'doughnut',
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim(),
                font: { family: 'Inter', size: 11 }
              }
            }
          },
          cutout: '70%'
        }
      });
    } else {
      canvas.style.display = 'none';
      let fallback = canvas.parentElement.querySelector('.chart-fallback');
      if (!fallback) {
        fallback = document.createElement('div');
        fallback.className = 'chart-fallback';
        fallback.style.width = '100%';
        canvas.parentElement.appendChild(fallback);
      }
      fallback.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:0.5rem; width:100%; text-align:center;">
          <div style="font-size:0.9rem; font-weight:600; color:var(--text-secondary);">Risk Distribution Count</div>
          <div style="display:flex; justify-content:space-around; align-items:center; margin-top:1rem;">
            <div><span class="risk-badge low">Low: ${history.length ? lowCount : 0}</span></div>
            <div><span class="risk-badge medium">Medium: ${history.length ? medCount : 0}</span></div>
            <div><span class="risk-badge high">High: ${history.length ? highCount : 0}</span></div>
          </div>
        </div>
      `;
    }
  }

  /**
   * Renders risk score trend chart over time
   * @private
   */
  _renderTrendChart(history) {
    const canvas = document.getElementById('trend-chart');
    if (!canvas) return;

    // Take last 8 analyses
    const recentRuns = [...history].reverse().slice(-8);
    
    const labels = recentRuns.map((run, idx) => {
      const date = new Date(run.timestamp);
      return `${date.getMonth() + 1}/${date.getDate()} - Run #${idx + 1}`;
    });
    
    const dataPoints = recentRuns.map(run => run.riskScore);

    // Fallback dummy trend if empty
    const displayLabels = labels.length > 0 ? labels : ['No Data'];
    const displayData = dataPoints.length > 0 ? dataPoints : [0];

    const chartData = {
      labels: displayLabels,
      datasets: [{
        label: 'Risk Score %',
        data: displayData,
        fill: true,
        borderColor: getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#6366f1',
        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--primary-transparent').trim() || 'rgba(99, 102, 241, 0.1)',
        tension: 0.3,
        borderWidth: 2,
        pointBackgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#6366f1',
        pointRadius: 4
      }]
    };

    if (this.trendChartInstance) {
      this.trendChartInstance.destroy();
    }

    if (window.Chart) {
      const existingFallback = canvas.parentElement.querySelector('.chart-fallback');
      if (existingFallback) {
        existingFallback.remove();
      }
      canvas.style.display = 'block';

      this.trendChartInstance = new window.Chart(canvas, {
        type: 'line',
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              min: 0,
              max: 100,
              grid: {
                color: getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim() || '#202b44'
              },
              ticks: {
                color: getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim()
              }
            },
            x: {
              grid: { display: false },
              ticks: {
                color: getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim(),
                font: { size: 9 }
              }
            }
          },
          plugins: {
            legend: { display: false }
          }
        }
      });
    } else {
      canvas.style.display = 'none';
      let fallback = canvas.parentElement.querySelector('.chart-fallback');
      if (!fallback) {
        fallback = document.createElement('div');
        fallback.className = 'chart-fallback';
        fallback.style.width = '100%';
        canvas.parentElement.appendChild(fallback);
      }
      fallback.innerHTML = `
        <div style="display:flex; align-items:flex-end; gap:0.5rem; height:180px; width:100%; border-bottom:1px solid var(--border-color); padding:1rem 0;">
          ${displayData.map((d, i) => `
            <div style="flex:1; display:flex; flex-direction:column; align-items:center; gap:0.25rem;">
              <div style="font-size:0.75rem; color:var(--text-secondary);">${d}%</div>
              <div style="width:100%; height:${d * 1.5}px; background:var(--primary); border-radius:2px 2px 0 0;"></div>
              <div style="font-size:0.65rem; color:var(--text-muted); overflow:hidden; white-space:nowrap; max-width:40px;">R${i+1}</div>
            </div>
          `).join('')}
        </div>
      `;
    }
  }
}

// Export class to window
window.BiosecurityCharts = new BiosecurityCharts();
