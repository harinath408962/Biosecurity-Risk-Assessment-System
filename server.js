const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

// Replicate biosecurity rules on the backend
const rules = [
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

  if (pathname === '/' && req.method === 'HEAD') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end();
    return;
  }


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
