/* api.js */

class BiosecurityAPI {
  constructor() {
    // Defined rules for keyword scanning & explaining
    this.rules = [
      {
        keyword: "Bacillus anthracis",
        name: "Bacillus anthracis",
        title: "Bacillus anthracis",
        category: "Pathogen Identification",
        level: "High",
        severity: "High",
        meaning: "A Tier 1 select biological agent (bacteria) that causes anthrax.",
        whyFlagged: "It has high lethality, extreme environmental persistence, and a historical association with biological weapons."
      },
      {
        keyword: "anthrax",
        name: "Anthrax",
        title: "Anthrax",
        category: "Pathogen Identification",
        level: "High",
        severity: "High",
        meaning: "The serious bacterial disease caused by Bacillus anthracis.",
        whyFlagged: "Any discussion of anthrax research flags significant biosecurity oversight requirements due to its history of weaponization."
      },
      {
        keyword: "Ebola",
        name: "Ebola",
        title: "Ebola",
        category: "Pathogen Identification",
        level: "High",
        severity: "High",
        meaning: "A high-consequence virus that causes severe hemorrhagic fever in humans.",
        whyFlagged: "Ebola is highly lethal with limited treatment options, requiring maximum Biosafety Level 4 (BSL-4) containment."
      },
      {
        keyword: "aerosolization",
        name: "Aerosolization",
        title: "Aerosolization",
        category: "Dissemination & Delivery",
        level: "High",
        severity: "High",
        meaning: "The physical process of suspending biological particles or liquids in the air.",
        whyFlagged: "Optimizing aerosolization enables inhalation delivery, which is the primary pathway of concern for biological weapons."
      },
      {
        keyword: "vaccine-induced immunity",
        name: "Vaccine-Induced Immunity Evasion",
        title: "Vaccine-Induced Immunity Evasion",
        category: "Host-Pathogen Interactions",
        level: "High",
        severity: "High",
        meaning: "Modifying a pathogen to bypass the protection provided by existing vaccines.",
        whyFlagged: "Evasion of vaccines renders medical countermeasures useless, which can trigger uncontrollable outbreaks."
      },
      {
        keyword: "lethality",
        name: "Lethality",
        title: "Lethality",
        category: "Functional Modification",
        level: "High",
        severity: "High",
        meaning: "The capability of a pathogen or biological toxin to cause death.",
        whyFlagged: "Enhancing lethality directly increases the severity of public health consequences if the agent is released."
      },
      {
        keyword: "spore wall modifications",
        name: "Spore Wall Modifications",
        title: "Spore Wall Modifications",
        category: "Dissemination & Delivery",
        level: "High",
        severity: "High",
        meaning: "Altering the outer shell of bacterial spores to prevent them from clumping together.",
        whyFlagged: "This physical modification keeps spores suspended in the air longer, increasing the inhalation risk."
      },
      {
        keyword: "exosporium",
        name: "Exosporium",
        title: "Exosporium",
        category: "Functional Modification",
        level: "High",
        severity: "High",
        meaning: "The balloon-like outermost layer of certain bacterial spores.",
        whyFlagged: "Altering the exosporium changes how spores disperse and persist in the environment, which can optimize delivery."
      },
      {
        keyword: "H5N1",
        name: "H5N1",
        title: "H5N1",
        category: "Pathogen Identification",
        level: "Medium",
        severity: "Medium",
        meaning: "A highly pathogenic strain of avian influenza (bird flu) virus.",
        whyFlagged: "H5N1 has a high mortality rate in birds and humans; research on its transmission carries pandemic risk."
      },
      {
        keyword: "aerosol transmission",
        name: "Aerosol Transmission",
        title: "Aerosol Transmission",
        category: "Transmission Potential",
        level: "Medium",
        severity: "Medium",
        meaning: "The spread of biological agents through fine airborne droplets.",
        whyFlagged: "Investigating airborne pathways is vital for public health but carries dual-use risk if transmission efficiency is enhanced."
      },
      {
        keyword: "exposure chamber",
        name: "Exposure Chamber",
        title: "Exposure Chamber",
        category: "Experimental Apparatus",
        level: "Medium",
        severity: "Medium",
        meaning: "A specialized laboratory enclosure used to expose biological targets to aerosols.",
        whyFlagged: "This equipment indicates active research into inhalation infectivity and airborne transmission parameters."
      },
      {
        keyword: "dual-use",
        name: "Dual Use",
        title: "Dual Use",
        category: "Policy Compliance",
        level: "Medium",
        severity: "Medium",
        meaning: "Technologies or biological materials with both beneficial civilian and harmful military applications.",
        whyFlagged: "Explicit mention highlights awareness of regulatory oversight and Institutional Biosafety Committee review."
      },
      {
        keyword: "pathogen",
        name: "Pathogen",
        title: "Pathogen",
        category: "Pathogen Identification",
        level: "Medium",
        severity: "Medium",
        meaning: "Any microorganism (like a virus, bacterium, or fungus) that causes disease.",
        whyFlagged: "Identifying pathogenic research establishes the baseline biosafety precautions required for the laboratory."
      },
      {
        keyword: "transmission",
        name: "Transmission",
        title: "Transmission",
        category: "Transmission Potential",
        level: "Medium",
        severity: "Medium",
        meaning: "The movement of an infectious agent from one host to another.",
        whyFlagged: "Studies analyzing transmission dynamics require monitoring to prevent the creation of highly contagious strains."
      },
      {
        keyword: "crispr",
        name: "CRISPR",
        title: "CRISPR",
        category: "Genetic Engineering",
        level: "Medium",
        severity: "Medium",
        meaning: "A molecular technology used to make precise, targeted edits to DNA sequences.",
        whyFlagged: "CRISPR is a widely used tool with many legitimate research and medical applications. It only becomes a biosecurity concern when combined with pathogen modification, virulence enhancement, transmission enhancement, or other dual-use indicators."
      },
      {
        keyword: "gene editing",
        name: "Gene Editing",
        title: "Gene Editing",
        category: "Genetic Engineering",
        level: "Medium",
        severity: "Medium",
        meaning: "A set of technologies that enable scientists to change an organism's genetic material.",
        whyFlagged: "These methods have broad positive medical applications, but are flagged because they can alter biological agent characteristics. They present biosecurity risks only when modifying pathogens to enhance virulence or transmission."
      },
      {
        keyword: "genetic engineering",
        name: "Genetic Engineering",
        title: "Genetic Engineering",
        category: "Genetic Engineering",
        level: "Medium",
        severity: "Medium",
        meaning: "The direct modification of an organism's genes using biotechnology.",
        whyFlagged: "Widely used in agriculture and medicine, genetic engineering is flagged because it can alter biological agents. It becomes a biosecurity concern only when combined with pathogen modification, virulence enhancement, or transmission enhancement."
      },
      {
        keyword: "gain of function",
        name: "Gain of Function",
        title: "Gain of Function",
        category: "Functional Modification",
        level: "High",
        severity: "High",
        meaning: "Research that enhances a pathogen's transmissibility, lethality, host range, or immune evasion.",
        whyFlagged: "Enhancing pathogenic traits carries significant biosafety risk and requires rigorous institutional and federal oversight."
      },
      {
        keyword: "toxin",
        name: "Toxin",
        title: "Toxin",
        category: "Pathogen Identification",
        level: "High",
        severity: "High",
        meaning: "A poisonous substance produced by a living organism (e.g., ricin, botulinum).",
        whyFlagged: "Biological toxins are extremely potent chemical/biological threats, and their modification or synthesis is heavily regulated."
      },
      {
        keyword: "biosafety",
        name: "Biosafety",
        title: "Biosafety",
        category: "Policy Compliance",
        level: "Medium",
        severity: "Medium",
        meaning: "The collection of containment principles and safety practices used when handling infectious materials.",
        whyFlagged: "Ensuring proper biosafety containment standards prevents accidental release or exposure to laboratory personnel."
      },
      {
        keyword: "virulence",
        name: "Virulence",
        title: "Virulence",
        category: "Functional Modification",
        level: "High",
        severity: "High",
        meaning: "Ability of a pathogen to cause disease severity.",
        whyFlagged: "Research discussing increased virulence may indicate enhancement of disease-causing capability."
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
          title: matchingRule ? (matchingRule.title || matchingRule.name) : `Detected Indicator (${indicatorKeyword})`,
          category: matchingRule ? matchingRule.category : "Biosecurity Indicator",
          level: matchingRule ? matchingRule.level : riskLevel,
          severity: matchingRule ? (matchingRule.severity || matchingRule.level) : riskLevel,
          meaning: matchingRule ? matchingRule.meaning : "An indicator identified by the system.",
          whyFlagged: matchingRule ? matchingRule.whyFlagged : "Flagged as a potential indicator of concern.",
          explanation: matchingRule ? (matchingRule.whyFlagged || matchingRule.explanation) : `The indicator '${indicatorKeyword}' was identified by the backend model as a potential biosecurity risk marker.`
        };

        processedIndicators.push(ruleObj);

        // Inject highlight tags into copy of text
        const regex = new RegExp(`(${escapeRegExp(indicatorKeyword)})`, "gi");
        const markerClass = ruleObj.level === "High" ? "highlight-risk" : "highlight-warn";
        highlightedText = highlightedText.replace(regex, `<span class="${markerClass}" data-indicator-id="${indicatorIndex}">$1</span>`);
        
        indicatorIndex++;
      });

      // Generate dynamic client-side explanation summary based on riskLevel, BSL, and indicators
      const explanationSummary = this._generateExplanationSummary(riskLevel, processedIndicators);
      const classificationReason = this._generateClassificationReason(riskLevel, bsl, processedIndicators);

      return {
        timestamp: new Date().toISOString(),
        textInput: text,
        highlightedText: highlightedText,
        riskLevel: riskLevel,
        riskScore: predictionScore,
        bslLevel: bsl,
        confidenceScore: predictionScore, // Map prediction score to confidence score as well
        explanation: explanationSummary,
        classificationReason: classificationReason,
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

  _generateExplanationSummary(riskLevel, indicators) {
    if (riskLevel === "Low" || !indicators || indicators.length === 0) {
      return `No major biosecurity indicators were detected.
The document appears focused on standard biomedical or life-science research without evidence of pathogen enhancement, transmission optimization, or dual-use concerns.`;
    }

    const groups = [];
    const lowercaseInds = indicators.map(ind => ind.keyword.toLowerCase());

    const hasVirulence = lowercaseInds.some(ind => ["virulence", "lethality", "gain of function", "toxin", "vaccine-induced immunity"].includes(ind));
    const hasAerosol = lowercaseInds.some(ind => ["aerosol transmission", "aerosolization", "spore wall modifications", "exosporium", "exposure chamber", "transmission"].includes(ind));
    const hasPathogen = lowercaseInds.some(ind => ["bacillus anthracis", "anthrax", "ebola", "pathogen"].includes(ind));
    const hasGenetic = lowercaseInds.some(ind => ["crispr", "gene editing", "genetic engineering"].includes(ind));
    const hasPolicy = lowercaseInds.some(ind => ["dual-use", "dual use", "biosafety"].includes(ind));

    if (hasVirulence) groups.push("Virulence enhancement indicators");
    if (hasAerosol) groups.push("Aerosol transmission indicators");
    if (hasPathogen) groups.push("Pathogen-related research terms");
    if (hasGenetic) groups.push("Genetic engineering methods");
    if (hasPolicy) groups.push("Policy & compliance terms");

    if (groups.length === 0) {
      groups.push("Potential biosecurity risk markers");
    }

    const bullets = groups.map(g => `• ${g}`).join("\n");
    
    return `${riskLevel} Risk was assigned because the document contains:
${bullets}

These indicators are commonly associated with dual-use biological research requiring additional review.`;
  }

  _generateClassificationReason(riskLevel, bslLevel, indicators) {
    if (!indicators || indicators.length === 0) {
      return `The document was classified as LOW RISK because no biosecurity or dual-use indicators were detected. The content represents standard biological research, and therefore ${bslLevel} containment is recommended.`;
    }

    // Format indicators list into a natural English string: "A", "both A and B", or "A, B, and C"
    const formattedIndicators = indicators.map(ind => ind.keyword.toLowerCase());
    let indicatorsText = "";
    if (formattedIndicators.length === 1) {
      indicatorsText = `the "${formattedIndicators[0]}" indicator was`;
    } else if (formattedIndicators.length === 2) {
      indicatorsText = `both "${formattedIndicators[0]}" and "${formattedIndicators[1]}" indicators were`;
    } else {
      const listStr = formattedIndicators.slice(0, -1).map(i => `"${i}"`).join(", ");
      indicatorsText = `${listStr}, and "${formattedIndicators[formattedIndicators.length - 1]}" indicators were`;
    }

    // Map indicators to their semantic categories
    const categories = [];
    formattedIndicators.forEach(ind => {
      if (ind.includes("anthracis") || ind.includes("anthrax")) {
        categories.push("research involving Tier 1 select agents");
      } else if (ind.includes("ebola")) {
        categories.push("highly lethal viral pathogens");
      } else if (ind.includes("aerosol") || ind.includes("spore wall") || ind.includes("exosporium") || ind.includes("chamber")) {
        categories.push("airborne dissemination potential");
      } else if (ind.includes("immunity")) {
        categories.push("immune evasion and countermeasure resistance");
      } else if (ind.includes("lethality") || ind.includes("virulence") || ind.includes("gain of function") || ind.includes("toxin")) {
        categories.push("increased pathogen impact and hazard enhancement");
      } else if (ind.includes("h5n1") || ind.includes("pathogen") || ind.includes("transmission")) {
        categories.push("pathogen studies and transmission risk");
      } else if (ind.includes("crispr") || ind.includes("gene editing") || ind.includes("genetic engineering")) {
        categories.push("gene modification technologies");
      } else if (ind.includes("dual") || ind.includes("biosafety")) {
        categories.push("dual-use policies and containment");
      }
    });

    // Deduplicate categories
    const uniqueCategories = [...new Set(categories)];
    let categorySummary = "";
    if (uniqueCategories.length === 0) {
      categorySummary = "research involving biological safety risks";
    } else if (uniqueCategories.length === 1) {
      categorySummary = uniqueCategories[0];
    } else if (uniqueCategories.length === 2) {
      categorySummary = `${uniqueCategories[0]} and ${uniqueCategories[1]}`;
    } else {
      categorySummary = `${uniqueCategories.slice(0, -1).join(", ")}, and ${uniqueCategories[uniqueCategories.length - 1]}`;
    }

    // Why BSL was recommended
    let bslReason = "";
    if (bslLevel === "BSL-4") {
      bslReason = "maximum containment (BSL-4) is recommended to prevent exposure to lethal agents with no widely available treatment";
    } else if (bslLevel === "BSL-3") {
      bslReason = "BSL-3 containment is recommended to control inhalation risks and restrict access to dangerous pathogens that may spread through the air";
    } else if (bslLevel === "BSL-2") {
      bslReason = "BSL-2 containment is recommended for moderate-risk biological agents that require restricted access";
    } else {
      bslReason = "BSL-1 containment is sufficient for low-risk, standard laboratory procedures";
    }

    return `The document was classified as ${riskLevel.toUpperCase()} RISK because ${indicatorsText} detected. Together these suggest ${categorySummary}. Therefore, ${bslReason}.`;
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
          title: rule.title || rule.name,
          category: rule.category,
          level: rule.level,
          severity: rule.severity || rule.level,
          meaning: rule.meaning,
          whyFlagged: rule.whyFlagged,
          explanation: rule.whyFlagged || rule.explanation
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
    } else if (medCount > 0) {
      riskLevel = "Medium";
      // Risk score: scale based on medium indicators (35% to 65%)
      riskScore = Math.min(35 + (medCount * 8), 65);
      bslLevel = "BSL-2"; // default
      confidenceScore = Math.floor(82 + Math.random() * 8);

      if (text.toLowerCase().includes("influenza") || text.toLowerCase().includes("h5n1") || text.toLowerCase().includes("aerosol")) {
        bslLevel = "BSL-3";
      } else {
        bslLevel = "BSL-2";
      }
    } else {
      riskLevel = "Low";
      // Risk score: (5% to 20%)
      riskScore = Math.max(5, Math.floor(5 + Math.random() * 15));
      bslLevel = "BSL-1";
      confidenceScore = Math.floor(85 + Math.random() * 10);
    }

    explanationSummary = this._generateExplanationSummary(riskLevel, detectedIndicators);
    const classificationReason = this._generateClassificationReason(riskLevel, bslLevel, detectedIndicators);

    return {
      timestamp: new Date().toISOString(),
      textInput: text,
      highlightedText: highlightedText,
      riskLevel: riskLevel,
      riskScore: riskScore,
      bslLevel: bslLevel,
      confidenceScore: confidenceScore,
      explanation: explanationSummary,
      classificationReason: classificationReason,
      indicators: detectedIndicators
    };
  }
}

// Export class to window
window.BiosecurityAPI = new BiosecurityAPI();

