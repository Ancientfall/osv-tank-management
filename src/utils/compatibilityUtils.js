// src/utils/compatibilityUtils.js
import { fluidTypes } from '../data/appData'; // Import fluidTypes

// Helper function to determine compatibility level from string description
const getCompatibilityLevelFromString = (compatString) => {
  if (!compatString) return 0;
  
  if (compatString.startsWith("OK") && !compatString.includes("Residue")) {
    return 2; // Fully compatible
  } else if (compatString.startsWith("OK; Residue")) {
    return 1; // Requires cleaning or has conditions
  } else if (compatString.includes("maintenance cleaned")) {
    return 0; // Requires maintenance cleaning
  } else if (compatString.includes("completion cleaned") || compatString.startsWith("NOT OK")) {
    return 0; // Requires full cleaning or incompatible
  }
  return 0; // Default to incompatible if unrecognized
};

// Build compatibility matrix from the provided data
const buildCompatibilityMatrix = () => {
  const matrix = {};
  const allFluids = fluidTypes.map(fluid => fluid.name);
  
  allFluids.forEach(currentFluid => {
    matrix[currentFluid] = {};
    allFluids.forEach(newFluid => {
      matrix[currentFluid][newFluid] = 0; // Default to incompatible
    });
  });
  
  const compatibilityData = [
    // ... (Your existing compatibilityData array - keep it short for brevity here, but use your full one)
    { current: "M-I SWACO SBM - RHELIANT", new: "M-I SWACO SBM - RHELIANT", compatibility: "OK" },
    // ... more data
    ...fluidTypes.filter(fluid => fluid.name !== "Empty").map(fluid => ({
      current: "Empty", 
      new: fluid.name, 
      compatibility: "OK"
    }))
  ];
  
  compatibilityData.forEach(data => {
    if (matrix[data.current] && matrix[data.current].hasOwnProperty(data.new)) { // Check properties exist
        matrix[data.current][data.new] = getCompatibilityLevelFromString(data.compatibility);
    }
  });
  
  const fullMatrixText = `Adding To Tank/In Tank,M-I SWACO SBM - RHELIANT,M-I SWACO SBM - RHEGUARD,M-I SWACO - Pre-Mix,M-I SWACO - BASE OIL,BAROID SBM - ENCORE,BAROID SBM - BaraECD,BAROID SBM - Pre-Mix,BAROID SBM - BASE OIL,BHGE SBM - RHEO-LOGIC,BHGE SBM - DELTA-TEQ DW,BHGE - Pre-Mix,BHGE - BASE OIL,RISERLESS,CaCl2,CaBr2,CaCl2 /CaBr2,CaBr2/PG,CaCl2/PG,KCl,%5 NH4Cl
M-I SWACO SBM - RHELIANT ,OK,OK,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls
M-I SWACO SBM - RHEGUARD ,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls
M-I SWACO SBM - Pre-Mix,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,NO; Tank must be maintenance cleaned first,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,NO; Tank must be maintenance cleaned first,NO; Tank must be maintenance cleaned first,NO; Tank must be maintenance cleaned first
M-I SWACO SBM - BASE OIL,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,OK,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,OK,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,OK,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned
BAROID SBM - ENCORE,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK,OK,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls
BAROID SBM - BaraECD,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls
BAROID SBM - Pre-mix,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,NO; Tank must be maintenance cleaned first,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,NO; Tank must be maintenance cleaned first,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,NO; Tank must be maintenance cleaned first,NO; Tank must be maintenance cleaned first,NO; Tank must be maintenance cleaned first
BAROID SBM - Base Oil,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,OK,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,OK,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,OK,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned
BHGE SBM - RHEO-LOGIC,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK,OK,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls
BHGE SBM - DELTA-TEQ DW,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls
BHGE SBM - Pre-mix,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,NO; Tank must be maintenance cleaned first,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK,OK; Residue <= 5 bbls; Tank > 1000 bbls,NO; Tank must be maintenance cleaned first,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,NO; Tank must be maintenance cleaned first,NO; Tank must be maintenance cleaned first,NO; Tank must be maintenance cleaned first
BHGE SBM - Base Oil,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,OK,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,OK,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned
RISERLESS - WBM,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,OK,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,NO; Tank must be maintenance cleaned first,NO; Tank must be maintenance cleaned first,NO; Tank must be maintenance cleaned first
CaCl2,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,OK,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,NO; Tank must be maintenance cleaned first,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,NO; Tank must be maintenance cleaned first
CaBr2,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NO; Tank must be maintenance cleaned first,OK,NO; Tank must be maintenance cleaned first,OK; Residue <= 5 bbls; Tank > 1000 bbls,NO; Tank must be maintenance cleaned first,NO; Tank must be maintenance cleaned first,NO; Tank must be maintenance cleaned first
CaCl2 /CaBr2,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,NO; Tank must be maintenance cleaned first
CaBr2/PG,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NO; Tank must be maintenance cleaned first,OK; Residue <= 5 bbls; Tank > 1000 bbls,NO; Tank must be maintenance cleaned first,OK,NO; Tank must be maintenance cleaned first,OK; Residue <= 5 bbls; Tank > 1000 bbls,NO; Tank must be maintenance cleaned first
CaCl2/PG,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,OK; Residue <= 5 bbls; Tank > 1000 bbls,NO; Tank must be maintenance cleaned first,NO; Tank must be maintenance cleaned first,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK,OK; Residue <= 5 bbls; Tank > 1000 bbls,NO; Tank must be maintenance cleaned first
KCl,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK; Residue <= 5 bbls; Tank > 1000 bbls,OK,NO; Tank must be maintenance cleaned first
%5 NH4Cl,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NOT OK; must be completion cleaned,NO; Tank must be maintenance cleaned first,NO; Tank must be maintenance cleaned first,NO; Tank must be maintenance cleaned first,NO; Tank must be maintenance cleaned first,NO; Tank must be maintenance cleaned first,NO; Tank must be maintenance cleaned first,OK
`;
  
  const rows = fullMatrixText.trim().split('\n');
  const headers = rows[0].split(',').map(header => header.trim());
  
  for(let i = 1; i < rows.length; i++) {
    const rowData = rows[i].split(',');
    const currentFluid = rowData[0].trim();
    
    if (!matrix.hasOwnProperty(currentFluid)) {
      continue;
    }
    
    for(let j = 1; j < rowData.length; j++) {
      const newFluid = headers[j];
      const compatString = rowData[j].trim();
      
      if (matrix[currentFluid] && matrix[currentFluid].hasOwnProperty(newFluid)) { // Check properties exist
        matrix[currentFluid][newFluid] = getCompatibilityLevelFromString(compatString);
      }
    }
  }
  
  return matrix;
};

export const compatibilityMatrix = buildCompatibilityMatrix();

// Get compatibility level between current and new fluid
export const getCompatibilityLevel = (currentContents, newFluid) => {
  if (!compatibilityMatrix[currentContents] || 
      !compatibilityMatrix[currentContents][newFluid]) {
    return 0; // Default to incompatible if not found in matrix
  }
  return compatibilityMatrix[currentContents][newFluid];
};