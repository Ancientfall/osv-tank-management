// src/components/FleetViewTab.jsx
import React, { useState, useMemo } from 'react';
import { 
  Ship, 
  Droplets, 
  AlertTriangle, 
  CheckCircle, 
  Star, 
  BarChart3, 
  Users, 
  Calendar,
  Fuel,
  Waves,
  Filter,
  Eye,
  Settings,
  Info,
  X
} from 'lucide-react';
import { getStatusColor, getClientColor } from '../utils/uiHelpers.jsx';
import { getCompatibilityLevel } from '../utils/compatibilityUtils';

const FleetViewTab = ({ vessels, onSelectVessel }) => {
  const [selectedFluid, setSelectedFluid] = useState('');
  const [sortBy, setSortBy] = useState('bestCandidate'); // bestCandidate, name, capacity, availability
  const [filterBy, setFilterBy] = useState('all'); // all, compatible, available, tagged
  const [viewMode, setViewMode] = useState('cards'); // cards, compact

  // Add safety check for vessels
  if (!vessels || !Array.isArray(vessels)) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Vessel Data Available</h3>
          <p className="text-gray-600">Please check that vessel data is properly loaded.</p>
        </div>
      </div>
    );
  }

  // Define fluid categories and their compatible tank types
  const fluidCategories = {
    'Drilling Fluids': {
      fluids: ['Base Oil', 'Premix', 'Water Based Mud', 'Synthetic Based Mud'],
      compatibleTanks: ['LIQUID'],
      description: 'Oil-based and water-based drilling fluids'
    },
    'Brines': {
      fluids: ['CaBr2', 'CaBr2/CaCl2', 'CaCl2', 'NaBr', 'NaCl', 'KCl', 'Completion Fluid'],
      compatibleTanks: ['LIQUID'],
      description: 'Various brine solutions and completion fluids'
    },
    'Methanol': {
      fluids: ['Methanol'],
      compatibleTanks: ['METHANOL'],
      description: 'Methanol and methanol-based solutions'
    },
    'Waste Fluids': {
      fluids: ['Trash Fluid', 'Waste Oil', 'Contaminated Fluid'],
      compatibleTanks: ['SLOP'],
      description: 'Waste and contaminated fluids'
    },
    'Dry Materials': {
      fluids: ['Cement', 'Barite', 'Bentonite', 'Lime', 'Caustic Soda'],
      compatibleTanks: ['DRY BULK'],
      description: 'Dry bulk materials and additives',
      unit: 'cf' // cubic feet instead of barrels
    }
  };

  // Get all available fluids organized by category
  const getFluidsByCategory = () => {
    return Object.entries(fluidCategories).map(([category, data]) => ({
      category,
      fluids: data.fluids,
      compatibleTanks: data.compatibleTanks,
      description: data.description,
      unit: data.unit || 'bbl'
    }));
  };

  // Determine which tank types are compatible with selected fluid
  const getCompatibleTankTypes = (fluid) => {
    if (!fluid) return [];
    
    for (const [category, data] of Object.entries(fluidCategories)) {
      if (data.fluids.includes(fluid)) {
        return data.compatibleTanks;
      }
    }
    return [];
  };

  // Get the unit for a fluid type
  const getFluidUnit = (fluid) => {
    if (!fluid) return 'bbl';
    
    for (const [category, data] of Object.entries(fluidCategories)) {
      if (data.fluids.includes(fluid)) {
        return data.unit || 'bbl';
      }
    }
    return 'bbl';
  };

  // Clear the best candidate selection for a vessel
  const clearBestCandidate = (vesselId) => {
    if (onSelectVessel) {
      const updatedVessel = vessels.find(v => v.id === vesselId);
      if (updatedVessel) {
        onSelectVessel({
          ...updatedVessel,
          bestCandidate: false
        });
      }
    }
  };

  // Calculate vessel statistics with fluid-specific compatibility
  const vesselStats = useMemo(() => {
    return vessels.map(vessel => {
      const compatibleTankTypes = getCompatibleTankTypes(selectedFluid);
      const fluidUnit = getFluidUnit(selectedFluid);
      
      // Filter tanks based on selected fluid compatibility
      const compatibleTanks = selectedFluid 
        ? vessel.tanks.filter(tank => compatibleTankTypes.includes(tank.type))
        : vessel.tanks;
      
      const incompatibleTanks = selectedFluid 
        ? vessel.tanks.filter(tank => !compatibleTankTypes.includes(tank.type))
        : [];

      // Calculate capacity metrics based on tank type
      const liquidMudTanks = vessel.tanks.filter(t => t.type === 'LIQUID');
      const methanolTanks = vessel.tanks.filter(t => t.type === 'METHANOL' && t.capacity > 0);
      const slopTanks = vessel.tanks.filter(t => t.type === 'SLOP' && t.capacity > 0);
      const dryBulkTanks = vessel.tanks.filter(t => t.type === 'DRY BULK' && t.capacity > 0);

      // For Liquid Mud tanks, calculate capacity at 80% max
      const liquidMudTotalCapacity = liquidMudTanks.reduce((sum, tank) => sum + tank.capacity, 0);
      const liquidMudEffectiveCapacity = Math.floor(liquidMudTotalCapacity * 0.8); // 80% capacity cap
      const liquidMudUsedCapacity = liquidMudTanks.reduce((sum, tank) => sum + tank.currentLevel, 0);
      const liquidMudAvailableCapacity = Math.max(0, liquidMudEffectiveCapacity - liquidMudUsedCapacity);
      const liquidMudUtilizationPercentage = liquidMudEffectiveCapacity > 0 
        ? Math.round((liquidMudUsedCapacity / liquidMudEffectiveCapacity) * 100) 
        : 0;

      // For Methanol tanks
      const methanolTotalCapacity = methanolTanks.reduce((sum, tank) => sum + tank.capacity, 0);
      const methanolUsedCapacity = methanolTanks.reduce((sum, tank) => sum + tank.currentLevel, 0);
      const methanolAvailableCapacity = Math.max(0, methanolTotalCapacity - methanolUsedCapacity);
      const methanolUtilizationPercentage = methanolTotalCapacity > 0 
        ? Math.round((methanolUsedCapacity / methanolTotalCapacity) * 100) 
        : 0;

      // For Slop tanks
      const slopTotalCapacity = slopTanks.reduce((sum, tank) => sum + tank.capacity, 0);
      const slopUsedCapacity = slopTanks.reduce((sum, tank) => sum + tank.currentLevel, 0);
      const slopAvailableCapacity = Math.max(0, slopTotalCapacity - slopUsedCapacity);
      const slopUtilizationPercentage = slopTotalCapacity > 0 
        ? Math.round((slopUsedCapacity / slopTotalCapacity) * 100) 
        : 0;

      // For Dry Bulk tanks
      const dryBulkTotalCapacity = dryBulkTanks.reduce((sum, tank) => sum + tank.capacity, 0);
      const dryBulkUsedCapacity = dryBulkTanks.reduce((sum, tank) => sum + tank.currentLevel, 0);
      const dryBulkAvailableCapacity = Math.max(0, dryBulkTotalCapacity - dryBulkUsedCapacity);
      const dryBulkUtilizationPercentage = dryBulkTotalCapacity > 0 
        ? Math.round((dryBulkUsedCapacity / dryBulkTotalCapacity) * 100) 
        : 0;

      // Set the actual capacity based on the selected fluid
      let totalCapacity, usedCapacity, availableCapacity, utilizationPercentage;

      if (selectedFluid) {
        // If a fluid is selected, use the standard calculation based on compatible tanks
        totalCapacity = compatibleTanks.reduce((sum, tank) => sum + tank.capacity, 0);
        usedCapacity = compatibleTanks.reduce((sum, tank) => sum + tank.currentLevel, 0);
        availableCapacity = totalCapacity - usedCapacity;
        utilizationPercentage = totalCapacity > 0 ? Math.round((usedCapacity / totalCapacity) * 100) : 0;
      } else {
        // If no fluid is selected, only use Liquid Mud tanks at 80% capacity
        totalCapacity = liquidMudTotalCapacity;
        usedCapacity = liquidMudUsedCapacity;
        availableCapacity = liquidMudAvailableCapacity;
        utilizationPercentage = liquidMudUtilizationPercentage;
      }
      
      // Calculate detailed compatibility if fluid is selected
      let fluidCompatibleTanks = 0;
      let needsCleaningTanks = 0;
      let fullyIncompatibleTanks = 0;
      
      if (selectedFluid) {
        compatibleTanks.forEach(tank => {
          const compatibility = getCompatibilityLevel(
            tank.contents === "Empty" ? "Empty" : tank.contents,
            selectedFluid
          );
          if (compatibility === 2) {
            fluidCompatibleTanks++;
          } else if (compatibility === 1) {
            needsCleaningTanks++;
          } else {
            fullyIncompatibleTanks++;
          }
        });
      }
      
      // Count warnings
      const warnings = [];
      vessel.tanks.forEach(tank => {
        if (tank.type === 'METHANOL' && tank.contents && tank.contents !== 'Empty' && tank.contents !== 'Methanol') {
          warnings.push(`Incompatible fluid in Methanol tank: ${tank.id}`);
        }
        if (tank.type === 'SLOP' && tank.contents && tank.contents !== 'Empty' && !tank.contents.toLowerCase().includes('trash')) {
          warnings.push(`Non-waste fluid in Slop tank: ${tank.id}`);
        }
      });
      
      return {
        ...vessel,
        totalCapacity,
        usedCapacity,
        availableCapacity,
        utilizationPercentage,
        liquidMudTanks: liquidMudTanks.length,
        methanolTanks: methanolTanks.length,
        slopTanks: slopTanks.length,
        dryBulkTanks: dryBulkTanks.length,
        liquidMudTotalCapacity,
        liquidMudEffectiveCapacity,
        liquidMudUsedCapacity,
        liquidMudAvailableCapacity,
        liquidMudUtilizationPercentage,
        methanolTotalCapacity,
        methanolUsedCapacity,
        methanolAvailableCapacity,
        methanolUtilizationPercentage,
        slopTotalCapacity,
        slopUsedCapacity,
        slopAvailableCapacity,
        slopUtilizationPercentage,
        dryBulkTotalCapacity,
        dryBulkUsedCapacity,
        dryBulkAvailableCapacity,
        dryBulkUtilizationPercentage,
        compatibleTanks,
        incompatibleTanks,
        fluidCompatibleTanks,
        needsCleaningTanks,
        fullyIncompatibleTanks,
        warnings,
        emptyTanks: compatibleTanks.filter(t => t.currentLevel === 0).length,
        isTagged: vessel.bestCandidate || false,
        fluidUnit
      };
    });
  }, [vessels, selectedFluid]);

  // Filter and sort vessels
  const filteredAndSortedVessels = useMemo(() => {
    let filtered = vesselStats;
    
    // Apply filters
    switch (filterBy) {
      case 'compatible':
        filtered = filtered.filter(v => selectedFluid && v.fluidCompatibleTanks > 0);
        break;
      case 'available':
        filtered = filtered.filter(v => v.availableCapacity > 1000); // At least 1000 units available
        break;
      case 'tagged':
        filtered = filtered.filter(v => v.isTagged);
        break;
      default:
        break;
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'name':
        return filtered.sort((a, b) => a.name.localeCompare(b.name));
      case 'capacity':
        return filtered.sort((a, b) => b.totalCapacity - a.totalCapacity);
      case 'availability':
        return filtered.sort((a, b) => b.availableCapacity - a.availableCapacity);
      case 'bestCandidate':
      default:
        return filtered.sort((a, b) => {
          // Best candidate first, then by compatibility, then by available capacity
          if (a.isTagged && !b.isTagged) return -1;
          if (!a.isTagged && b.isTagged) return 1;
          if (selectedFluid) {
            if (a.fluidCompatibleTanks !== b.fluidCompatibleTanks) {
              return b.fluidCompatibleTanks - a.fluidCompatibleTanks;
            }
          }
          return b.availableCapacity - a.availableCapacity;
        });
    }
  }, [vesselStats, sortBy, filterBy, selectedFluid]);

  const VesselCard = ({ vessel }) => {
    // Get the color scheme based on vessel
    const getVesselColorScheme = () => {
      if (vessel.name.includes('Dauphin')) {
        return {
          bg: 'bg-orange-500',
          gradientFrom: 'from-orange-500',
          gradientTo: 'to-orange-600',
          highlight: 'bg-orange-100',
          text: 'text-orange-600',
          border: 'border-orange-300',
          cardBg: 'from-orange-50'
        };
      } else {
        return {
          bg: 'bg-blue-600',
          gradientFrom: 'from-blue-600',
          gradientTo: 'to-blue-700',
          highlight: 'bg-blue-100',
          text: 'text-blue-600',
          border: 'border-blue-300',
          cardBg: 'from-blue-50'
        };
      }
    };
    
    const colorScheme = getVesselColorScheme();
    
    return (
      <div className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 ${
        vessel.isTagged ? `border-orange-300 bg-gradient-to-br ${colorScheme.cardBg} to-white` : 'border-gray-200 hover:border-blue-300'
      } overflow-hidden group ${
        selectedFluid && vessel.availableCapacity === 0 ? 'opacity-60' : ''
      }`}>
        {/* Header */}
        <div className={`px-6 py-4 ${
          vessel.isTagged 
            ? 'bg-gradient-to-r from-orange-500 to-orange-600' 
            : 'bg-gradient-to-r from-blue-600 to-blue-700'
        } text-white relative`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <Ship size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold">{vessel.name}</h3>
                <p className="text-sm opacity-90">
                  Last updated: {vessel.lastUpdated}
                </p>
              </div>
            </div>
            
            {vessel.isTagged && (
              <div className="flex items-center">
                <div className="flex items-center space-x-1 bg-white bg-opacity-20 px-3 py-1 rounded-full">
                  <Star size={16} fill="currentColor" />
                  <span className="text-sm font-medium">Best Candidate</span>
                </div>
                <button 
                  onClick={() => clearBestCandidate(vessel.id)}
                  className="ml-2 p-1.5 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white transition-colors"
                  title="Clear Best Candidate"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Capacity Overview - Always based on Liquid Mud at 80% if no fluid selected */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-800 flex items-center">
              <BarChart3 size={18} className="mr-2 text-blue-600" />
              {selectedFluid ? `${selectedFluid} Capacity` : 'Total Capacity Overview'}
            </h4>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              vessel.utilizationPercentage > 80 
                ? 'bg-red-100 text-red-700' 
                : vessel.utilizationPercentage > 60
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-green-100 text-green-700'
            }`}>
              {vessel.utilizationPercentage}% Utilized
            </span>
          </div>
          
          {selectedFluid && vessel.totalCapacity === 0 ? (
            <div className="text-center py-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle size={24} className="mx-auto text-red-500 mb-2" />
              <p className="text-red-700 font-medium">No Compatible Tanks</p>
              <p className="text-red-600 text-sm">This vessel has no tanks suitable for {selectedFluid}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-4 mb-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{vessel.totalCapacity.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Total Capacity</div>
                  <div className="text-xs text-gray-500">{vessel.fluidUnit}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{vessel.availableCapacity.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Available</div>
                  <div className="text-xs text-gray-500">{vessel.fluidUnit}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{vessel.usedCapacity.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Used</div>
                  <div className="text-xs text-gray-500">{vessel.fluidUnit}</div>
                </div>
              </div>
              
              {/* Capacity Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div className="flex h-full">
                  <div 
                    className="bg-orange-500 transition-all duration-500"
                    style={{ width: `${vessel.utilizationPercentage}%` }}
                  ></div>
                  <div 
                    className="bg-green-500 transition-all duration-500"
                    style={{ width: `${100 - vessel.utilizationPercentage}%` }}
                  ></div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Tank Breakdown - Show compatibility status */}
        <div className="px-6 py-4">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
            <Droplets size={18} className="mr-2 text-blue-600" />
            Tank Breakdown
          </h4>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Only show tank types that exist on this vessel */}
            
            {/* Liquid Tanks - Always show these */}
            {vessel.liquidMudTanks > 0 && (
              <div className={`rounded-lg p-3 border transition-all ${
                selectedFluid && getCompatibleTankTypes(selectedFluid).includes('LIQUID')
                  ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-100'
                  : selectedFluid && !getCompatibleTankTypes(selectedFluid).includes('LIQUID')
                    ? 'bg-gray-100 border-gray-300 opacity-50'
                    : 'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-800">Liquid Mud</span>
                  <div className="flex items-center space-x-1">
                    <span className="text-lg font-bold text-blue-700">{vessel.liquidMudTanks}</span>
                    {selectedFluid && getCompatibleTankTypes(selectedFluid).includes('LIQUID') && (
                      <CheckCircle size={16} className="text-green-500" />
                    )}
                  </div>
                </div>
                <div className="text-xs text-blue-600">
                  {vessel.liquidMudTotalCapacity.toLocaleString()} bbl 
                  ({vessel.liquidMudUtilizationPercentage}%)
                </div>
                <div className="w-full bg-blue-200 rounded-full h-1.5 mt-2">
                  <div 
                    className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${vessel.liquidMudUtilizationPercentage}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Slop Tanks - Only show if vessel has them */}
            {vessel.slopTanks > 0 && (
              <div className={`rounded-lg p-3 border transition-all ${
                selectedFluid && getCompatibleTankTypes(selectedFluid).includes('SLOP')
                  ? 'bg-yellow-50 border-yellow-200 ring-2 ring-yellow-100'
                  : selectedFluid && !getCompatibleTankTypes(selectedFluid).includes('SLOP')
                      ? 'bg-gray-100 border-gray-300 opacity-50'
                      : 'bg-yellow-50 border-yellow-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-yellow-800">Slop</span>
                  <div className="flex items-center space-x-1">
                    <span className="text-lg font-bold text-yellow-700">{vessel.slopTanks}</span>
                    {selectedFluid && getCompatibleTankTypes(selectedFluid).includes('SLOP') && (
                      <CheckCircle size={16} className="text-green-500" />
                    )}
                  </div>
                </div>
                <div className="text-xs text-yellow-600">
                  {vessel.slopTotalCapacity.toLocaleString()} bbl 
                  ({vessel.slopUtilizationPercentage}%)
                </div>
                <div className="w-full bg-yellow-200 rounded-full h-1.5 mt-2">
                  <div 
                    className="bg-yellow-600 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${vessel.slopUtilizationPercentage}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Methanol Tanks - Only show if vessel has them */}
            {vessel.methanolTanks > 0 && (
              <div className={`rounded-lg p-3 border transition-all ${
                selectedFluid && getCompatibleTankTypes(selectedFluid).includes('METHANOL')
                  ? 'bg-purple-50 border-purple-200 ring-2 ring-purple-100'
                  : selectedFluid && !getCompatibleTankTypes(selectedFluid).includes('METHANOL')
                    ? 'bg-gray-100 border-gray-300 opacity-50'
                    : 'bg-purple-50 border-purple-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-purple-800">Methanol</span>
                  <div className="flex items-center space-x-1">
                    <span className="text-lg font-bold text-purple-700">{vessel.methanolTanks}</span>
                    {selectedFluid && getCompatibleTankTypes(selectedFluid).includes('METHANOL') && (
                      <CheckCircle size={16} className="text-green-500" />
                    )}
                  </div>
                </div>
                <div className="text-xs text-purple-600">
                  {vessel.methanolTotalCapacity.toLocaleString()} bbl / gal 
                  ({vessel.methanolUtilizationPercentage}%)
                </div>
                <div className="w-full bg-purple-200 rounded-full h-1.5 mt-2">
                  <div 
                    className="bg-purple-600 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${vessel.methanolUtilizationPercentage}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Dry Bulk Tanks - Only show if vessel has them */}
            {vessel.dryBulkTanks > 0 && (
              <div className={`rounded-lg p-3 border transition-all ${
                selectedFluid && getCompatibleTankTypes(selectedFluid).includes('DRY BULK')
                  ? 'bg-gray-50 border-gray-400 ring-2 ring-gray-200'
                  : selectedFluid && !getCompatibleTankTypes(selectedFluid).includes('DRY BULK')
                    ? 'bg-gray-100 border-gray-300 opacity-50'
                    : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-800">Dry Bulk</span>
                  <div className="flex items-center space-x-1">
                    <span className="text-lg font-bold text-gray-700">{vessel.dryBulkTanks}</span>
                    {selectedFluid && getCompatibleTankTypes(selectedFluid).includes('DRY BULK') && (
                      <CheckCircle size={16} className="text-green-500" />
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-600">
                  {vessel.dryBulkTotalCapacity.toLocaleString()} cf 
                  ({vessel.dryBulkUtilizationPercentage}%)
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                  <div 
                    className="bg-gray-600 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${vessel.dryBulkUtilizationPercentage}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fluid Compatibility Section - Enhanced */}
        {selectedFluid && (
          <div className="px-6 py-4 bg-gray-50 border-t">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
              <CheckCircle size={18} className="mr-2 text-green-600" />
              {selectedFluid} Compatibility
            </h4>
            
            {vessel.totalCapacity === 0 ? (
              <div className="text-center py-3 bg-red-50 rounded-lg border border-red-200">
                <p className="text-red-700 font-medium text-sm">No compatible tanks available</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="text-center bg-green-100 rounded-lg p-2 border border-green-200">
                    <div className="text-lg font-bold text-green-700">{vessel.fluidCompatibleTanks}</div>
                    <div className="text-xs text-green-600">Ready to Use</div>
                  </div>
                  <div className="text-center bg-yellow-100 rounded-lg p-2 border border-yellow-200">
                    <div className="text-lg font-bold text-yellow-700">{vessel.needsCleaningTanks}</div>
                    <div className="text-xs text-yellow-600">Need Cleaning</div>
                  </div>
                  <div className="text-center bg-red-100 rounded-lg p-2 border border-red-200">
                    <div className="text-lg font-bold text-red-700">{vessel.fullyIncompatibleTanks}</div>
                    <div className="text-xs text-red-600">Incompatible</div>
                  </div>
                </div>
                
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Immediate Availability</span>
                    <span className="text-sm font-medium">
                      {vessel.compatibleTanks.filter(t => t.currentLevel === 0 && 
                        getCompatibilityLevel(t.contents === "Empty" ? "Empty" : t.contents, selectedFluid) === 2).length} empty tanks
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.round((vessel.fluidCompatibleTanks / vessel.compatibleTanks.length) * 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Warnings */}
        {vessel.warnings.length > 0 && (
          <div className="px-6 py-4 bg-red-50 border-t border-red-200">
            <h4 className="font-semibold text-red-800 mb-2 flex items-center">
              <AlertTriangle size={18} className="mr-2 text-red-600" />
              Warnings ({vessel.warnings.length})
            </h4>
            <div className="space-y-1">
              {vessel.warnings.slice(0, 2).map((warning, index) => (
                <div key={index} className="text-sm text-red-700 flex items-start">
                  <AlertTriangle size={14} className="mr-1 mt-0.5 flex-shrink-0" />
                  {warning}
                </div>
              ))}
              {vessel.warnings.length > 2 && (
                <div className="text-sm text-red-600 italic">
                  +{vessel.warnings.length - 2} more warnings
                </div>
              )}
            </div>
          </div>
        )}

        {/* Service Details */}
        <div className="px-6 py-4 border-t bg-gray-50">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Fuel size={16} className="text-blue-600" />
              <span className="text-gray-600">Fuel:</span>
              <span className="font-medium">{vessel.fuel || 'gal'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Waves size={16} className="text-blue-600" />
              <span className="text-gray-600">Water:</span>
              <span className="font-medium">{vessel.water || 'gal'}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 bg-white border-t">
          <div className="flex space-x-3">
            <button
              onClick={() => onSelectVessel(vessel)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                vessel.isTagged
                  ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-md hover:shadow-lg'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
              }`}
            >
              <Eye size={16} className="inline mr-2" />
              Manage Tanks
            </button>
            
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
              Tag for Job
            </button>
          </div>
        </div>
      </div>
    );
  };

  const CompactVesselRow = ({ vessel }) => (
    <div className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border-l-4 ${
      vessel.isTagged ? 'border-orange-500 bg-orange-50' : 'border-blue-500'
    } mb-3 ${
      selectedFluid && vessel.availableCapacity === 0 ? 'opacity-60' : ''
    }`}>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`p-2 rounded-lg ${vessel.isTagged ? 'bg-orange-100' : 'bg-blue-100'}`}>
              <Ship size={24} className={vessel.isTagged ? 'text-orange-600' : 'text-blue-600'} />
            </div>
            
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-gray-800">{vessel.name}</h3>
                {vessel.isTagged && (
                  <div className="flex items-center">
                    <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full font-medium">
                      Best Candidate
                    </span>
                    <button 
                      onClick={() => clearBestCandidate(vessel.id)}
                      className="ml-1 p-1 rounded-full bg-orange-200 hover:bg-orange-300 text-orange-800 transition-colors"
                      title="Clear Best Candidate"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600">Updated: {vessel.lastUpdated}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            {/* Capacity Stats - Show units properly */}
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{vessel.totalCapacity.toLocaleString()}</div>
              <div className="text-xs text-gray-600">Total ({vessel.fluidUnit})</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{vessel.availableCapacity.toLocaleString()}</div>
              <div className="text-xs text-gray-600">Available ({vessel.fluidUnit})</div>
            </div>
            
            <div className="text-center">
              <div className={`text-lg font-bold ${
                vessel.utilizationPercentage > 80 ? 'text-red-600' : 
                vessel.utilizationPercentage > 60 ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {vessel.utilizationPercentage}%
              </div>
              <div className="text-xs text-gray-600">Utilized</div>
            </div>
            
            {/* Tank Summary with compatibility indicators */}
            <div className="flex space-x-2">
              {/* Only show tank types that exist on this vessel */}
              {vessel.liquidMudTanks > 0 && (
                <span className={`text-xs px-2 py-1 rounded-full ${
                  selectedFluid && getCompatibleTankTypes(selectedFluid).includes('LIQUID')
                    ? 'bg-blue-100 text-blue-800 ring-2 ring-blue-300'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {vessel.liquidMudTanks} Liquid
                </span>
              )}
              
              {vessel.methanolTanks > 0 && (
                <span className={`text-xs px-2 py-1 rounded-full ${
                  selectedFluid && getCompatibleTankTypes(selectedFluid).includes('METHANOL')
                    ? 'bg-purple-100 text-purple-800 ring-2 ring-purple-300'
                    : 'bg-purple-100 text-purple-800'
                }`}>
                  {vessel.methanolTanks} Methanol
                </span>
              )}
              
              {vessel.slopTanks > 0 && (
                <span className={`text-xs px-2 py-1 rounded-full ${
                  selectedFluid && getCompatibleTankTypes(selectedFluid).includes('SLOP')
                    ? 'bg-yellow-100 text-yellow-800 ring-2 ring-yellow-300'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {vessel.slopTanks} Slop
                </span>
              )}
              
              {vessel.dryBulkTanks > 0 && (
                <span className={`text-xs px-2 py-1 rounded-full ${
                  selectedFluid && getCompatibleTankTypes(selectedFluid).includes('DRY BULK')
                    ? 'bg-gray-100 text-gray-800 ring-2 ring-gray-300'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {vessel.dryBulkTanks} Dry Bulk
                </span>
              )}
            </div>
            
            {/* Warnings */}
            {vessel.warnings.length > 0 && (
              <div className="flex items-center text-red-600">
                <AlertTriangle size={20} />
                <span className="ml-1 text-sm font-medium">{vessel.warnings.length}</span>
              </div>
            )}
            
            {/* Actions */}
            <div className="flex space-x-2">
              <button
                onClick={() => onSelectVessel(vessel)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  vessel.isTagged
                    ? 'bg-orange-600 hover:bg-orange-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                Manage Tanks
              </button>
            </div>
          </div>
        </div>
        
        {/* Enhanced Compatibility Bar */}
        {selectedFluid && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                {selectedFluid} Compatibility
              </span>
                              {vessel.totalCapacity === 0 ? (
                <span className="text-sm text-red-600 font-medium">No compatible tanks</span>
              ) : (
                <span className="text-sm text-gray-600">
                  {vessel.fluidCompatibleTanks} ready / {vessel.compatibleTanks.length} total
                </span>
              )}
            </div>
            {vessel.totalCapacity > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="flex h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-green-500"
                    style={{ width: `${(vessel.fluidCompatibleTanks / vessel.compatibleTanks.length) * 100}%` }}
                  ></div>
                  <div 
                    className="bg-yellow-500"
                    style={{ width: `${(vessel.needsCleaningTanks / vessel.compatibleTanks.length) * 100}%` }}
                  ></div>
                  <div 
                    className="bg-red-500"
                    style={{ width: `${(vessel.fullyIncompatibleTanks / vessel.compatibleTanks.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Fleet Overview</h1>
        <p className="text-gray-600">Select fluid type to see compatible vessels and available capacity</p>
      </div>

      {/* Enhanced Controls */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Fluid Selection */}
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Fluid Type
              </label>
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[200px]"
                value={selectedFluid}
                onChange={(e) => setSelectedFluid(e.target.value)}
              >
                <option value="">All Fluids / Tank Types</option>
                {getFluidsByCategory().map(category => (
                  <optgroup key={category.category} label={category.category}>
                    {category.fluids.map(fluid => (
                      <option key={fluid} value={fluid}>
                        {fluid} ({category.unit})
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            
            {selectedFluid && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 max-w-md">
                <div className="text-sm text-blue-800 font-medium mb-1">
                  Compatible Tanks: {getCompatibleTankTypes(selectedFluid).join(', ')}
                </div>
                <div className="text-xs text-blue-700">
                  {Object.entries(fluidCategories).find(([_, data]) => 
                    data.fluids.includes(selectedFluid)
                  )?.[1].description}
                </div>
              </div>
            )}
          </div>

          {/* View and Filter Controls */}
          <div className="flex items-center space-x-4">
            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'cards' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Card View
              </button>
              <button
                onClick={() => setViewMode('compact')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'compact' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Compact View
              </button>
            </div>

            {/* Sort By */}
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-sm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="bestCandidate">Best Candidate First</option>
              <option value="name">Name (A-Z)</option>
              <option value="capacity">Compatible Capacity</option>
              <option value="availability">Available Capacity</option>
            </select>

            {/* Filter By */}
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-sm"
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
            >
              <option value="all">All Vessels</option>
              <option value="compatible">Has Compatible Tanks</option>
              <option value="available">High Availability (&gt;1000 {getFluidUnit(selectedFluid)})</option>
              <option value="tagged">Tagged Vessels</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-6">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-medium text-gray-900">
                Showing {filteredAndSortedVessels.length} of {vessels.length} vessels
              </span>
              {selectedFluid && (
                <div className="mt-1 text-sm text-gray-600 space-x-4">
                  <span>• {filteredAndSortedVessels.filter(v => v.fluidCompatibleTanks > 0).length} have ready tanks</span>
                  <span>• {filteredAndSortedVessels.filter(v => v.isTagged).length} tagged as best candidates</span>
                  <span>• Total available: {filteredAndSortedVessels.reduce((sum, v) => sum + v.availableCapacity, 0).toLocaleString()} {getFluidUnit(selectedFluid)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Vessel Grid/List */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAndSortedVessels.map(vessel => (
            <VesselCard key={vessel.id} vessel={vessel} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedVessels.map(vessel => (
            <CompactVesselRow key={vessel.id} vessel={vessel} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredAndSortedVessels.length === 0 && (
        <div className="text-center py-12">
          <Ship size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No vessels match your criteria</h3>
          <p className="text-gray-600">Try adjusting your filters or fluid selection</p>
        </div>
      )}
    </div>
  );
};

export default FleetViewTab;