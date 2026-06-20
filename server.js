const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

// Replicate biosecurity rules on the backend
const rules = [
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

/**
 * Performs biosecurity risk analysis on input text
 * @param {string} text - The abstract/paper text to analyze
 * @returns {object} Assessed risk details
 */
function analyzeText(text) {
  const detectedIndicators = [];
  
  rules.forEach(rule => {
    const regex = new RegExp(`(${rule.keyword})`, "gi");
    if (regex.test(text)) {
      detectedIndicators.push(rule.keyword);
    }
  });

  const highCount = rules.filter(r => detectedIndicators.includes(r.keyword) && r.level === "High").length;
  const medCount = rules.filter(r => detectedIndicators.includes(r.keyword) && r.level === "Medium").length;

  let riskLevel = "Low";
  let riskScore = 0;
  let bslLevel = "BSL-1";

  if (highCount > 0) {
    riskLevel = "High";
    riskScore = Math.min(75 + (highCount * 5) + (medCount * 2), 98);
    bslLevel = "BSL-3";
    if (text.toLowerCase().includes("anthrax") || text.toLowerCase().includes("anthracis")) {
      bslLevel = "BSL-3";
    }
    if (text.toLowerCase().includes("ebola")) {
      bslLevel = "BSL-4";
    }
  } else if (medCount > 0) {
    riskLevel = "Medium";
    riskScore = Math.min(35 + (medCount * 8), 65);
    if (text.toLowerCase().includes("influenza") || text.toLowerCase().includes("h5n1")) {
      bslLevel = "BSL-3";
    } else {
      bslLevel = "BSL-2";
    }
  } else {
    riskLevel = "Low";
    riskScore = Math.max(5, Math.floor(5 + Math.random() * 15));
    bslLevel = "BSL-1";
  }

  return {
    "Risk Level": riskLevel,
    "Prediction Score": riskScore,
    "Indicators": detectedIndicators,
    "BSL": bslLevel
  };
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf'
};

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // POST Route for Biosecurity Analysis
  if (pathname === '/api/analyze' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        if (!payload.text) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ error: "Missing 'text' property in payload" }));
          return;
        }

        const result = analyzeText(payload.text);
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(result));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: "Invalid JSON format" }));
      }
    });
    return;
  }

  // Static File Serving
  const cleanPath = pathname === '/' ? '/index.html' : pathname;
  const filePath = path.join(__dirname, cleanPath.substring(1));
  
  // Security check to prevent directory traversal
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Forbidden');
    return;
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h1>404 Not Found</h1>');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
