// src/data/appData.js

export const vessels = [
  {
    id: 1,
    name: "M/V Pelican Island",
    lastUpdated: "2025-05-05 12:39",
    tanks: [
      // Pump System 1 (Tk 1-4 S/P)
      { id: "Tk 1S", type: "LIQUID", capacity: 1540, currentLevel: 800, contents: "Liquid Mud", history: "Liquid Mud", lastCleaning: "08.02.2025", pressure: 2.0, client: "Deepwater Invictus", pumpSystemId: 1 },
      { id: "Tk 1P", type: "LIQUID", capacity: 1540, currentLevel: 800, contents: "Liquid Mud", history: "Liquid Mud", lastCleaning: "08.02.2025", pressure: 2.0, client: "Deepwater Invictus", pumpSystemId: 1 },
      { id: "Tk 2S", type: "LIQUID", capacity: 1540, currentLevel: 0, contents: "Empty", history: "Liquid Mud", lastCleaning: "08.02.2025", pressure: 0, client: "Deepwater Invictus", pumpSystemId: 1 },
      { id: "Tk 2P", type: "LIQUID", capacity: 1540, currentLevel: 0, contents: "Empty", history: "Liquid Mud", lastCleaning: "08.02.2025", pressure: 0, client: "Deepwater Invictus", pumpSystemId: 1 },
      { id: "Tk 3S", type: "LIQUID", capacity: 1600, currentLevel: 800, contents: "Water based mud", history: "Water based mud", lastCleaning: "08.02.2025", pressure: 2.1, client: "Deepwater Invictus", pumpSystemId: 1 },
      { id: "Tk 3P", type: "LIQUID", capacity: 1600, currentLevel: 750, contents: "Liquid Mud", history: "Liquid Mud", lastCleaning: "08.02.2025", pressure: 1.9, client: "Stena IceMAX", pumpSystemId: 1 },
      { id: "Tk 4S", type: "LIQUID", capacity: 1600, currentLevel: 0, contents: "Empty", history: "Empty", lastCleaning: "01.03.2025", pressure: 0, client: null, pumpSystemId: 1 },
      { id: "Tk 4P", type: "LIQUID", capacity: 1600, currentLevel: 0, contents: "Empty", history: "Empty", lastCleaning: "01.03.2025", pressure: 0, client: null, pumpSystemId: 1 },

      // Pump System 2 (Tk 5S/P)
      { id: "Tk 5S", type: "LIQUID", capacity: 1000, currentLevel: 0, contents: "Empty", history: "Empty", lastCleaning: "15.03.2025", pressure: 0, client: null, pumpSystemId: 2 },
      { id: "Tk 5P", type: "LIQUID", capacity: 1000, currentLevel: 0, contents: "Empty", history: "Empty", lastCleaning: "15.03.2025", pressure: 0, client: null, pumpSystemId: 2 },

      // Pump System 3 (Tk 6S/P)
      { id: "Tk 6S", type: "LIQUID", capacity: 1000, currentLevel: 0, contents: "Empty", history: "Empty", lastCleaning: "20.03.2025", pressure: 0, client: null, pumpSystemId: 3 },
      { id: "Tk 6P", type: "LIQUID", capacity: 1000, currentLevel: 0, contents: "Empty", history: "Empty", lastCleaning: "20.03.2025", pressure: 0, client: null, pumpSystemId: 3 },
      
      // Pump System 4 (Methanol)
      { id: "Meth 1S", type: "METHANOL", capacity: 455, currentLevel: 0, contents: "Empty", history: "Methanol", lastCleaning: "22.09.2021", pressure: 0, client: "Na Kika", pumpSystemId: 4 },
      { id: "Meth 1P", type: "METHANOL", capacity: 455, currentLevel: 400, contents: "Methanol", history: "Methanol", lastCleaning: "22.09.2021", pressure: 2.0, client: "Na Kika", pumpSystemId: 4 },
      
      // Pump System 5 (Slop)
      { id: "Slop 1S", type: "SLOP", capacity: 1060, currentLevel: 450, contents: "Trash Fluid", history: "Trash Fluid", lastCleaning: "04.09.2024", pressure: 1.8, client: null, pumpSystemId: 5 },
      { id: "Slop 1P", type: "SLOP", capacity: 1060, currentLevel: 600, contents: "Trash Fluid", history: "Trash Fluid", lastCleaning: "04.09.2024", pressure: 1.5, client: null, pumpSystemId: 5 },
      
      // Pump System 6 (Dry Bulk - Total of 5 tanks)
      { id: "Dry Bulk 1", type: "DRY BULK", capacity: 2613, currentLevel: 0, contents: "Empty", history: "cement", lastCleaning: "15.01.2025", pressure: 0, client: null, pumpSystemId: 6 },
      { id: "Dry Bulk 2", type: "DRY BULK", capacity: 2613, currentLevel: 0, contents: "Empty", history: "cement", lastCleaning: "08.02.2025", pressure: 0, client: null, pumpSystemId: 6 },
      { id: "Dry Bulk 3", type: "DRY BULK", capacity: 2500, currentLevel: 0, contents: "Empty", history: "barite", lastCleaning: "10.02.2025", pressure: 0, client: null, pumpSystemId: 6 },
      { id: "Dry Bulk 4", type: "DRY BULK", capacity: 2500, currentLevel: 0, contents: "Empty", history: "barite", lastCleaning: "12.02.2025", pressure: 0, client: null, pumpSystemId: 6 },
      { id: "Dry Bulk 5", type: "DRY BULK", capacity: 2000, currentLevel: 0, contents: "Empty", history: "bentonite", lastCleaning: "14.02.2025", pressure: 0, client: null, pumpSystemId: 6 },
    ]
  }
  // M/V Gulf Carrier object has been removed
];

export const clients = [
  { id: 1, name: "Deepwater Invictus", location: "Gulf of Mexico" },
  { id: 2, name: "Na Kika", location: "Gulf of Mexico" },
  { id: 3, name: "Stena IceMAX", location: "Gulf of Mexico" }
];

export const fluidTypes = [
  // ... (fluidTypes data remains the same)
  { id: "mi_rheliant", name: "M-I SWACO SBM - RHELIANT", color: "#8884d8", type: "SBM" },
  { id: "mi_rheguard", name: "M-I SWACO SBM - RHEGUARD", color: "#7a67ee", type: "SBM" },
  { id: "mi_premix", name: "M-I SWACO - Pre-Mix", color: "#6b46fa", type: "SBM" },
  { id: "mi_baseoil", name: "M-I SWACO - BASE OIL", color: "#5c25f6", type: "SBM" },
  { id: "baroid_encore", name: "BAROID SBM - ENCORE", color: "#82ca9d", type: "SBM" },
  { id: "baroid_baraecd", name: "BAROID SBM - BaraECD", color: "#66c89f", type: "SBM" },
  { id: "baroid_premix", name: "BAROID SBM - Pre-Mix", color: "#4ac6a1", type: "SBM" },
  { id: "baroid_baseoil", name: "BAROID SBM - BASE OIL", color: "#2ec4a3", type: "SBM" },
  { id: "bhge_rheologic", name: "BHGE SBM - RHEO-LOGIC", color: "#ffc658", type: "SBM" },
  { id: "bhge_deltateq", name: "BHGE SBM - DELTA-TEQ DW", color: "#ffa62e", type: "SBM" },
  { id: "bhge_premix", name: "BHGE SBM - Pre-Mix", color: "#ff8504", type: "SBM" },
  { id: "bhge_baseoil", name: "BHGE SBM - BASE OIL", color: "#fa6400", type: "SBM" },
  { id: "riserless", name: "RISERLESS", color: "#a4de6c", type: "WBM" },
  { id: "cacl2", name: "CaCl2", color: "#91d742", type: "BRINE" },
  { id: "cabr2", name: "CaBr2", color: "#7ed018", type: "BRINE" },
  { id: "cacl2_cabr2", name: "CaCl2/CaBr2", color: "#6bc900", type: "BRINE" },
  { id: "cabr2_pg", name: "CaBr2/PG", color: "#d0211c", type: "BRINE" },
  { id: "cacl2_pg", name: "CaCl2/PG", color: "#b01d19", type: "BRINE" },
  { id: "kcl", name: "KCl", color: "#0088FE", type: "BRINE" },
  { id: "nh4cl", name: "%5 NH4Cl", color: "#0066cc", type: "BRINE" },
  { id: "empty", name: "Empty", color: "#cccccc", type: "EMPTY" }
];

export const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];