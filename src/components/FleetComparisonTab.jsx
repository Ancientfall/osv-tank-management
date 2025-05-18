// src/components/FleetComparisonTab.jsx
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Package, Droplet, AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react'; // Relevant icons
import { getCompatibilityColor, getCompatibilityIcon, getClientColor as getClientChipColor } from '../utils/uiHelpers.jsx';
import { getCompatibilityLevel } from '../utils/compatibilityUtils';
import { CHART_COLORS } from '../data/appData'; // Import chart colors


const FleetComparisonTab = ({ vessels, clients, fluidTypes, compatibilityMatrix }) => {
  const [selectedClientFilter, setSelectedClientFilter] = useState("all");
  const [selectedTankTypeFilter, setSelectedTankTypeFilter] = useState("all");
  const [selectedFluid, setSelectedFluid] = useState(null);
  const [compatibleTanks, setCompatibleTanks] = useState([]);
  const [showCompatibilityMatrix, setShowCompatibilityMatrix] = useState(false);

  // Update compatible tanks when a fluid is selected
  useEffect(() => {
    if (!selectedFluid) {
      setCompatibleTanks([]);
      return;
    }
    
    const allTanks = [];
    vessels.forEach(vessel => {
      vessel.tanks.forEach(tank => {
        const compatibilityLevel = getCompatibilityLevel( // Use the imported util
          tank.contents === "Empty" ? "Empty" : tank.contents,
          selectedFluid
        );
        
        allTanks.push({
          ...tank,
          vessel: vessel.name,
          vesselId: vessel.id,
          compatibilityLevel
        });
      });
    });
    
    const sortedTanks = allTanks.sort((a, b) => b.compatibilityLevel - a.compatibilityLevel);
    setCompatibleTanks(sortedTanks);
  }, [selectedFluid, vessels, compatibilityMatrix]); // Added dependencies

  // Calculate fleet stats for charts
  const calculateFleetStats = () => {
    const stats = {
      tankTypes: {},
      totalCapacity: 0,
      usedCapacity: 0,
      clientAllocation: {},
      contentTypes: {}
    };
    
    const filteredVessels = vessels; // Already getting all vessels, filtering happens on tanks
    
    filteredVessels.forEach(vessel => {
      const typeFilteredTanks = selectedTankTypeFilter === "all" 
        ? vessel.tanks 
        : vessel.tanks.filter(t => t.type === selectedTankTypeFilter);
      
      const clientAndTypeFilteredTanks = selectedClientFilter === "all"
        ? typeFilteredTanks
        : typeFilteredTanks.filter(t => t.client === selectedClientFilter);
      
      clientAndTypeFilteredTanks.forEach(tank => {
        if (!stats.tankTypes[tank.type]) {
          stats.tankTypes[tank.type] = { count: 0, capacity: 0, used: 0 };
        }
        stats.tankTypes[tank.type].count++;
        stats.tankTypes[tank.type].capacity += tank.capacity;
        stats.tankTypes[tank.type].used += tank.currentLevel;
        
        stats.totalCapacity += tank.capacity;
        stats.usedCapacity += tank.currentLevel;
        
        const clientName = tank.client || "Unassigned";
        if (!stats.clientAllocation[clientName]) {
          stats.clientAllocation[clientName] = { count: 0, capacity: 0, used: 0 };
        }
        stats.clientAllocation[clientName].count++;
        stats.clientAllocation[clientName].capacity += tank.capacity;
        stats.clientAllocation[clientName].used += tank.currentLevel;
        
        if (tank.currentLevel > 0) {
          const content = tank.contents === "Empty" ? "Empty" : tank.contents;
          if (!stats.contentTypes[content]) {
            stats.contentTypes[content] = 0;
          }
          stats.contentTypes[content] += tank.currentLevel;
        }
      });
    });
    return stats;
  };
  
  const fleetStats = calculateFleetStats();
  
  const prepareTankTypeChartData = () => {
    return Object.keys(fleetStats.tankTypes).map(type => ({
      name: type,
      count: fleetStats.tankTypes[type].count,
      capacity: fleetStats.tankTypes[type].capacity,
      used: fleetStats.tankTypes[type].used,
      available: fleetStats.tankTypes[type].capacity - fleetStats.tankTypes[type].used
    }));
  };

  const prepareClientChartData = () => {
    return Object.keys(fleetStats.clientAllocation).map(client => ({
      name: client,
      value: fleetStats.clientAllocation[client].capacity // Using capacity for pie chart value
    }));
  };

  const tankTypeChartData = prepareTankTypeChartData();
  const clientChartData = prepareClientChartData();

  return (
    <div className="p-4 overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Fleet Comparison</h2>
        <div className="flex space-x-3">
          <select 
            className="border rounded p-2"
            value={selectedClientFilter}
            onChange={(e) => setSelectedClientFilter(e.target.value)}
          >
            <option value="all">All Clients</option>
            {clients.map(client => (
              <option key={client.id} value={client.name}>{client.name}</option>
            ))}
          </select>
          <select 
            className="border rounded p-2"
            value={selectedTankTypeFilter}
            onChange={(e) => setSelectedTankTypeFilter(e.target.value)}
          >
            <option value="all">All Tank Types</option>
            {/* Dynamically get tank types from fluidTypes or a predefined list */}
            {Array.from(new Set(vessels.flatMap(v => v.tanks.map(t => t.type)))).map(type => (
                <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <button
            className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-4 py-2 rounded font-medium flex items-center transition"
            onClick={() => setShowCompatibilityMatrix(!showCompatibilityMatrix)}
          >
            {showCompatibilityMatrix ? 'Hide' : 'Show'} Compatibility Matrix
          </button>
        </div>
      </div>
      
      {/* Fluid Compatibility Matrix */}
      {showCompatibilityMatrix && (
        <div className="bg-white border rounded-lg shadow-sm mb-6 p-4">
          <h3 className="font-semibold mb-3">Fluid Compatibility Matrix</h3>
          <p className="text-sm text-gray-600 mb-4">This matrix shows compatibility between current fluid contents and potential new fluids</p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-2 border bg-gray-100 text-left">Current Contents ↓ / New Fluid →</th>
                  {Object.keys(compatibilityMatrix["Empty"] || {}).filter(fluid => fluid !== "Empty").map(fluid => (
                    <th key={fluid} className="p-2 border bg-gray-100 text-center">{fluid}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.keys(compatibilityMatrix).map(currentFluid => (
                  <tr key={currentFluid}>
                    <td className="p-2 border font-medium">{currentFluid}</td>
                    {Object.keys(compatibilityMatrix[currentFluid] || {})
                      .filter(newFluid => newFluid !== "Empty")
                      .map(newFluid => {
                        const compatLevel = compatibilityMatrix[currentFluid][newFluid];
                        return (
                          <td key={`${currentFluid}-${newFluid}`} className={`p-2 border text-center ${getCompatibilityColor(compatLevel)}`}>
                            <div className="flex items-center justify-center">
                              {getCompatibilityIcon(compatLevel)}
                              <span className="ml-1">
                                {compatLevel === 2 ? 'Compatible' : 
                                 compatLevel === 1 ? 'Needs Cleaning' : 'Incompatible'}
                              </span>
                            </div>
                          </td>
                        );
                      })
                    }
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Tank Compatibility Analyzer */}
      <div className="bg-white border rounded-lg shadow-sm mb-6 p-4">
        <h3 className="font-semibold mb-2">Tank Compatibility Analyzer</h3>
        <p className="text-sm text-gray-600 mb-4">
          Select a fluid to find which tanks are compatible across the fleet
        </p>
        <div className="flex items-center space-x-4 mb-4">
          <label className="font-medium">Select Fluid:</label>
          <select 
            className="border rounded p-2 w-64"
            value={selectedFluid || ""}
            onChange={(e) => setSelectedFluid(e.target.value || null)}
          >
            <option value="">Select a fluid...</option>
            {Object.keys(compatibilityMatrix["Empty"] || {})
              .filter(fluid => fluid !== "Empty")
              .map(fluid => (
                <option key={fluid} value={fluid}>{fluid}</option>
              ))
            }
          </select>
        </div>
        {selectedFluid && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Compatible Tanks for {selectedFluid}</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="border rounded p-3 bg-green-50">
                <h5 className="font-medium text-green-800 flex items-center"><CheckCircle size={16} className="mr-1" />Fully Compatible</h5>
                <div className="text-sm mt-1">{compatibleTanks.filter(t => t.compatibilityLevel === 2).length} tanks</div>
              </div>
              <div className="border rounded p-3 bg-yellow-50">
                <h5 className="font-medium text-yellow-800 flex items-center"><Info size={16} className="mr-1" />Requires Cleaning</h5>
                <div className="text-sm mt-1">{compatibleTanks.filter(t => t.compatibilityLevel === 1).length} tanks</div>
              </div>
              <div className="border rounded p-3 bg-red-50">
                <h5 className="font-medium text-red-800 flex items-center"><XCircle size={16} className="mr-1" />Incompatible</h5>
                <div className="text-sm mt-1">{compatibleTanks.filter(t => t.compatibilityLevel === 0).length} tanks</div>
              </div>
            </div>
            <div className="mt-4 border rounded-lg overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border text-left">Tank ID</th><th className="p-2 border text-left">Vessel</th>
                    <th className="p-2 border text-left">Current Contents</th><th className="p-2 border text-left">Capacity</th>
                    <th className="p-2 border text-left">Available Space</th><th className="p-2 border text-left">Client</th>
                    <th className="p-2 border text-left">Compatibility</th>
                  </tr>
                </thead>
                <tbody>
                  {compatibleTanks.map(tank => (
                    <tr key={`${tank.vesselId}-${tank.id}`} className={getCompatibilityColor(tank.compatibilityLevel)}>
                      <td className="p-2 border font-medium">{tank.id}</td><td className="p-2 border">{tank.vessel}</td>
                      <td className="p-2 border">{tank.contents}</td><td className="p-2 border">{tank.capacity} bbl</td>
                      <td className="p-2 border">{tank.capacity - tank.currentLevel} bbl</td>
                      <td className="p-2 border">{tank.client || "Unassigned"}</td>
                      <td className="p-2 border">
                        <div className="flex items-center">{getCompatibilityIcon(tank.compatibilityLevel)}
                          <span className="ml-1">{tank.compatibilityLevel === 2 ? 'Compatible' : tank.compatibilityLevel === 1 ? 'Needs Cleaning' : 'Incompatible'}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      
      {/* Fleet Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4 border">
          <h3 className="font-semibold text-blue-800 mb-2">Fleet Capacity</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 bg-blue-50 rounded text-center"><div className="text-gray-600 text-sm">Total</div><div className="font-bold text-xl">{fleetStats.totalCapacity} bbl</div></div>
            <div className="p-3 bg-blue-50 rounded text-center"><div className="text-gray-600 text-sm">Used</div><div className="font-bold text-xl">{Math.round((fleetStats.usedCapacity / (fleetStats.totalCapacity||1)) * 100)}%</div></div>
          </div>
          <div className="mt-3"><div className="w-full bg-gray-200 rounded-full h-2.5 mt-2"><div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${Math.round((fleetStats.usedCapacity / (fleetStats.totalCapacity||1)) * 100)}%` }}></div></div><div className="text-xs text-gray-600 mt-1 text-right">{fleetStats.usedCapacity} / {fleetStats.totalCapacity} bbl used</div></div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border">
          <h3 className="font-semibold text-blue-800 mb-2">Tank Distribution</h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tankTypeChartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="count" fill="#8884d8" name="Tank Count" /></BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border">
          <h3 className="font-semibold text-blue-800 mb-2">Client Allocation</h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart><Pie data={clientChartData} cx="50%" cy="50%" labelLine={false} outerRadius={60} fill="#8884d8" dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>{clientChartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />))}</Pie><Tooltip /></PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Tank Type Allocation Matrix */}
      <div className="bg-white border rounded-lg shadow-sm mb-6">
        <div className="p-4 border-b"><h3 className="font-semibold">Tank Type Allocation Matrix</h3><p className="text-sm text-gray-600">Compare tank types and capacities across all vessels</p></div>
        <div className="p-4 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead><tr className="bg-gray-100"><th className="p-2 border text-left">Tank Type</th>{vessels.map(vessel => (<th key={vessel.id} className="p-2 border text-center">{vessel.name}</th>))}<th className="p-2 border text-center">Fleet Total</th></tr></thead>
            <tbody>
              {/* Unique Tank Types */}
              {Array.from(new Set(vessels.flatMap(v => v.tanks.map(t => t.type)))).map(tankType => {
                let IconComponent = Package; // Default icon
                if (tankType === "METHANOL") IconComponent = Droplet;
                else if (tankType === "SLOP") IconComponent = AlertTriangle;

                return (
                  <tr key={tankType}>
                    <td className="p-2 border font-medium"><div className="flex items-center"><IconComponent size={18} className={`mr-2 ${tankType === "METHANOL" ? 'text-purple-600' : tankType === "SLOP" ? 'text-yellow-600' : 'text-blue-600'}`} /><span>{tankType}</span></div></td>
                    {vessels.map(vessel => {
                      const typeTanks = vessel.tanks.filter(t => t.type === tankType);
                      const totalCapacity = typeTanks.reduce((sum, t) => sum + t.capacity, 0);
                      const usedCapacity = typeTanks.reduce((sum, t) => sum + t.currentLevel, 0);
                      return (
                        <td key={vessel.id} className="p-2 border"><div className="text-center">
                            <div className="font-medium">{typeTanks.length} tanks</div><div className="text-sm">{totalCapacity} bbl capacity</div>
                            <div className="mt-1 w-full bg-gray-200 rounded-full h-2"><div className={`${tankType === "METHANOL" ? 'bg-purple-600' : tankType === "SLOP" ? 'bg-yellow-600' : 'bg-blue-600'} h-2 rounded-full`} style={{ width: `${totalCapacity ? Math.min(100, (usedCapacity/totalCapacity) * 100) : 0}%` }}></div></div>
                            <div className="text-xs text-gray-600 mt-1">{usedCapacity} / {totalCapacity} bbl ({totalCapacity ? Math.round((usedCapacity/totalCapacity) * 100) : 0}% used)</div>
                        </div></td>);
                    })}
                    <td className="p-2 border"><div className="text-center">
                        <div className="font-medium">{vessels.reduce((sum, vessel) => sum + vessel.tanks.filter(t => t.type === tankType).length, 0)} tanks</div>
                        <div className="text-sm">{vessels.reduce((sum, vessel) => sum + vessel.tanks.filter(t => t.type === tankType).reduce((tSum, t) => tSum + t.capacity, 0), 0)} bbl</div>
                    </div></td>
                  </tr>
                );
              })}
              <tr className="bg-gray-50">
                <td className="p-2 border font-medium">Total Tanks</td>
                {vessels.map(vessel => (<td key={vessel.id} className="p-2 border text-center font-medium">{vessel.tanks.length} tanks<div className="text-sm font-normal">{vessel.tanks.reduce((sum, t) => sum + t.capacity, 0)} bbl total</div></td>))}
                <td className="p-2 border text-center font-medium">{vessels.reduce((sum, vessel) => sum + vessel.tanks.length, 0)} tanks<div className="text-sm font-normal">{vessels.reduce((sum, vessel) => sum + vessel.tanks.reduce((tSum, t) => tSum + t.capacity, 0), 0)} bbl</div></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Client Allocation Matrix */}
      <div className="bg-white border rounded-lg shadow-sm mb-6">
        <div className="p-4 border-b"><h3 className="font-semibold">Client Allocation Matrix</h3><p className="text-sm text-gray-600">Compare client distribution across all vessels</p></div>
        <div className="p-4 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead><tr className="bg-gray-100"><th className="p-2 border text-left">Client</th>{vessels.map(vessel => (<th key={vessel.id} className="p-2 border text-center">{vessel.name}</th>))}<th className="p-2 border text-center">Fleet Total</th></tr></thead>
            <tbody>
              {clients.map(client => (
                <tr key={client.id}>
                  <td className={`p-2 border font-medium ${getClientChipColor(client.name)}`}>{client.name}</td>
                  {vessels.map(vessel => {
                    const clientTanks = vessel.tanks.filter(t => t.client === client.name);
                    const totalCapacity = clientTanks.reduce((sum, t) => sum + t.capacity, 0);
                    const usedCapacity = clientTanks.reduce((sum, t) => sum + t.currentLevel, 0);
                    return (<td key={vessel.id} className="p-2 border"><div className="text-center">
                        <div className="font-medium">{clientTanks.length} tanks</div>
                        {clientTanks.length > 0 ? (<div><div className="text-sm">{totalCapacity} bbl allocated</div><div className="mt-1 w-full bg-gray-200 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full" style={{ width: `${totalCapacity ? Math.min(100, (usedCapacity/totalCapacity) * 100) : 0}%` }}></div></div><div className="text-xs text-gray-600 mt-1">{usedCapacity} / {totalCapacity} bbl used</div></div>) : (<div className="text-xs text-gray-500 italic">No allocation</div>)}
                    </div></td>);
                  })}
                  <td className="p-2 border"><div className="text-center">
                      <div className="font-medium">{vessels.reduce((sum, vessel) => sum + vessel.tanks.filter(t => t.client === client.name).length, 0)} tanks</div>
                      <div className="text-sm">{vessels.reduce((sum, vessel) => sum + vessel.tanks.filter(t => t.client === client.name).reduce((tSum, t) => tSum + t.capacity, 0), 0)} bbl</div>
                  </div></td>
                </tr>
              ))}
              <tr className="bg-gray-50">
                <td className="p-2 border font-medium">Unassigned</td>
                {vessels.map(vessel => {const unassignedTanks = vessel.tanks.filter(t => t.client === null); const totalCapacity = unassignedTanks.reduce((sum, t) => sum + t.capacity, 0); return (<td key={vessel.id} className="p-2 border text-center"><div className="font-medium">{unassignedTanks.length} tanks</div><div className="text-sm">{totalCapacity} bbl</div></td>);})}
                <td className="p-2 border text-center font-medium">{vessels.reduce((sum, vessel) => sum + vessel.tanks.filter(t => t.client === null).length, 0)} tanks<div className="text-sm font-normal">{vessels.reduce((sum, vessel) => sum + vessel.tanks.filter(t => t.client === null).reduce((tSum, t) => tSum + t.capacity, 0), 0)} bbl</div></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Content Types Matrix */}
      <div className="bg-white border rounded-lg shadow-sm">
        <div className="p-4 border-b"><h3 className="font-semibold">Current Contents Matrix</h3><p className="text-sm text-gray-600">Compare current contents by material type across all vessels</p></div>
        <div className="p-4 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead><tr className="bg-gray-100"><th className="p-2 border text-left">Content Type</th>{vessels.map(vessel => (<th key={vessel.id} className="p-2 border text-center">{vessel.name}</th>))}<th className="p-2 border text-center">Fleet Total</th></tr></thead>
            <tbody>
              {/* Dynamic Content Types */}
              {Array.from(new Set(vessels.flatMap(v => v.tanks.filter(t => t.currentLevel > 0 && t.contents !== "Empty").map(t => t.contents.toLowerCase().includes('mud') ? 'Liquid Mud' : t.contents.toLowerCase().includes('methanol') ? 'Methanol' : (t.contents.toLowerCase().includes('cement') || t.contents.toLowerCase().includes('barite')) ? 'Cement/Barite' : t.contents.toLowerCase().includes('trash') ? 'Trash Fluid' : 'Other' )))).sort().map(contentType => (
                <tr key={contentType}>
                  <td className="p-2 border font-medium">{contentType}</td>
                  {vessels.map(vessel => {
                    const relevantTanks = vessel.tanks.filter(t => t.currentLevel > 0 && (
                      (contentType === 'Liquid Mud' && t.contents.toLowerCase().includes('mud')) ||
                      (contentType === 'Methanol' && t.contents.toLowerCase().includes('methanol')) ||
                      (contentType === 'Cement/Barite' && (t.contents.toLowerCase().includes('cement') || t.contents.toLowerCase().includes('barite'))) ||
                      (contentType === 'Trash Fluid' && t.contents.toLowerCase().includes('trash')) ||
                      (contentType === 'Other' && !t.contents.toLowerCase().includes('mud') && !t.contents.toLowerCase().includes('methanol') && !t.contents.toLowerCase().includes('cement') && !t.contents.toLowerCase().includes('barite') && !t.contents.toLowerCase().includes('trash') && t.contents !== "Empty")
                    ));
                    const totalVolume = relevantTanks.reduce((sum, t) => sum + t.currentLevel, 0);
                    return (<td key={vessel.id} className="p-2 border text-center">{totalVolume > 0 ? (<div><div className="font-medium">{totalVolume} bbl</div><div className="text-xs text-gray-600">{relevantTanks.length} tanks</div></div>) : (<span className="text-gray-400">None</span>)}</td>);
                  })}
                  <td className="p-2 border text-center font-medium">{vessels.reduce((sum, vessel) => sum + vessel.tanks.filter(t => t.currentLevel > 0 && (
                      (contentType === 'Liquid Mud' && t.contents.toLowerCase().includes('mud')) ||
                      (contentType === 'Methanol' && t.contents.toLowerCase().includes('methanol')) ||
                      (contentType === 'Cement/Barite' && (t.contents.toLowerCase().includes('cement') || t.contents.toLowerCase().includes('barite'))) ||
                      (contentType === 'Trash Fluid' && t.contents.toLowerCase().includes('trash')) ||
                      (contentType === 'Other' && !t.contents.toLowerCase().includes('mud') && !t.contents.toLowerCase().includes('methanol') && !t.contents.toLowerCase().includes('cement') && !t.contents.toLowerCase().includes('barite') && !t.contents.toLowerCase().includes('trash') && t.contents !== "Empty")
                    )).reduce((tSum, t) => tSum + t.currentLevel, 0), 0)} bbl</td>
                </tr>
              ))}
              <tr className="bg-gray-50">
                <td className="p-2 border font-medium">Available Capacity</td>
                {vessels.map(vessel => {const totalCapacity = vessel.tanks.reduce((sum, t) => sum + t.capacity, 0); const usedCapacity = vessel.tanks.reduce((sum, t) => sum + t.currentLevel, 0); const availableCapacity = totalCapacity - usedCapacity; return (<td key={vessel.id} className="p-2 border text-center font-medium">{availableCapacity} bbl<div className="text-xs text-gray-600">{totalCapacity ? Math.round((availableCapacity / totalCapacity) * 100) : 0}% available</div></td>);})}
                <td className="p-2 border text-center font-medium">{vessels.reduce((sum, vessel) => {const totalCapacity = vessel.tanks.reduce((tSum, t) => tSum + t.capacity, 0); const usedCapacity = vessel.tanks.reduce((tSum, t) => tSum + t.currentLevel, 0); return sum + (totalCapacity - usedCapacity);}, 0)} bbl</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FleetComparisonTab;