/* samples.js */

const academicSamples = {
  low: {
    title: "Optimizing Yeast Biofuel Production",
    authors: "Dr. Elena Rostova et al., Institute of Biotechnology",
    text: `Title: Metabolic Engineering of Saccharomyces cerevisiae for Enhanced Bioethanol Yields from Lignocellulosic Biomass.

Abstract:
Lignocellulosic biomass represents a sustainable substrate for renewable biofuel production. However, wild-type strains of Saccharomyces cerevisiae are inefficient at fermenting pentose sugars like xylose. In this work, we present a metabolic engineering approach to integrate xylose reductase and xylitol dehydrogenase genes from Scheffersomyces stipitis into the S. cerevisiae genome. 

We optimized the expression profiles using standard promoters and deletion of the endogenous GRE3 gene to reduce byproduct xylitol accumulation. The engineered strain (designated strain BY-X3) exhibited a 24% increase in bioethanol yield when grown on pretreated wheat straw hydrolysate. No pathogenetic pathways were introduced, and all experiments were conducted under standard Biosafety Level 1 (BSL-1) laboratory containment procedures using standard non-pathogenic industrial strains.`
  },
  medium: {
    title: "Aerosol Transmission of Influenza Strains",
    authors: "Prof. Arthur Pendelton, Department of Virology",
    text: `Title: Aerosol Stability and Transmission Characteristics of H5N1 Variants in Controlled Environmental Chambers.

Abstract:
Aerosol transmission remains a significant vector for the rapid dissemination of respiratory viruses. Understanding how environmental variables influence viral viability in droplets is key to designing public health containment interventions. In this study, we assessed the stability of three distinct variants of influenza A virus (H5N1 subtype) under varying humidity and temperature profiles.

Using a custom-built, hermetically sealed aerosol exposure chamber (Biosafety Level 3 compliant), we generated controlled droplets (diameter 1–5 micrometers) containing viral suspensions. We observed that lower relative humidity (20–30%) significantly correlates with prolonged viral half-life in airborne states. Crucially, while our results clarify the physical parameters governing droplet infectivity, the viral isolates tested were restricted to wild-type avian lineages with no genetic modifications designed to increase mammalian host affinity. Strict respiratory containment was maintained to prevent any laboratory exposure.`
  },
  high: {
    title: "Genetic Enhancement of Anthrax Spores",
    authors: "Classified Source (DURC Alert Simulation)",
    text: `Title: Enhancing Environmental Resistance and Aerosolization Efficiency of Bacillus anthracis via Plasmid-Mediated Spore Wall Modifications.

Abstract:
Bacillus anthracis is a spore-forming bacterium responsible for anthrax, a severe infectious disease with dual-use biosecurity implications. Standard spore preparation procedures often suffer from aggregation, reducing the effectiveness of inhalation-based delivery vectors. Here, we describe a method for genetic optimization of the spore coat. 

By inserting the recombinant plasmid pEAW-09 containing mutated exosporium collagen-like protein genes (bclA) under the control of a strong sporulation-specific promoter, we successfully altered the outer spore coat surface hydrophobicity. The modified spores demonstrated a 3-fold reduction in static aggregation, facilitating aerosolization. 

Furthermore, we introduced point mutations in the gerA receptor operon, which resulted in rapid germination kinetics upon contact with mammalian serum, effectively bypassing standard host vaccine-induced immunity. This research indicates that minor genetic modifications can significantly enhance both the physical dissemination and lethality of Select Agents.`
  }
};

// Export to window object for access across modules
window.academicSamples = academicSamples;
