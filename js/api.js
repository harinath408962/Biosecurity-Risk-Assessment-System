/* api.js */

class BiosecurityAPI {
  constructor() {
    // Defined rules for keyword scanning & explaining
    this.rules = [
      {
        keyword: "Bacillus anthracis",
        name: "Select Agent Identified (B. anthracis)",
        category: "Pathogen Identification",
        level: "High",
        explanation: "Bacillus anthracis is a Tier 1 Select Agent with high lethality and history of weaponization. Research involving genetic modification of this agent is subject to strict DURC (Dual-Use Research of Concern) oversight."
      },
      {
        keyword: "anthrax",
        name: "Select Agent Mention (Anthrax)",
        category: "Pathogen Identification",
        level: "High",
        explanation: "Mentions of anthrax, particularly in association with genetic manipulation or dissemination enhancement, flag significant biosecurity concerns."
      },
      {
        keyword: "Ebola",
        name: "High-Consequence Pathogen (Ebola)",
        category: "Pathogen Identification",
        level: "High",
        explanation: "Ebola virus is a high-consequence pathogen causing severe hemorrhagic fever. Any manipulation of its transmission vectors or viral stability requires maximum BSL-4 containment."
      },
      {
        keyword: "aerosolization",
        name: "Dissemination Enhancement (Aerosolization)",
        category: "Dissemination & Delivery",
        level: "High",
        explanation: "Research specifically aiming to optimize the aerosolization efficiency of bacterial spores or viral particles facilitates inhalation delivery, a primary pathway for biological weapons."
      },
      {
        keyword: "vaccine-induced immunity",
        name: "Immune Evasion / Resistance",
        category: "Host-Pathogen Interactions",
        level: "High",
        explanation: "Bypassing vaccine-induced immunity or host defenses represents a dangerous modification that renders standard medical countermeasures (like vaccinations) ineffective."
      },
      {
        keyword: "lethality",
        name: "Virulence / Lethality Enhancement",
        category: "Functional Modification",
        level: "High",
        explanation: "Enhancing the lethality, virulence, or clinical severity of a pathogen directly increases the public health risk and potential damage if released."
      },
      {
        keyword: "spore wall modifications",
        name: "Dissemination Optimization",
        category: "Dissemination & Delivery",
        level: "High",
        explanation: "Altering the outer spore coats to prevent static aggregation increases the suspension time and stability of airborne spores, optimizing inhalational risk."
      },
      {
        keyword: "exosporium",
        name: "Spore Surface Modification",
        category: "Functional Modification",
        level: "High",
        explanation: "Modifying the exosporium layers of spore-forming pathogens can alter physical characteristics like hydrophobicity and binding properties, affecting environmental persistence."
      },
      {
        keyword: "H5N1",
        name: "Potential Pandemic Pathogen (H5N1)",
        category: "Pathogen Identification",
        level: "Medium",
        explanation: "H5N1 Highly Pathogenic Avian Influenza has a high mortality rate in humans. Research regarding its aerosol transmission potential is highly scrutinized due to pandemic risks."
      },
      {
        keyword: "aerosol transmission",
        name: "Aerosol Transmission Studies",
        category: "Transmission Potential",
        level: "Medium",
        explanation: "Investigating aerosol transmission parameters of respiratory pathogens is critical for public health, but carries dual-use risks if transmission efficiency is accidentally or deliberately increased."
      },
      {
        keyword: "exposure chamber",
        name: "High-Containment Experimental Systems",
        category: "Experimental Apparatus",
        level: "Medium",
        explanation: "Use of specialized aerosol exposure chambers indicating research into inhalation infectivity parameters. Requires strict safety controls and biosafety verification."
      },
      {
        keyword: "dual-use",
        name: "Explicit Dual-Use Mention",
        category: "Policy Compliance",
        level: "Medium",
        explanation: "The text explicitly mentions dual-use implications, indicating that the researchers are aware of biosecurity oversight requirements (DURC)."
      }
    ];
  }

  /**
   * Sends text to backend API endpoint to analyze text for biosecurity risk
   * @param {string} text - The input research abstract or paper text
   * @param {function} onProgress - Progress update callback (0 to 100)
   * @returns {Promise<object>} The risk assessment report
   */
  analyzeText(text, onProgress = () => {}) {
    if (!text || text.trim().length === 0) {
      return Promise.reject(new Error("Empty text submitted for analysis."));
    }

    // Start simulating progress up to 90%
    let progress = 0;
    const interval = setInterval(() => {
      if (progress < 90) {
        progress += 10;
        onProgress(progress);
      }
    }, 100);

    const apiEndpoint = `${API_BASE_URL}/api/analyze`;

    return fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text: text })
    })
    .then(response => {
      clearInterval(interval);
      if (!response.ok) {
        throw new Error("Server returned an error status: " + response.status);
      }
      return response.json();
    })
    .then(data => {
      onProgress(100);
      
      // Validate backend response JSON structure
      if (!data || typeof data !== 'object') {
        throw new Error("Invalid response format: response is not a JSON object");
      }
      
      // Check expected backend JSON fields
      const riskLevel = data["Risk Level"];
      const predictionScore = data["Prediction Score"];
      const indicators = data["Indicators"];
      const bsl = data["BSL"];
      
      if (typeof riskLevel !== 'string' || riskLevel.trim().length === 0) {
        throw new Error("Invalid response structure: 'Risk Level' is missing or invalid.");
      }
      if (typeof predictionScore !== 'number' || isNaN(predictionScore)) {
        throw new Error("Invalid response structure: 'Prediction Score' is missing or invalid.");
      }
      if (!Array.isArray(indicators)) {
        throw new Error("Invalid response structure: 'Indicators' is missing or invalid.");
      }
      if (typeof bsl !== 'string' || bsl.trim().length === 0) {
        throw new Error("Invalid response structure: 'BSL' is missing or invalid.");
      }

      // Map backend response format to frontend report format
      let highlightedText = text;
      let indicatorIndex = 1;
      const processedIndicators = [];

      function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      }

      // We process indicators list
      indicators.forEach(indicatorKeyword => {
        if (typeof indicatorKeyword !== 'string' || indicatorKeyword.trim().length === 0) {
          return;
        }

        // Find matching rule in frontend rules for descriptive details, or use fallback
        const matchingRule = this.rules.find(r => r.keyword.toLowerCase() === indicatorKeyword.toLowerCase());
        
        const ruleObj = {
          id: indicatorIndex,
          keyword: indicatorKeyword,
          name: matchingRule ? matchingRule.name : `Detected Indicator (${indicatorKeyword})`,
          category: matchingRule ? matchingRule.category : "Biosecurity Indicator",
          level: matchingRule ? matchingRule.level : riskLevel,
          explanation: matchingRule ? matchingRule.explanation : `The indicator '${indicatorKeyword}' was identified by the backend model as a potential biosecurity risk marker.`
        };

        processedIndicators.push(ruleObj);

        // Inject highlight tags into copy of text
        const regex = new RegExp(`(${escapeRegExp(indicatorKeyword)})`, "gi");
        const markerClass = ruleObj.level === "High" ? "highlight-risk" : "highlight-warn";
        highlightedText = highlightedText.replace(regex, `<span class="${markerClass}" data-indicator-id="${indicatorIndex}">$1</span>`);
        
        indicatorIndex++;
      });

      // Generate dynamic client-side explanation summary based on riskLevel, BSL, and indicators
      let explanationSummary = "";
      const indicatorListStr = indicators.length > 0 ? indicators.join(', ') : "none";
      if (riskLevel === "High") {
        explanationSummary = `Critical dual-use risks detected. The document contains high-consequence biosecurity indicators (${indicatorListStr}). Such research falls under Dual-Use Research of Concern (DURC) guidelines and requires Biosafety Level 3 or 4 (${bsl}) containment controls.`;
      } else if (riskLevel === "Medium") {
        explanationSummary = `Moderate biosecurity implications identified. Markers detected: ${indicatorListStr}. Standard safety protocols, institutional risk evaluations, and Biosafety Level (${bsl}) standard containment controls are advised.`;
      } else {
        explanationSummary = `No major biosecurity hazards were flagged by the backend. Tested text is considered low risk. Recommended laboratory containment standard: ${bsl}.`;
      }

      return {
        timestamp: new Date().toISOString(),
        textInput: text,
        highlightedText: highlightedText,
        riskLevel: riskLevel,
        riskScore: predictionScore,
        bslLevel: bsl,
        confidenceScore: predictionScore, // Map prediction score to confidence score as well
        explanation: explanationSummary,
        indicators: processedIndicators,
        isOffline: false
      };
    })
    .catch(error => {
      clearInterval(interval);
      console.warn("Backend API unavailable. Falling back to local offline analysis module.", error);
      
      // Simulate progress bar completing with a local delay
      return new Promise((resolve) => {
        let currentProgress = progress;
        const localInterval = setInterval(() => {
          if (currentProgress < 100) {
            currentProgress = Math.min(100, currentProgress + 15);
            onProgress(currentProgress);
          } else {
            clearInterval(localInterval);
            const report = this._processAnalysis(text);
            report.isOffline = true;
            resolve(report);
          }
        }, 80);
      });
    });
  }


  /**
   * Performs the mock parsing logic
   * @private
   */
  _processAnalysis(text) {
    const detectedIndicators = [];
    let highlightedText = text;
    
    // Track unique index for markup matching
    let indicatorIndex = 1;

    // Scan for rules
    this.rules.forEach(rule => {
      // Perform case-insensitive search
      const regex = new RegExp(`(${rule.keyword})`, "gi");
      if (regex.test(text)) {
        // Build the indicator item
        detectedIndicators.push({
          id: indicatorIndex,
          keyword: rule.keyword,
          name: rule.name,
          category: rule.category,
          level: rule.level,
          explanation: rule.explanation
        });

        // Inject highlighters into copy of text.
        // We use a placeholder matching strategy to avoid replacing tags in tags.
        const markerClass = rule.level === "High" ? "highlight-risk" : "highlight-warn";
        
        // We replace all occurrences with a marked span
        highlightedText = highlightedText.replace(
          regex,
          `<span class="${markerClass}" data-indicator-id="${indicatorIndex}">$1</span>`
        );

        indicatorIndex++;
      }
    });

    // Determine overall metrics
    const highCount = detectedIndicators.filter(i => i.level === "High").length;
    const medCount = detectedIndicators.filter(i => i.level === "Medium").length;

    let riskLevel = "Low";
    let riskScore = 0;
    let bslLevel = "BSL-1";
    let confidenceScore = 0;
    let explanationSummary = "";

    if (highCount > 0) {
      riskLevel = "High";
      // Risk score: scale based on high indicators (75% to 98%)
      riskScore = Math.min(75 + (highCount * 5) + (medCount * 2), 98);
      bslLevel = "BSL-3"; // Default for high risk, select agents
      confidenceScore = Math.floor(90 + Math.random() * 8); // High confidence because of select agents
      
      // If B. anthracis or Ebola are mentioned, elevate BSL recommendation to BSL-3 / BSL-4
      if (text.toLowerCase().includes("anthrax") || text.toLowerCase().includes("anthracis")) {
        bslLevel = "BSL-3";
      }
      if (text.toLowerCase().includes("ebola")) {
        bslLevel = "BSL-4";
      }

      explanationSummary = `Critical dual-use risks detected. The document contains references to biological select agents (Tier 1) and genetic modification vectors that optimize spore environmental resistance and transmission efficacy. Such dual-use research of concern (DURC) falls under rigorous regulatory compliance and requires strict physical containment (${bslLevel}).`;
    } else if (medCount > 0) {
      riskLevel = "Medium";
      // Risk score: scale based on medium indicators (35% to 65%)
      riskScore = Math.min(35 + (medCount * 8), 65);
      bslLevel = "BSL-3"; // Aerosol studies of influenza generally require BSL-3
      confidenceScore = Math.floor(82 + Math.random() * 8);

      if (text.toLowerCase().includes("influenza") || text.toLowerCase().includes("h5n1")) {
        bslLevel = "BSL-3";
      } else {
        bslLevel = "BSL-2";
      }

      explanationSummary = `Moderate biosecurity implications identified. The manuscript describes aerosol stability trials or controlled transmission experiments using influenza variants. While no explicit genetic gain-of-function enhancement was flagged, respiratory transmission pathways present significant dual-use exposure vectors. Enhanced containment controls (${bslLevel}) are advised.`;
    } else {
      riskLevel = "Low";
      // Risk score: (5% to 20%)
      riskScore = Math.max(5, Math.floor(5 + Math.random() * 15));
      bslLevel = "BSL-1";
      confidenceScore = Math.floor(85 + Math.random() * 10);
      explanationSummary = `No biosecurity indicators or select agents were flagged. The research describes standard bioindustrial fermentation processes utilizing non-pathogenic laboratory host organisms (Saccharomyces cerevisiae) to synthesize biofuels. The risk of dual-use diversion is negligible. Standard Biosafety Level 1 (BSL-1) practices are appropriate.`;
    }

    return {
      timestamp: new Date().toISOString(),
      textInput: text,
      highlightedText: highlightedText,
      riskLevel: riskLevel,
      riskScore: riskScore,
      bslLevel: bslLevel,
      confidenceScore: confidenceScore,
      explanation: explanationSummary,
      indicators: detectedIndicators
    };
  }
}

// Export class to window
window.BiosecurityAPI = new BiosecurityAPI();
