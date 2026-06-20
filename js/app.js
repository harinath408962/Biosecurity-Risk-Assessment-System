/* app.js */

document.addEventListener('DOMContentLoaded', () => {
  // --- APPLICATION STATE ---
  const state = {
    currentView: 'home',
    theme: localStorage.getItem('biosecurity_theme') || 'dark',
    history: [],
    currentReport: null,
    selectedFile: null
  };

  // --- HTML ELEMENT REFERENCES ---
  const el = {
    // Navigation
    navTabs: document.querySelectorAll('.nav-tab'),
    views: {
      home: document.getElementById('home-view'),
      results: document.getElementById('results-view'),
      dashboard: document.getElementById('dashboard-view')
    },
    themeToggleBtn: document.getElementById('theme-toggle-btn'),
    apiStatusDot: document.getElementById('api-status-dot'),
    apiStatusText: document.getElementById('api-status-text'),

    // Home Page Inputs
    textInput: document.getElementById('manuscript-input'),
    wordCount: document.getElementById('word-count-val'),
    uploadDropzone: document.getElementById('upload-dropzone'),
    fileInput: document.getElementById('file-input'),
    filePreview: document.getElementById('file-preview'),
    fileName: document.getElementById('file-name-span'),
    fileSize: document.getElementById('file-size-span'),
    removeFileBtn: document.getElementById('remove-file-btn'),
    clearTextBtn: document.getElementById('clear-text-btn'),
    analyzeBtn: document.getElementById('analyze-btn'),
    templateCards: document.querySelectorAll('.template-card'),
    
    // Loading State
    loadingOverlay: document.getElementById('loading-overlay'),
    inputPanel: document.getElementById('input-panel'),
    loadingProgressFill: document.getElementById('loading-progress-fill'),
    loadingStatusText: document.getElementById('loading-status-text'),

    // Results Page Elements
    resultsBadge: document.getElementById('results-risk-badge'),
    resultsBslText: document.getElementById('results-bsl-text'),
    resultsBslName: document.getElementById('results-bsl-name'),
    resultsBslDesc: document.getElementById('results-bsl-desc'),
    resultsBslReason: document.getElementById('results-bsl-reason'),
    resultsConfidenceText: document.getElementById('results-confidence-text'),
    resultsConfidenceFill: document.getElementById('results-confidence-fill'),
    resultsExplanation: document.getElementById('results-explanation-p'),
    resultsClassificationReasonDetails: document.getElementById('results-classification-reason-details'),
    resultsManuscriptBody: document.getElementById('results-manuscript-body'),
    resultsIndicatorsList: document.getElementById('results-indicators-list'),
    exportJsonBtn: document.getElementById('export-json-btn'),
    exportPdfBtn: document.getElementById('export-pdf-btn'),
    backToInputBtn: document.getElementById('back-to-input-btn'),
    presentationBtn: document.getElementById('presentation-btn'),
    closePresentationBtn: document.getElementById('close-presentation-btn'),
    presentationModal: document.getElementById('presentation-modal'),

    // Dashboard Page Elements
    statTotal: document.getElementById('stat-total-analyses'),
    statHighRate: document.getElementById('stat-high-rate'),
    statAvgRisk: document.getElementById('stat-avg-risk'),
    statAlerts: document.getElementById('stat-alerts-active'),
    dashboardSearch: document.getElementById('dashboard-search'),
    dashboardFilter: document.getElementById('dashboard-filter'),
    historyTableBody: document.getElementById('history-table-body'),
    clearHistoryBtn: document.getElementById('clear-history-btn')
  };

  // --- HELPERS FOR FINAL PASS ---
  function generateFinalReason(report) {
    if (!report.indicators || report.indicators.length === 0) {
      return "No biosecurity risk indicators or dual-use concerns were identified in the analyzed text.";
    }
    const categories = [];
    const lowercaseInds = report.indicators.map(ind => (ind.keyword || '').toLowerCase());
    if (lowercaseInds.some(ind => ["virulence", "lethality", "gain of function", "toxin", "vaccine-induced immunity", "spore wall modifications"].includes(ind))) {
      categories.push("pathogen enhancement");
    }
    if (lowercaseInds.some(ind => ["aerosol transmission", "aerosolization", "exposure chamber", "transmission"].includes(ind))) {
      categories.push("aerosol transmission");
    }
    if (lowercaseInds.some(ind => ["bacillus anthracis", "anthrax", "ebola", "h5n1"].includes(ind))) {
      categories.push("high-consequence pathogen");
    }
    if (lowercaseInds.some(ind => ["crispr", "gene editing", "genetic engineering"].includes(ind))) {
      categories.push("genetic engineering");
    }
    
    if (categories.length === 0) {
      return `The document contains biosecurity indicators (${report.indicators.map(i => i.title || i.name).slice(0, 3).join(", ")}) requiring baseline Biosafety Level compliance.`;
    }
    
    let categoryString = "";
    if (categories.length === 1) {
      categoryString = categories[0];
    } else if (categories.length === 2) {
      categoryString = `${categories[0]} and ${categories[1]}`;
    } else {
      categoryString = `${categories.slice(0, -1).join(", ")}, and ${categories[categories.length - 1]}`;
    }
    
    return `The document contains ${categoryString} indicators which increase dual-use biosecurity concerns.`;
  }

  function populateDriversList(listEl, indicators) {
    if (!listEl) return;
    listEl.innerHTML = '';
    if (!indicators || indicators.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'None detected';
      listEl.appendChild(li);
      return;
    }
    
    const sorted = [...indicators].sort((a, b) => {
      const valA = (a.level === 'High' || a.severity === 'High') ? 2 : 1;
      const valB = (b.level === 'High' || b.severity === 'High') ? 2 : 1;
      return valB - valA;
    });
    
    const top = sorted.slice(0, 5);
    top.forEach(ind => {
      const li = document.createElement('li');
      li.textContent = ind.title || ind.name;
      if (ind.level === 'High' || ind.severity === 'High') {
        li.style.fontWeight = '600';
      }
      listEl.appendChild(li);
    });
  }

  // --- INITIALIZATION ---
  initTheme();
  initHistory();
  setupEventListeners();
  renderDashboard();
  checkBackendStatus();
  
  // Set default view active tab
  navigateTo('home');

  // --- THEME MANAGEMENT ---
  function initTheme() {
    document.documentElement.setAttribute('data-theme', state.theme);
  }

  function checkBackendStatus() {
    fetch(`${API_BASE_URL}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: '' })
    })
    .then(() => {
      el.apiStatusDot.classList.remove('loading', 'offline');
      el.apiStatusText.textContent = "System Ready";
    })
    .catch(() => {
      el.apiStatusDot.classList.add('offline');
      el.apiStatusText.textContent = "Offline Fallback Mode";
    });
  }

  function toggleTheme() {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', state.theme);
    localStorage.setItem('biosecurity_theme', state.theme);
    
    // Redraw charts to update colors for the active theme
    if (state.history.length > 0) {
      window.BiosecurityCharts.initDashboardCharts(state.history);
    }
  }

  // --- HISTORY / DATABASE MANAGEMENT ---
  function initHistory() {
    const saved = localStorage.getItem('biosecurity_analyses_history');
    if (saved) {
      state.history = JSON.parse(saved);
    } else {
      // Pre-load dummy historical evaluations to give the dashboard initial professional data
      const sampleLowReport = window.BiosecurityAPI._processAnalysis(window.academicSamples.low.text);
      sampleLowReport.timestamp = new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(); // 2 days ago
      sampleLowReport.fileName = "yeast_biofuel_optimization.txt";

      const sampleMedReport = window.BiosecurityAPI._processAnalysis(window.academicSamples.medium.text);
      sampleMedReport.timestamp = new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(); // 1 day ago
      sampleMedReport.fileName = "h5n1_droplet_chambers.pdf";

      const sampleHighReport = window.BiosecurityAPI._processAnalysis(window.academicSamples.high.text);
      sampleHighReport.timestamp = new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(); // 2 hours ago
      sampleHighReport.fileName = "anthrax_durc_test.txt";

      state.history = [sampleLowReport, sampleMedReport, sampleHighReport];
      saveHistory();
    }
  }

  function saveHistory() {
    localStorage.setItem('biosecurity_analyses_history', JSON.stringify(state.history));
  }

  // --- SPA ROUTING ---
  function navigateTo(viewName) {
    state.currentView = viewName;
    
    // Toggle active classes on view containers
    Object.keys(el.views).forEach(name => {
      if (name === viewName) {
        el.views[name].classList.remove('hidden');
      } else {
        el.views[name].classList.add('hidden');
      }
    });

    // Toggle active classes on navbar elements
    el.navTabs.forEach(tab => {
      const targetView = tab.getAttribute('data-view');
      if (targetView === viewName) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    // Trigger charts rendering when entering dashboard
    if (viewName === 'dashboard') {
      renderDashboard();
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --- EVENT LISTENERS ---
  function setupEventListeners() {
    // Nav Tabs clicks
    el.navTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetView = tab.getAttribute('data-view');
        
        // If results tab is empty and clicked, remind them to analyze
        if (targetView === 'results' && !state.currentReport) {
          alert("Please input and analyze text to see the Results Page.");
          return;
        }
        
        navigateTo(targetView);
      });
    });

    // Theme Toggle
    if (el.themeToggleBtn) {
      el.themeToggleBtn.addEventListener('click', toggleTheme);
    }

    // Word Count on text input
    if (el.textInput) {
      el.textInput.addEventListener('input', updateWordCount);
    }

    // Templates selection
    el.templateCards.forEach(card => {
      card.addEventListener('click', () => {
        const type = card.getAttribute('data-template');
        const sample = window.academicSamples[type];
        if (sample) {
          el.textInput.value = sample.text;
          updateWordCount();
          // Remove selected file if templates are used
          clearSelectedFile();
        }
      });
    });

    // Clear Text Button
    if (el.clearTextBtn) {
      el.clearTextBtn.addEventListener('click', () => {
        el.textInput.value = '';
        updateWordCount();
        clearSelectedFile();
      });
    }

    // File Dropzone interaction
    if (el.uploadDropzone) {
      el.uploadDropzone.addEventListener('click', () => el.fileInput.click());
      
      // Drag/Drop visual updates
      ['dragenter', 'dragover'].forEach(eventName => {
        el.uploadDropzone.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          el.uploadDropzone.classList.add('dragover');
        }, false);
      });

      ['dragleave', 'drop'].forEach(eventName => {
        el.uploadDropzone.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          el.uploadDropzone.classList.remove('dragover');
        }, false);
      });

      el.uploadDropzone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) {
          handleSelectedFile(files[0]);
        }
      });
    }

    if (el.fileInput) {
      el.fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
          handleSelectedFile(e.target.files[0]);
        }
      });
    }

    if (el.removeFileBtn) {
      el.removeFileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        clearSelectedFile();
      });
    }

    // Analyze Risk Click
    if (el.analyzeBtn) {
      el.analyzeBtn.addEventListener('click', performAnalysis);
    }

    // Results Export Actions
    if (el.exportJsonBtn) {
      el.exportJsonBtn.addEventListener('click', exportReportAsJson);
    }

    if (el.exportPdfBtn) {
      el.exportPdfBtn.addEventListener('click', () => {
        window.print(); // Handled beautifully by print stylesheet styles inside css files.
      });
    }

    if (el.backToInputBtn) {
      el.backToInputBtn.addEventListener('click', () => navigateTo('home'));
    }

    if (el.presentationBtn) {
      el.presentationBtn.addEventListener('click', () => {
        if (state.currentReport && el.presentationModal) {
          el.presentationModal.classList.remove('hidden');
        }
      });
    }

    if (el.closePresentationBtn) {
      el.closePresentationBtn.addEventListener('click', () => {
        if (el.presentationModal) {
          el.presentationModal.classList.add('hidden');
        }
      });
    }

    if (el.presentationModal) {
      el.presentationModal.addEventListener('click', (e) => {
        if (e.target === el.presentationModal) {
          el.presentationModal.classList.add('hidden');
        }
      });
    }

    // Dashboard Search & Filters
    if (el.dashboardSearch) {
      el.dashboardSearch.addEventListener('input', filterHistoryTable);
    }

    if (el.dashboardFilter) {
      el.dashboardFilter.addEventListener('change', filterHistoryTable);
    }

    if (el.clearHistoryBtn) {
      el.clearHistoryBtn.addEventListener('click', clearAllHistory);
    }
  }

  // --- MANUSCRIPT WORD COUNT ---
  function updateWordCount() {
    const text = el.textInput.value.trim();
    const words = text ? text.split(/\s+/).length : 0;
    el.wordCount.textContent = words;
    
    // Enable/disable analyze button
    el.analyzeBtn.disabled = words === 0;
  }

  // --- FILE HANDLING SYSTEM ---
  function handleSelectedFile(file) {
    const allowedTypes = ['text/plain', 'application/pdf'];
    const extension = file.name.split('.').pop().toLowerCase();
    
    if (!allowedTypes.includes(file.type) && !['txt', 'pdf'].includes(extension)) {
      alert("Invalid file type. Please upload a PDF or TXT file.");
      return;
    }

    state.selectedFile = file;
    el.fileName.textContent = file.name;
    
    // Format size
    const kb = (file.size / 1024).toFixed(1);
    el.fileSize.textContent = `(${kb} KB)`;

    // Show preview frame
    el.filePreview.classList.remove('hidden');

    // Read TXT file or simulate PDF extraction
    const reader = new FileReader();
    
    if (extension === 'txt') {
      reader.onload = (e) => {
        el.textInput.value = e.target.result;
        updateWordCount();
      };
      reader.readAsText(file);
    } else if (extension === 'pdf') {
      // PDF Mock parser: select template based on filename keywords
      const lowerName = file.name.toLowerCase();
      let extractedText = "";

      if (lowerName.includes("anthrax") || lowerName.includes("bioweapon") || lowerName.includes("select agent")) {
        extractedText = window.academicSamples.high.text;
      } else if (lowerName.includes("flu") || lowerName.includes("h5n1") || lowerName.includes("aerosol") || lowerName.includes("influenza")) {
        extractedText = window.academicSamples.medium.text;
      } else {
        // Fallback standard text
        extractedText = window.academicSamples.low.text;
      }

      // Show mock loader in text box to make it realistic
      el.textInput.value = "[Extracting abstract text from uploaded PDF document...]\n\n" + extractedText;
      updateWordCount();
    }
  }

  function clearSelectedFile() {
    state.selectedFile = null;
    el.fileInput.value = '';
    el.filePreview.classList.add('hidden');
  }

  // --- RISK ANALYSIS EXECUTION ---
  function performAnalysis() {
    const text = el.textInput.value.trim();
    if (!text) return;

    // Show progress loading screen, hide input form
    el.inputPanel.classList.add('hidden');
    el.loadingOverlay.classList.remove('hidden');
    el.apiStatusDot.classList.add('loading');
    el.apiStatusText.textContent = "Analyzing Request...";

    // Run analyzer simulation
    window.BiosecurityAPI.analyzeText(text, (progress) => {
      // Update progress bar
      el.loadingProgressFill.style.width = `${progress}%`;
      
      // Update details text dynamically
      if (progress < 30) {
        el.loadingStatusText.textContent = "Scanning document structural sections...";
      } else if (progress < 60) {
        el.loadingStatusText.textContent = "Running natural language keywords matching against Tier-1 Select Agent databases...";
      } else if (progress < 90) {
        el.loadingStatusText.textContent = "Computing biosecurity risk levels and biosafety vector profiles...";
      } else {
        el.loadingStatusText.textContent = "Compiling explainable reports...";
      }
    })
    .then(report => {
      // Reset statuses
      el.apiStatusDot.classList.remove('loading');
      if (report.isOffline) {
        el.apiStatusDot.classList.add('offline');
        el.apiStatusText.textContent = "Offline Fallback Mode";
      } else {
        el.apiStatusDot.classList.remove('offline');
        el.apiStatusText.textContent = "System Ready";
      }

      // Attach file details if applicable
      if (state.selectedFile) {
        report.fileName = state.selectedFile.name;
      } else {
        // Generate abstract short name from text title
        const firstLine = text.split('\n')[0].replace("Title:", "").trim();
        report.fileName = firstLine.length > 25 ? firstLine.substring(0, 25) + "..." : firstLine || "Raw Input Text";
      }

      // Add to state and save
      state.currentReport = report;
      state.history.unshift(report); // Add to beginning of history
      saveHistory();

      // Show Results
      renderResultsReport(report);
      navigateTo('results');

      // Reset panels immediately
      el.inputPanel.classList.remove('hidden');
      el.loadingOverlay.classList.add('hidden');
      el.loadingProgressFill.style.width = '0%';
    })
    .catch(err => {
      alert("Analysis failed: " + err.message);
      el.inputPanel.classList.remove('hidden');
      el.loadingOverlay.classList.add('hidden');
      el.apiStatusDot.classList.remove('loading');
      el.apiStatusText.textContent = "System Ready";
    });
  }

  // --- RESULTS PAGE DISPLAY ---
  function renderResultsReport(report) {
    const bslMetadata = {
      "BSL-1": {
        name: "Low Containment Laboratory",
        desc: "Suitable for low-risk biological materials. Standard laboratory practices are sufficient."
      },
      "BSL-2": {
        name: "Moderate Containment Laboratory",
        desc: "Used for biological agents that require additional safety precautions and restricted access."
      },
      "BSL-3": {
        name: "High Containment Laboratory",
        desc: "Used for potentially dangerous pathogens that may spread through the air and cause serious disease."
      },
      "BSL-4": {
        name: "Maximum Containment Laboratory",
        desc: "Reserved for extremely dangerous pathogens with severe health consequences and no widely available treatment."
      }
    };

    // 1. Update text variables
    el.resultsBslText.textContent = report.bslLevel;
    const meta = bslMetadata[report.bslLevel] || bslMetadata["BSL-1"];
    if (el.resultsBslName) el.resultsBslName.textContent = meta.name;
    if (el.resultsBslDesc) el.resultsBslDesc.textContent = meta.desc;

    // Populate Primary Risk Drivers list in the BSL Containment Card
    const driversListUI = document.getElementById('results-bsl-drivers-list');
    populateDriversList(driversListUI, report.indicators);

    // Populate Final Assessment Box
    const finalAssessmentUI = document.getElementById('results-final-assessment-box');
    const reviewRequired = (report.riskLevel === 'High' || report.riskLevel === 'Medium') ? 'Required' : 'Not Required';
    const reviewColor = reviewRequired === 'Required' ? 'var(--risk-high)' : 'var(--risk-low)';
    const riskClass = report.riskLevel.toLowerCase();
    const finalReasonText = generateFinalReason(report);

    if (finalAssessmentUI) {
      finalAssessmentUI.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 0.75rem; margin-bottom: 0.75rem;">
          <span style="font-size: 1.15rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem;">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--primary);">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <span>Final Assessment</span>
          </span>
          <span class="risk-badge ${riskClass}" style="font-weight: 700; text-transform: uppercase; font-size: 0.8rem; padding: 0.25rem 0.6rem; border-radius: var(--radius-sm);">${report.riskLevel} Risk</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 0.75rem;">
          <div style="display: flex; flex-direction: column;">
            <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 600; letter-spacing: 0.02em;">Risk Severity</span>
            <span style="font-size: 1.15rem; font-weight: 700; color: var(--text-primary);">${report.riskLevel}</span>
          </div>
          <div style="display: flex; flex-direction: column;">
            <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 600; letter-spacing: 0.02em;">Recommended Containment</span>
            <span style="font-size: 1.15rem; font-weight: 700; color: var(--primary);">${report.bslLevel}</span>
          </div>
          <div style="display: flex; flex-direction: column;">
            <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 600; letter-spacing: 0.02em;">Review Required</span>
            <span style="font-size: 1.15rem; font-weight: 700; color: ${reviewColor};">${reviewRequired}</span>
          </div>
        </div>
        <div style="border-top: 1px solid var(--border-color); padding-top: 0.75rem; display: flex; flex-direction: column; gap: 0.25rem;">
          <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 600; letter-spacing: 0.02em;">Reason</span>
          <p style="margin: 0; font-size: 1.02rem; line-height: 1.5; color: var(--text-primary); font-weight: 500;">${finalReasonText}</p>
        </div>
      `;
    }

    if (el.resultsConfidenceText) el.resultsConfidenceText.textContent = `${report.confidenceScore}%`;
    el.resultsExplanation.textContent = report.explanation;
    
    // Confidence linear progress bar
    if (el.resultsConfidenceFill) {
      el.resultsConfidenceFill.className = "confidence-bar-fill";
      el.resultsConfidenceFill.style.width = `${report.confidenceScore}%`;
      
      // Apply color styling to confidence fill bar
      if (report.riskLevel === 'High') {
        el.resultsConfidenceFill.style.backgroundColor = 'var(--risk-high)';
      } else if (report.riskLevel === 'Medium') {
        el.resultsConfidenceFill.style.backgroundColor = 'var(--risk-medium)';
      } else {
        el.resultsConfidenceFill.style.backgroundColor = 'var(--risk-low)';
      }
    }

    // Reset risk badge styles
    el.resultsBadge.className = `risk-badge ${report.riskLevel.toLowerCase()}`;
    el.resultsBadge.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
      <span>${report.riskLevel} Risk</span>
    `;

    // 2. Render SVG gauge
    window.BiosecurityCharts.updateSvgGauge(report.riskScore, report.riskLevel, 'results-gauge-container');

    // 3. Highlighted raw manuscript body
    el.resultsManuscriptBody.innerHTML = report.highlightedText.replace(/\n/g, '<br>');

    // Populate Detected Indicators chips summary
    const summaryContainer = document.getElementById('results-indicators-summary');
    if (summaryContainer) {
      summaryContainer.innerHTML = '';
      if (!report.indicators || report.indicators.length === 0) {
        summaryContainer.innerHTML = '<span class="indicator-chip no-indicators">No indicators detected</span>';
      } else {
        report.indicators.forEach(ind => {
          const chip = document.createElement('span');
          chip.className = `indicator-chip ${ind.level.toLowerCase()}`;
          chip.textContent = ind.title || ind.name;
          summaryContainer.appendChild(chip);
        });
      }
    }

    // Render Why Was This Classified? details
    if (el.resultsClassificationReasonDetails) {
      const indsList = report.indicators.length > 0 
        ? report.indicators.map(ind => ind.title || ind.name).join(', ') 
        : 'None';
      const riskClass = report.riskLevel.toLowerCase();
      
      el.resultsClassificationReasonDetails.innerHTML = `
        <div class="classified-row" style="display: flex; flex-direction: row; align-items: center; gap: 0.5rem; font-size: 1.05rem;">
          <strong style="color: var(--text-primary); width: 180px; flex-shrink: 0; font-weight: 600;">Risk Level:</strong>
          <span class="risk-badge ${riskClass}" style="display: inline-flex; align-items: center; gap: 0.25rem; font-size: 0.8rem; padding: 0.25rem 0.6rem; border-radius: var(--radius-sm); font-weight: 600; text-transform: uppercase;">${report.riskLevel} Risk</span>
        </div>
        <div class="classified-row" style="display: flex; flex-direction: row; align-items: center; gap: 0.5rem; font-size: 1.05rem;">
          <strong style="color: var(--text-primary); width: 180px; flex-shrink: 0; font-weight: 600;">Detected Indicators:</strong>
          <span style="color: var(--text-secondary);">${indsList}</span>
        </div>
        <div class="classified-row" style="display: flex; flex-direction: row; align-items: center; gap: 0.5rem; font-size: 1.05rem;">
          <strong style="color: var(--text-primary); width: 180px; flex-shrink: 0; font-weight: 600;">Containment Level:</strong>
          <span style="color: var(--primary); font-weight: 700; background: var(--primary-transparent); padding: 0.15rem 0.5rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">${report.bslLevel}</span>
        </div>
        <div class="classified-row" style="display: flex; flex-direction: column; align-items: flex-start; gap: 0.25rem; font-size: 1.05rem; border-top: 1px solid var(--border-color); padding-top: 0.75rem; margin-top: 0.25rem;">
          <strong style="color: var(--text-primary); font-weight: 600; margin-bottom: 0.25rem;">Decision Rationale:</strong>
          <p style="color: var(--text-primary); line-height: 1.55; margin: 0; font-size: 1.02rem;">${report.classificationReason || 'The analysis did not produce a classification rationale statement.'}</p>
        </div>
      `;
    }

    // 4. Render Detected Risk Indicators panel
    el.resultsIndicatorsList.innerHTML = '';
    
    if (report.indicators.length === 0) {
      el.resultsIndicatorsList.innerHTML = `
        <div class="no-indicators-card">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <div class="no-indicators-title">No Dual-Use Hazards Flagged</div>
          <div style="font-size:0.9rem;">Metabolic engineering parameters correspond to Biosafety Level 1 parameters.</div>
        </div>
      `;
    } else {
      report.indicators.forEach(indicator => {
        const borderClass = indicator.level === 'High' ? 'risk-high-border' : 'risk-medium-border';
        const badgeClass = indicator.level === 'High' ? 'high' : 'medium';
        
        const cardHTML = `
          <div class="indicator-card ${borderClass}" id="indicator-card-${indicator.id}">
            <div class="indicator-header">
              <span class="indicator-name" style="font-size: 1.25rem; font-weight: 700; color: var(--text-primary);">${indicator.title || indicator.name}</span>
              <span class="risk-badge ${badgeClass}">${indicator.level}</span>
            </div>
            <div class="indicator-details" style="display: flex; flex-direction: column; gap: 0.6rem; margin-top: 0.5rem; margin-bottom: 0.75rem; font-size: 0.98rem; line-height: 1.45;">
              <div class="indicator-detail-row">
                <strong style="color: var(--text-primary); font-weight: 600;">Meaning:</strong><br>
                <span style="color: var(--text-secondary);">${indicator.meaning}</span>
              </div>
              <div class="indicator-detail-row">
                <strong style="color: var(--text-primary); font-weight: 600;">Why Flagged:</strong><br>
                <span style="color: var(--text-secondary);">${indicator.whyFlagged}</span>
              </div>
              <div class="indicator-detail-row">
                <strong style="color: var(--text-primary); font-weight: 600;">Severity:</strong> 
                <span class="severity-badge ${indicator.severity ? indicator.severity.toLowerCase() : indicator.level.toLowerCase()}" style="font-weight: 600; text-transform: uppercase;">${indicator.severity || indicator.level}</span>
              </div>
            </div>
            <div class="indicator-footer" style="margin-top: 0.75rem; padding-top: 0.5rem; border-top: 1px solid var(--border-color);">
              <div class="indicator-meta">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                <span>Category: ${indicator.category}</span>
              </div>
              <div>Keyword: <span class="indicator-keyword">${indicator.keyword}</span></div>
            </div>
          </div>
        `;
        el.resultsIndicatorsList.insertAdjacentHTML('beforeend', cardHTML);
      });
    }

    // Populate Print PDF elements
    const printDocName = document.getElementById('print-doc-name');
    const printDate = document.getElementById('print-date');
    const printRiskLevel = document.getElementById('print-risk-level');
    const printRiskScore = document.getElementById('print-risk-score');
    const printConfidence = document.getElementById('print-confidence');
    const printBsl = document.getElementById('print-bsl');
    const printExecutiveSummary = document.getElementById('print-executive-summary');
    const printBslLevel = document.getElementById('print-bsl-level');
    const printBslName = document.getElementById('print-bsl-name');
    const printBslDesc = document.getElementById('print-bsl-desc');
    const printBslDriversList = document.getElementById('print-bsl-drivers-list');
    const printIndicatorsList = document.getElementById('print-indicators-list');
    const printAbstractText = document.getElementById('print-abstract-text');

    if (printDocName) printDocName.textContent = report.fileName;
    if (printDate) printDate.textContent = new Date(report.timestamp).toLocaleString();
    if (printRiskLevel) printRiskLevel.textContent = report.riskLevel + " Risk";
    if (printRiskScore) printRiskScore.textContent = `${report.riskScore}%`;
    if (printConfidence) printConfidence.textContent = `${report.confidenceScore}%`;
    if (printBsl) printBsl.textContent = report.bslLevel;
    if (printExecutiveSummary) printExecutiveSummary.textContent = report.explanation;
    if (printBslLevel) printBslLevel.textContent = report.bslLevel;
    if (printBslName) printBslName.textContent = meta.name;
    if (printBslDesc) printBslDesc.textContent = meta.desc;

    // Populate Print Drivers
    populateDriversList(printBslDriversList, report.indicators);

    if (printAbstractText) printAbstractText.textContent = report.textInput;

    // Populate Print Final Assessment summary box
    const printFinalAssessmentBox = document.getElementById('print-final-assessment-box');
    if (printFinalAssessmentBox) {
      printFinalAssessmentBox.innerHTML = `
        <div style="margin-bottom: 0.75rem; font-size: 1.3rem; font-weight: 800; border-bottom: 2px solid #000000; padding-bottom: 0.5rem; text-transform: uppercase; color: #000000;">
          FINAL ASSESSMENT
        </div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 0.75rem; font-size: 1.05rem; color: #000000;">
          <div>
            <strong>Risk Level:</strong> ${report.riskLevel}
          </div>
          <div>
            <strong>Recommended Containment:</strong> ${report.bslLevel}
          </div>
          <div>
            <strong>Review Required:</strong> ${reviewRequired}
          </div>
        </div>
        <div style="border-top: 1px solid #000000; padding-top: 0.5rem; color: #000000;">
          <strong>Reason:</strong>
          <p style="margin: 0.25rem 0 0 0; line-height: 1.5; font-size: 1.05rem;">${finalReasonText}</p>
        </div>
      `;
    }

    // Populate footers dates
    const footerDates = document.querySelectorAll('.print-footer-date');
    const dateFormatted = new Date(report.timestamp).toLocaleString();
    footerDates.forEach(elDate => elDate.textContent = dateFormatted);

    // Populate Presentation Modal
    const presRiskLevel = document.getElementById('pres-risk-level');
    const presBslLevel = document.getElementById('pres-bsl-level');
    const presReviewRequired = document.getElementById('pres-review-required');
    const presDriversList = document.getElementById('pres-drivers-list');
    const presRationaleText = document.getElementById('pres-rationale-text');
    
    if (presRiskLevel) {
      presRiskLevel.textContent = `${report.riskLevel} Risk`;
      presRiskLevel.className = `risk-badge ${report.riskLevel.toLowerCase()}`;
    }
    if (presBslLevel) presBslLevel.textContent = report.bslLevel;
    if (presReviewRequired) {
      presReviewRequired.textContent = reviewRequired;
      presReviewRequired.style.color = reviewColor;
    }
    if (presRationaleText) presRationaleText.textContent = finalReasonText;
    populateDriversList(presDriversList, report.indicators);

    if (printIndicatorsList) {
      printIndicatorsList.innerHTML = '';
      if (!report.indicators || report.indicators.length === 0) {
        printIndicatorsList.innerHTML = '<p style="font-size: 1.1rem; color: #000000;">No dual-use indicators detected.</p>';
      } else {
        report.indicators.forEach(ind => {
          const indHTML = `
            <div class="print-indicator-item" style="margin-bottom: 1.8rem; padding-bottom: 1rem; border-bottom: 1.5px dashed #000000; page-break-inside: avoid;">
              <h3 style="margin-bottom: 0.5rem; font-size: 1.35rem; font-weight: 700; color: #000000 !important; text-transform: capitalize;">${ind.title || ind.name}</h3>
              <p style="margin: 0.35rem 0; font-size: 1.05rem; line-height: 1.5; color: #000000;"><strong>Meaning:</strong> ${ind.meaning}</p>
              <p style="margin: 0.35rem 0; font-size: 1.05rem; line-height: 1.5; color: #000000;"><strong>Why Flagged:</strong> ${ind.whyFlagged}</p>
              <p style="margin: 0.35rem 0; font-size: 1.05rem; line-height: 1.5; color: #000000;"><strong>Severity:</strong> ${ind.severity || ind.level}</p>
            </div>
          `;
          printIndicatorsList.insertAdjacentHTML('beforeend', indHTML);
        });
      }
    }

    // 5. Connect highlighted click events to indicators scroll animations
    setupHighlightClickEvents();
  }

  function setupHighlightClickEvents() {
    const highlights = el.resultsManuscriptBody.querySelectorAll('.highlight-risk, .highlight-warn');
    
    highlights.forEach(hl => {
      hl.addEventListener('click', () => {
        const id = hl.getAttribute('data-indicator-id');
        const card = document.getElementById(`indicator-card-${id}`);
        
        if (card) {
          // Highlight active markers
          el.resultsManuscriptBody.querySelectorAll('.highlight-risk, .highlight-warn').forEach(h => h.classList.remove('focused'));
          hl.classList.add('focused');

          // Highlight card border
          el.resultsIndicatorsList.querySelectorAll('.indicator-card').forEach(c => c.classList.remove('focused'));
          card.classList.add('focused');

          // Scroll card
          card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          
          // Micro flash transition
          card.style.transform = 'scale(1.02)';
          setTimeout(() => {
            card.style.transform = 'none';
          }, 300);
        }
      });
    });
  }

  // --- REPORT EXPORT SYSTEM ---
  function exportReportAsJson() {
    if (!state.currentReport) return;
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.currentReport, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    
    // Format filename
    const nameSanitized = state.currentReport.fileName.replace(/\s+/g, '_').toLowerCase();
    downloadAnchor.setAttribute("download", `biosecurity_assessment_${nameSanitized}.json`);
    
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  // --- DASHBOARD DISPLAY AND CHARTS RENDERING ---
  function renderDashboard() {
    // 1. Calculate and update stats cards
    const total = state.history.length;
    el.statTotal.textContent = total;

    let highCount = 0;
    let sumRisk = 0;
    
    state.history.forEach(run => {
      if (run.riskLevel === 'High') highCount++;
      sumRisk += run.riskScore;
    });

    const highRatePct = total > 0 ? Math.round((highCount / total) * 100) : 0;
    el.statHighRate.textContent = `${highRatePct}%`;

    const avgRiskPct = total > 0 ? Math.round(sumRisk / total) : 0;
    el.statAvgRisk.textContent = `${avgRiskPct}%`;

    // Active alert alerts (High + Medium count in past entries)
    const activeAlerts = state.history.filter(run => run.riskLevel === 'High' || run.riskLevel === 'Medium').length;
    el.statAlerts.textContent = activeAlerts;

    // 2. Populate Recent Table
    populateHistoryTable(state.history);

    // 3. Render analytical charts
    window.BiosecurityCharts.initDashboardCharts(state.history);
  }

  function populateHistoryTable(records) {
    el.historyTableBody.innerHTML = '';

    if (records.length === 0) {
      el.historyTableBody.innerHTML = `
        <tr>
          <td colspan="5">
            <div class="empty-table-state">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <div>No assessments in directory database.</div>
              <button class="btn btn-secondary" id="empty-db-create-btn" style="padding: 0.35rem 0.75rem; font-size: 0.8rem; margin-top: 0.5rem;">Run First Assessment</button>
            </div>
          </td>
        </tr>
      `;
      
      const emptyBtn = document.getElementById('empty-db-create-btn');
      if (emptyBtn) {
        emptyBtn.addEventListener('click', () => navigateTo('home'));
      }
      return;
    }

    records.forEach((record, index) => {
      const date = new Date(record.timestamp);
      const dateStr = date.toLocaleString();
      const badgeClass = record.riskLevel.toLowerCase();
      
      // Select file icon
      const extension = record.fileName.split('.').pop().toLowerCase();
      const isPdf = extension === 'pdf';
      const docIconHTML = isPdf 
        ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="red" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="9" y1="15" x2="15" y2="15"></line></svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${dateStr}</td>
        <td>
          <div class="doc-cell" title="${record.fileName}">
            ${docIconHTML}
            <span class="doc-title-text">${record.fileName}</span>
          </div>
        </td>
        <td><span class="risk-badge ${badgeClass}">${record.riskLevel} Risk</span></td>
        <td style="font-weight: 600;">${record.riskScore}%</td>
        <td>
          <button class="btn btn-secondary view-report-btn" data-history-idx="${index}" style="padding: 0.35rem 0.75rem; font-size: 0.8rem; border-radius: var(--radius-sm);">
            View Analysis
          </button>
        </td>
      `;

      // Connect Row View button
      const viewBtn = tr.querySelector('.view-report-btn');
      viewBtn.addEventListener('click', () => {
        state.currentReport = record;
        renderResultsReport(record);
        navigateTo('results');
      });

      el.historyTableBody.appendChild(tr);
    });
  }

  // --- FILTERS & SEARCH TABLE ---
  function filterHistoryTable() {
    const query = el.dashboardSearch.value.toLowerCase();
    const filter = el.dashboardFilter.value; // 'All', 'High', 'Medium', 'Low'

    const filtered = state.history.filter(record => {
      const matchesSearch = record.fileName.toLowerCase().includes(query) || record.explanation.toLowerCase().includes(query);
      const matchesFilter = filter === 'All' || record.riskLevel === filter;
      return matchesSearch && matchesFilter;
    });

    populateHistoryTable(filtered);
  }

  // --- PURGE LOCALSTORAGE HISTORY ---
  function clearAllHistory() {
    if (confirm("Are you sure you want to permanently clear the analysis history directory database? This cannot be undone.")) {
      state.history = [];
      saveHistory();
      renderDashboard();
      state.currentReport = null;
    }
  }
});
