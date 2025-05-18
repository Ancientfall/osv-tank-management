// src/components/TankManagementTab.jsx
import React, { useState } from 'react';
import { getStatusColor, getClientColor } from '../utils/uiHelpers.jsx'; // Import helpers

const TankManagementTab = ({
  vessels,
  selectedVessel,
  onSetSelectedVessel,
  expandedTank,
  onSetExpandedTank
}) => {
  if (!selectedVessel) return <div className="p-4">Please select a vessel.</div>; // Handle no vessel selected

  // State to track if we're highlighting pump systems
  const [highlightPumpSystem, setHighlightPumpSystem] = useState(null);

  // Group tanks by type for better organization
  const liquidTanks = selectedVessel.tanks.filter(t => t.type === "LIQUID");
  const methanolTanks = selectedVessel.tanks.filter(t => t.type === "METHANOL");
  const slopTanks = selectedVessel.tanks.filter(t => t.type === "SLOP");
  const dryBulkTanks = selectedVessel.tanks.filter(t => t.type === "DRY BULK");

  // Group tanks by pump system
  const pumpSystems = {};
  selectedVessel.tanks.forEach(tank => {
    // Skip Dry Bulk tanks as they're not part of a pump system
    if (tank.type === "DRY BULK") return;
    
    const pumpId = tank.pumpSystemId || 0;
    if (!pumpSystems[pumpId]) {
      pumpSystems[pumpId] = [];
    }
    pumpSystems[pumpId].push(tank);
  });

  // Get unique pump system IDs
  const pumpSystemIds = Object.keys(pumpSystems).map(Number).sort((a, b) => a - b);

  // Add state for transfer planning mode
  const [planningMode, setPlanningMode] = useState(false);
  const [selectedTanks, setSelectedTanks] = useState([]);
  const [transferSteps, setTransferSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState({
    tanks: [],
    note: ""
  });
  
  // Get a friendly name for each pump system
  const getPumpSystemName = (pumpId) => {
    switch(pumpId) {
      case 4:
        return "Methanol System";
      case 5:
        return "Slop Tank System";
      default:
        return `System ${pumpId}`;
    }
  };

  // Define colors for different pump systems
  const getPumpSystemColor = (pumpId) => {
    const colors = {
      1: 'bg-blue-200 border-blue-400',
      2: 'bg-green-200 border-green-400',
      3: 'bg-yellow-200 border-yellow-400',
      4: 'bg-purple-200 border-purple-400', // Methanol System
      5: 'bg-red-200 border-red-400',       // Slop Tank System
    };
    return colors[pumpId] || 'bg-gray-100 border-gray-300';
  };

  // Define constraints for different tank types
  const getTankConstraints = (tankType) => {
    switch(tankType) {
      case "DRY BULK":
        return "Can only contain dry materials (cement, barite, etc.). Cannot contain any fluids.";
      case "SLOP":
        return "Can only contain waste fluids. Cannot contain muds or brines.";
      case "METHANOL":
        return "Primarily for methanol storage. Requires special handling.";
      case "LIQUID":
        return "Can contain various fluids including muds and brines.";
      default:
        return "Standard tank with no special constraints.";
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl mb-4">Tank Management</h2>
      
      <div className="flex justify-between items-center mb-4">
        <select 
          className="border p-2 rounded shadow-sm"
          value={selectedVessel.id}
          onChange={(e) => {
            const newSelectedVessel = vessels.find(v => v.id === parseInt(e.target.value));
            if (newSelectedVessel) {
              onSetSelectedVessel(newSelectedVessel);
              onSetExpandedTank(null); // Reset expanded tank when vessel changes
              setHighlightPumpSystem(null); // Reset pump system highlight
              setPlanningMode(false); // Exit planning mode when vessel changes
              setSelectedTanks([]);
            }
          }}
        >
          {vessels.map(vessel => (
            <option key={vessel.id} value={vessel.id}>{vessel.name}</option>
          ))}
        </select>
        
        <div className="flex space-x-2">
          <button 
            className={`px-4 py-2 rounded text-sm font-medium ${planningMode 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            onClick={() => {
              setPlanningMode(!planningMode);
              if (planningMode) {
                // Exiting planning mode, reset everything
                setSelectedTanks([]);
                setTransferSteps([]);
                setCurrentStep({ tanks: [], note: "" });
              } else {
                // Entering planning mode
                setHighlightPumpSystem(null);
                onSetExpandedTank(null);
              }
            }}
          >
            {planningMode ? 'Exit Planning Mode' : 'Plan Transfer Operation'}
          </button>
          
          {planningMode && selectedTanks.length > 0 && (
            <button
              className="px-4 py-2 rounded text-sm font-medium bg-green-600 text-white hover:bg-green-700"
              onClick={() => {
                // In a real app, this would generate a document or email
                alert(`Transfer plan created with ${selectedTanks.length} tanks selected`);
              }}
            >
              Generate Transfer Plan
            </button>
          )}
        </div>
      </div>
      
      {planningMode && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h4 className="font-medium mb-3 flex items-center text-blue-800">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Transfer Planning Mode
          </h4>

          {/* Steps List */}
          {transferSteps.length > 0 && (
            <div className="mb-4 border-b border-blue-200 pb-3">
              <h5 className="text-sm font-medium text-blue-700 mb-2">Transfer Steps:</h5>
              <div className="space-y-2">
                {transferSteps.map((step, index) => (
                  <div key={index} className="bg-white rounded p-2 border border-blue-200 flex justify-between items-center">
                    <div>
                      <div className="font-medium text-sm">Step {index + 1}:</div>
                      <div className="text-xs text-gray-600">
                        Tanks: {step.tanks.join(', ')}
                      </div>
                      <div className="text-xs mt-1">{step.note}</div>
                    </div>
                    <div className="flex space-x-1">
                      <button 
                        className="text-blue-500 hover:text-blue-700 p-1"
                        onClick={() => {
                          // Load this step for editing
                          setCurrentStep(step);
                          setSelectedTanks(step.tanks);
                          // Remove this step from the list
                          setTransferSteps(prev => prev.filter((_, i) => i !== index));
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 0L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button 
                        className="text-red-500 hover:text-red-700 p-1"
                        onClick={() => {
                          // Remove this step
                          setTransferSteps(prev => prev.filter((_, i) => i !== index));
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Current step editing */}
          <div>
            <h5 className="text-sm font-medium text-blue-700 mb-2">
              {transferSteps.length > 0 ? `Step ${transferSteps.length + 1}:` : 'Create Transfer Step:'}
            </h5>
            <p className="text-sm text-blue-700 mb-2">Click on tanks to select them for this step. Add a note describing the operation.</p>
            
            <div className="flex flex-col space-y-2">
              <div className="flex items-center">
                <span className="text-sm text-blue-700 w-24">Selected Tanks:</span>
                <div className="flex flex-wrap gap-1">
                  {selectedTanks.length === 0 ? (
                    <span className="text-sm text-gray-500 italic">No tanks selected</span>
                  ) : (
                    selectedTanks.map(tankId => {
                      const tank = selectedVessel.tanks.find(t => t.id === tankId);
                      return (
                        <span key={tankId} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full flex items-center">
                          {tankId} ({tank?.contents || 'Unknown'})
                          <button 
                            className="ml-1 text-blue-500 hover:text-blue-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTanks(prev => prev.filter(id => id !== tankId));
                              setCurrentStep(prev => ({
                                ...prev,
                                tanks: prev.tanks.filter(id => id !== tankId)
                              }));
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </span>
                      );
                    })
                  )}
                </div>
              </div>
              
              <div className="mt-2">
                <label className="text-sm text-blue-700 block mb-1">Step Instructions:</label>
                <textarea 
                  className="w-full p-2 border border-blue-200 rounded text-sm"
                  placeholder="Add details about this step (e.g., '1,500 bbls of Base oil in LMT #6's for OBH')"
                  value={currentStep.note}
                  onChange={(e) => setCurrentStep(prev => ({ ...prev, note: e.target.value }))}
                  rows={2}
                />
              </div>

              <div className="flex justify-end space-x-2 mt-2">
                <button 
                  className="px-3 py-1 bg-gray-100 text-gray-800 rounded text-sm hover:bg-gray-200"
                  onClick={() => {
                    setSelectedTanks([]);
                    setCurrentStep({ tanks: [], note: "" });
                  }}
                >
                  Clear
                </button>
                <button 
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  disabled={selectedTanks.length === 0 || !currentStep.note.trim()}
                  onClick={() => {
                    // Add current step to steps
                    setTransferSteps(prev => [...prev, { 
                      tanks: [...selectedTanks], 
                      note: currentStep.note 
                    }]);
                    // Clear for next step
                    setSelectedTanks([]);
                    setCurrentStep({ tanks: [], note: "" });
                  }}
                >
                  {transferSteps.length > 0 ? 'Add Step' : 'Create First Step'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Transfer Plan Preview - Added feature */}
      {planningMode && transferSteps.length > 0 && (
        <div className="mb-6 bg-white border rounded-lg p-4 shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Multi-Step Transfer Plan Preview</h3>
          
          <div className="relative border-2 border-blue-200 rounded-lg p-6 bg-blue-50 mb-3">
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              Transfer Plan: {selectedVessel.name} ({transferSteps.length} {transferSteps.length === 1 ? 'step' : 'steps'})
            </div>
            
            <div className="mt-8">
              {/* Steps Timeline */}
              <div className="relative">
                {transferSteps.map((step, index) => (
                  <div key={index} className="mb-10 relative">
                    <div className="flex items-center mb-2">
                      <div className="bg-blue-600 text-white font-bold rounded-full w-6 h-6 flex items-center justify-center mr-2 z-10">
                        {index + 1}
                      </div>
                      <h4 className="font-medium text-blue-800">Step {index + 1}</h4>
                    </div>
                    
                    {/* Line connecting steps */}
                    {index < transferSteps.length - 1 && (
                      <div className="absolute left-3 top-6 bottom-0 w-0.5 bg-blue-300 -mb-8"></div>
                    )}
                    
                    {/* Step Content */}
                    <div className="ml-8">
                      {/* Simplified tank grid */}
                      <div className="grid grid-cols-4 gap-2 mb-3">
                        {step.tanks.map(tankId => {
                          const tank = selectedVessel.tanks.find(t => t.id === tankId);
                          if (!tank) return null;
                          
                          return (
                            <div 
                              key={tankId}
                              className={`bg-white p-2 rounded-lg border-2 border-blue-400 shadow-sm relative`}
                            >
                              <div className="font-bold text-sm">{tankId}</div>
                              <div className="text-xs">{tank.capacity} bbl</div>
                              <div className="text-xs font-medium">{tank.contents}</div>
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Step Instructions */}
                      <div className="bg-blue-600 text-white p-2 rounded-lg shadow mb-2 text-sm">
                        {step.note}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <button 
              className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200"
              onClick={() => {
                // Create downloadable transfer plan
                const transferPlanData = {
                  vessel: selectedVessel.name,
                  date: new Date().toISOString().split('T')[0],
                  steps: transferSteps.map((step, index) => ({
                    stepNumber: index + 1,
                    tanks: step.tanks.map(tankId => {
                      const tank = selectedVessel.tanks.find(t => t.id === tankId);
                      return {
                        id: tank.id,
                        type: tank.type,
                        capacity: tank.capacity,
                        contents: tank.contents,
                        currentLevel: tank.currentLevel
                      };
                    }),
                    instructions: step.note
                  }))
                };
                
                // Create a "download link" for JSON
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(transferPlanData, null, 2));
                const downloadAnchorNode = document.createElement('a');
                downloadAnchorNode.setAttribute("href", dataStr);
                downloadAnchorNode.setAttribute("download", `transfer-plan-${selectedVessel.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`);
                document.body.appendChild(downloadAnchorNode);
                downloadAnchorNode.click();
                downloadAnchorNode.remove();
              }}
            >
              Download Plan
            </button>
            <button 
              className="px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700"
              onClick={() => {
                // Prepare email content
                const subject = `Multi-Step Transfer Plan for ${selectedVessel.name} - ${new Date().toISOString().split('T')[0]}`;
                
                // Format the body with step details
                let body = `Transfer Plan for ${selectedVessel.name}\n\n`;
                transferSteps.forEach((step, index) => {
                  body += `STEP ${index + 1}:\n`;
                  body += `Tanks: ${step.tanks.join(', ')}\n`;
                  body += `Instructions: ${step.note}\n\n`;
                });
                
                // Create mailto link
                const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                window.open(mailtoLink);
              }}
            >
              Email Plan
            </button>
          </div>
        </div>
      )}
      
      {/* Pump System Legend */}
      <div className="mb-4 bg-white border rounded-lg p-3 shadow-sm">
        <h4 className="font-medium mb-2">Connected Pump Systems</h4>
        <div className="text-sm mb-2">Tanks belonging to the same pump system are physically connected and can be used to carry compatible fluids.</div>
        <div className="flex flex-wrap gap-2">
          {pumpSystemIds.map(pumpId => (
            <button
              key={pumpId}
              className={`px-3 py-1 rounded-full text-sm border ${highlightPumpSystem === pumpId ? 'ring-2 ring-offset-1 ring-blue-500' : ''}`}
              style={{
                backgroundColor: highlightPumpSystem === pumpId ? `rgba(${pumpId * 40}, ${150 - pumpId * 10}, ${200 - pumpId * 20}, 0.3)` : 'transparent',
                borderColor: `rgba(${pumpId * 40}, ${150 - pumpId * 10}, ${200 - pumpId * 20}, 0.8)`
              }}
              onClick={() => setHighlightPumpSystem(highlightPumpSystem === pumpId ? null : pumpId)}
            >
              {getPumpSystemName(pumpId)} ({pumpSystems[pumpId]?.length || 0} tanks)
            </button>
          ))}
          {highlightPumpSystem && (
            <button
              className="px-3 py-1 rounded-full text-sm border border-gray-300 bg-gray-100"
              onClick={() => setHighlightPumpSystem(null)}
            >
              Clear Selection
            </button>
          )}
        </div>
      </div>
      
      {/* Tank Visualization - Optimized for smaller horizontal layout */}
      <div className="mb-6 bg-white border rounded-lg p-4 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">
          Tank Layout - {selectedVessel.name}
        </h3>
        
        <div className="relative border-2 border-gray-300 rounded-lg p-6 bg-gray-50">
          <div className="absolute top-2 left-1/4 transform -translate-x-1/2 text-gray-600 font-medium">STARBOARD</div>
          <div className="absolute top-2 right-1/4 transform translate-x-1/2 text-gray-600 font-medium">PORTSIDE</div>
          
          {/* Liquid tanks (in paired rows) */}
          <div className="mb-6">
            <div className="text-center mb-3 font-medium text-gray-700 border-b pb-2">Liquid Tanks</div>
            {[1, 2, 3, 4, 5, 6].map((tankNum) => {
              const starboardTank = liquidTanks.find(t => t.id === `Tk ${tankNum}S`);
              const portTank = liquidTanks.find(t => t.id === `Tk ${tankNum}P`);
              
              if (!starboardTank && !portTank) return null;
              
              return (
                <div key={tankNum} className="flex mb-2">
                  {/* Starboard Tank (Left) - Reduced width */}
                  <div className="w-5/12 pr-1">
                    {starboardTank && (
                      <div 
                        className={`${getStatusColor(starboardTank)} p-1.5 rounded relative cursor-pointer hover:shadow-md transition-shadow ${
                          planningMode ? (
                            selectedTanks.includes(starboardTank.id) 
                              ? 'border-2 border-blue-500 ring-2 ring-blue-300' 
                              : 'border border-gray-300'
                          ) : (
                            highlightPumpSystem !== null 
                              ? (starboardTank.pumpSystemId === highlightPumpSystem 
                                  ? `border-2 border-blue-500` 
                                  : `border border-gray-300 opacity-50`)
                              : `border border-gray-300`
                          )
                        }`}
                        onClick={() => {
                          if (planningMode) {
                            setSelectedTanks(prev => 
                              prev.includes(starboardTank.id) 
                                ? prev.filter(id => id !== starboardTank.id)
                                : [...prev, starboardTank.id]
                            );
                          } else {
                            onSetExpandedTank(expandedTank === starboardTank.id ? null : starboardTank.id);
                          }
                        }}
                        style={{
                          borderColor: planningMode && selectedTanks.includes(starboardTank.id)
                            ? 'rgb(59, 130, 246)' // blue-500
                            : highlightPumpSystem === starboardTank.pumpSystemId 
                              ? `rgba(${starboardTank.pumpSystemId * 40}, ${150 - starboardTank.pumpSystemId * 10}, ${200 - starboardTank.pumpSystemId * 20}, 0.8)`
                              : ''
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <div className="text-xs font-bold">{starboardTank.id}</div>
                          <div className="text-xs bg-blue-100 px-1 rounded text-blue-800">{
                            starboardTank.pumpSystemId === 4 ? "Methanol" : 
                            starboardTank.pumpSystemId === 5 ? "Slop" : 
                            `PS-${starboardTank.pumpSystemId}`
                          }</div>
                        </div>
                        <div className="text-xs">{starboardTank.capacity} bbl</div>
                        <div className="text-xs truncate">{starboardTank.contents}</div>
                        {starboardTank.client && (
                          <div className={`text-xs mt-1 ${getClientColor(starboardTank.client)} px-1 py-0.5 rounded-sm text-center`}>
                            {starboardTank.client.split(' ').pop()}
                          </div>
                        )}
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                          <div 
                            className={`h-1.5 rounded-full ${starboardTank.currentLevel/starboardTank.capacity > 0.8 ? 'bg-red-600' : 'bg-green-600'}`}
                            style={{ width: `${Math.min(100, (starboardTank.currentLevel/(starboardTank.capacity || 1)) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Center connection line */}
                  <div className="flex-none w-2/12 relative flex justify-center">
                    <div className="absolute h-1/2 border-l border-gray-400"></div>
                    <div className="absolute w-full top-1/2 border-t border-gray-400"></div>
                    <div className="absolute h-1/2 bottom-0 border-l border-gray-400"></div>
                  </div>
                  
                  {/* Port Tank (Right) - Reduced width */}
                  <div className="w-5/12 pl-1">
                    {portTank && (
                      <div 
                        className={`${getStatusColor(portTank)} p-1.5 rounded relative cursor-pointer hover:shadow-md transition-shadow ${
                          planningMode ? (
                            selectedTanks.includes(portTank.id) 
                              ? 'border-2 border-blue-500 ring-2 ring-blue-300' 
                              : 'border border-gray-300'
                          ) : (
                            highlightPumpSystem !== null 
                              ? (portTank.pumpSystemId === highlightPumpSystem 
                                  ? `border-2 border-blue-500` 
                                  : `border border-gray-300 opacity-50`)
                              : `border border-gray-300`
                          )
                        }`}
                        onClick={() => {
                          if (planningMode) {
                            setSelectedTanks(prev => 
                              prev.includes(portTank.id) 
                                ? prev.filter(id => id !== portTank.id)
                                : [...prev, portTank.id]
                            );
                          } else {
                            onSetExpandedTank(expandedTank === portTank.id ? null : portTank.id);
                          }
                        }}
                        style={{
                          borderColor: planningMode && selectedTanks.includes(portTank.id)
                            ? 'rgb(59, 130, 246)' // blue-500
                            : highlightPumpSystem === portTank.pumpSystemId 
                              ? `rgba(${portTank.pumpSystemId * 40}, ${150 - portTank.pumpSystemId * 10}, ${200 - portTank.pumpSystemId * 20}, 0.8)`
                              : ''
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <div className="text-xs font-bold">{portTank.id}</div>
                          <div className="text-xs bg-blue-100 px-1 rounded text-blue-800">{
                            portTank.pumpSystemId === 4 ? "Methanol" : 
                            portTank.pumpSystemId === 5 ? "Slop" : 
                            `PS-${portTank.pumpSystemId}`
                          }</div>
                        </div>
                        <div className="text-xs">{portTank.capacity} bbl</div>
                        <div className="text-xs truncate">{portTank.contents}</div>
                        {portTank.client && (
                          <div className={`text-xs mt-1 ${getClientColor(portTank.client)} px-1 py-0.5 rounded-sm text-center`}>
                            {portTank.client.split(' ').pop()}
                          </div>
                        )}
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                          <div 
                            className={`h-1.5 rounded-full ${portTank.currentLevel/portTank.capacity > 0.8 ? 'bg-red-600' : 'bg-green-600'}`}
                            style={{ width: `${Math.min(100, (portTank.currentLevel/(portTank.capacity || 1)) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Methanol tanks - Added dedicated section for methanol tanks */}
          {methanolTanks.length > 0 && (
            <div className="mb-6">
              <div className="text-center mb-3 font-medium text-gray-700 border-b pb-2">
                Methanol Tanks
                <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">Special Handling Required</span>
              </div>
              {[1, 2].map((tankNum) => {
                const starboardTank = methanolTanks.find(t => t.id === `Meth ${tankNum}S`);
                const portTank = methanolTanks.find(t => t.id === `Meth ${tankNum}P`);
                
                if (!starboardTank && !portTank) return null;
                
                return (
                  <div key={`meth-${tankNum}`} className="flex mb-2">
                    {/* Starboard Methanol Tank (Left) */}
                    <div className="w-5/12 pr-1">
                      {starboardTank && (
                        <div 
                          className={`${getStatusColor(starboardTank)} p-1.5 rounded relative cursor-pointer hover:shadow-md transition-shadow ${
                            planningMode ? (
                              selectedTanks.includes(starboardTank.id) 
                                ? 'border-2 border-blue-500 ring-2 ring-blue-300' 
                                : 'border border-gray-300'
                            ) : (
                              highlightPumpSystem !== null 
                                ? (starboardTank.pumpSystemId === highlightPumpSystem 
                                    ? `border-2 border-blue-500` 
                                    : `border border-purple-300 opacity-50`)
                                : `border border-purple-300`
                            )
                          }`}
                          onClick={() => {
                            if (planningMode) {
                              setSelectedTanks(prev => 
                                prev.includes(starboardTank.id) 
                                  ? prev.filter(id => id !== starboardTank.id)
                                  : [...prev, starboardTank.id]
                              );
                              // Also update the current step
                              setCurrentStep(prev => ({
                                ...prev,
                                tanks: prev.tanks.includes(starboardTank.id)
                                  ? prev.tanks.filter(id => id !== starboardTank.id)
                                  : [...prev.tanks, starboardTank.id]
                              }));
                            } else {
                              onSetExpandedTank(expandedTank === starboardTank.id ? null : starboardTank.id);
                            }
                          }}
                          style={{
                            borderColor: planningMode && selectedTanks.includes(starboardTank.id)
                              ? 'rgb(59, 130, 246)' // blue-500
                              : highlightPumpSystem === starboardTank.pumpSystemId 
                                ? `rgba(${starboardTank.pumpSystemId * 40}, ${150 - starboardTank.pumpSystemId * 10}, ${200 - starboardTank.pumpSystemId * 20}, 0.8)`
                                : ''
                          }}
                        >
                          <div className="flex justify-between items-center">
                            <div className="text-xs font-bold text-purple-700">{starboardTank.id}</div>
                            <div className="text-xs bg-purple-100 px-1 rounded text-purple-800">Methanol</div>
                          </div>
                          <div className="text-xs">{starboardTank.capacity} bbl</div>
                          <div className="text-xs truncate">{starboardTank.contents}</div>
                          {starboardTank.client && (
                            <div className={`text-xs mt-1 ${getClientColor(starboardTank.client)} px-1 py-0.5 rounded-sm text-center`}>
                              {starboardTank.client.split(' ').pop()}
                            </div>
                          )}
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                            <div 
                              className={`h-1.5 rounded-full ${starboardTank.currentLevel/starboardTank.capacity > 0.8 ? 'bg-red-600' : 'bg-purple-600'}`}
                              style={{ width: `${Math.min(100, (starboardTank.currentLevel/(starboardTank.capacity || 1)) * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Center connection line */}
                    <div className="flex-none w-2/12 relative flex justify-center">
                      <div className="absolute h-1/2 border-l border-gray-400"></div>
                      <div className="absolute w-full top-1/2 border-t border-gray-400"></div>
                      <div className="absolute h-1/2 bottom-0 border-l border-gray-400"></div>
                    </div>
                    
                    {/* Port Methanol Tank (Right) */}
                    <div className="w-5/12 pl-1">
                      {portTank && (
                        <div 
                          className={`${getStatusColor(portTank)} p-1.5 rounded relative cursor-pointer hover:shadow-md transition-shadow ${
                            planningMode ? (
                              selectedTanks.includes(portTank.id) 
                                ? 'border-2 border-blue-500 ring-2 ring-blue-300' 
                                : 'border border-gray-300'
                            ) : (
                              highlightPumpSystem !== null 
                                ? (portTank.pumpSystemId === highlightPumpSystem 
                                    ? `border-2 border-blue-500` 
                                    : `border border-purple-300 opacity-50`)
                                : `border border-purple-300`
                            )
                          }`}
                          onClick={() => {
                            if (planningMode) {
                              setSelectedTanks(prev => 
                                prev.includes(portTank.id) 
                                  ? prev.filter(id => id !== portTank.id)
                                  : [...prev, portTank.id]
                              );
                              // Also update the current step
                              setCurrentStep(prev => ({
                                ...prev,
                                tanks: prev.tanks.includes(portTank.id)
                                  ? prev.tanks.filter(id => id !== portTank.id)
                                  : [...prev.tanks, portTank.id]
                              }));
                            } else {
                              onSetExpandedTank(expandedTank === portTank.id ? null : portTank.id);
                            }
                          }}
                          style={{
                            borderColor: planningMode && selectedTanks.includes(portTank.id)
                              ? 'rgb(59, 130, 246)' // blue-500
                              : highlightPumpSystem === portTank.pumpSystemId 
                                ? `rgba(${portTank.pumpSystemId * 40}, ${150 - portTank.pumpSystemId * 10}, ${200 - portTank.pumpSystemId * 20}, 0.8)`
                                : ''
                          }}
                        >
                          <div className="flex justify-between items-center">
                            <div className="text-xs font-bold text-purple-700">{portTank.id}</div>
                            <div className="text-xs bg-purple-100 px-1 rounded text-purple-800">Methanol</div>
                          </div>
                          <div className="text-xs">{portTank.capacity} bbl</div>
                          <div className="text-xs truncate">{portTank.contents}</div>
                          {portTank.client && (
                            <div className={`text-xs mt-1 ${getClientColor(portTank.client)} px-1 py-0.5 rounded-sm text-center`}>
                              {portTank.client.split(' ').pop()}
                            </div>
                          )}
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                            <div 
                              className={`h-1.5 rounded-full ${portTank.currentLevel/portTank.capacity > 0.8 ? 'bg-red-600' : 'bg-purple-600'}`}
                              style={{ width: `${Math.min(100, (portTank.currentLevel/(portTank.capacity || 1)) * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Slop tanks - Added dedicated section for slop tanks */}
          {slopTanks.length > 0 && (
            <div className="mb-6">
              <div className="text-center mb-3 font-medium text-gray-700 border-b pb-2">
                Slop Tanks
                <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Waste Fluids Only</span>
              </div>
              {[1, 2].map((tankNum) => {
                const starboardTank = slopTanks.find(t => t.id === `Slop ${tankNum}S`);
                const portTank = slopTanks.find(t => t.id === `Slop ${tankNum}P`);
                
                if (!starboardTank && !portTank) return null;
                
                return (
                  <div key={`slop-${tankNum}`} className="flex mb-2">
                    {/* Starboard Slop Tank (Left) */}
                    <div className="w-5/12 pr-1">
                      {starboardTank && (
                        <div 
                          className={`${getStatusColor(starboardTank)} p-1.5 rounded relative cursor-pointer hover:shadow-md transition-shadow ${
                            highlightPumpSystem !== null 
                              ? (starboardTank.pumpSystemId === highlightPumpSystem 
                                  ? `border-2 border-blue-500` 
                                  : `border border-yellow-300 opacity-50`)
                              : `border border-yellow-300`
                          }`}
                          onClick={() => onSetExpandedTank(expandedTank === starboardTank.id ? null : starboardTank.id)}
                          style={{
                            borderColor: highlightPumpSystem === starboardTank.pumpSystemId 
                              ? `rgba(${starboardTank.pumpSystemId * 40}, ${150 - starboardTank.pumpSystemId * 10}, ${200 - starboardTank.pumpSystemId * 20}, 0.8)`
                              : ''
                          }}
                        >
                          <div className="flex justify-between items-center">
                            <div className="text-xs font-bold text-yellow-700">{starboardTank.id}</div>
                            <div className="text-xs bg-yellow-100 px-1 rounded text-yellow-800">Slop</div>
                          </div>
                          <div className="text-xs">{starboardTank.capacity} bbl</div>
                          <div className="text-xs truncate">{starboardTank.contents}</div>
                          {starboardTank.client && (
                            <div className={`text-xs mt-1 ${getClientColor(starboardTank.client)} px-1 py-0.5 rounded-sm text-center`}>
                              {starboardTank.client.split(' ').pop()}
                            </div>
                          )}
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                            <div 
                              className={`h-1.5 rounded-full ${starboardTank.currentLevel/starboardTank.capacity > 0.8 ? 'bg-red-600' : 'bg-yellow-600'}`}
                              style={{ width: `${Math.min(100, (starboardTank.currentLevel/(starboardTank.capacity || 1)) * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Center connection line */}
                    <div className="flex-none w-2/12 relative flex justify-center">
                      <div className="absolute h-1/2 border-l border-gray-400"></div>
                      <div className="absolute w-full top-1/2 border-t border-gray-400"></div>
                      <div className="absolute h-1/2 bottom-0 border-l border-gray-400"></div>
                    </div>
                    
                    {/* Port Slop Tank (Right) */}
                    <div className="w-5/12 pl-1">
                      {portTank && (
                        <div 
                          className={`${getStatusColor(portTank)} p-1.5 rounded relative cursor-pointer hover:shadow-md transition-shadow ${
                            highlightPumpSystem !== null 
                              ? (portTank.pumpSystemId === highlightPumpSystem 
                                  ? `border-2 border-blue-500` 
                                  : `border border-yellow-300 opacity-50`)
                              : `border border-yellow-300`
                          }`}
                          onClick={() => onSetExpandedTank(expandedTank === portTank.id ? null : portTank.id)}
                          style={{
                            borderColor: highlightPumpSystem === portTank.pumpSystemId 
                              ? `rgba(${portTank.pumpSystemId * 40}, ${150 - portTank.pumpSystemId * 10}, ${200 - portTank.pumpSystemId * 20}, 0.8)`
                              : ''
                          }}
                        >
                          <div className="flex justify-between items-center">
                            <div className="text-xs font-bold text-yellow-700">{portTank.id}</div>
                            <div className="text-xs bg-yellow-100 px-1 rounded text-yellow-800">Slop</div>
                          </div>
                          <div className="text-xs">{portTank.capacity} bbl</div>
                          <div className="text-xs truncate">{portTank.contents}</div>
                          {portTank.client && (
                            <div className={`text-xs mt-1 ${getClientColor(portTank.client)} px-1 py-0.5 rounded-sm text-center`}>
                              {portTank.client.split(' ').pop()}
                            </div>
                          )}
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                            <div 
                              className={`h-1.5 rounded-full ${portTank.currentLevel/portTank.capacity > 0.8 ? 'bg-red-600' : 'bg-yellow-600'}`}
                              style={{ width: `${Math.min(100, (portTank.currentLevel/(portTank.capacity || 1)) * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Dry bulk tanks - Updated to show they're independent */}
          {dryBulkTanks.length > 0 && (
            <div>
              <div className="text-center mb-3 font-medium text-gray-700 border-b pb-2">
                Dry Bulk Tanks
                <span className="ml-2 text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full">Independent Tanks - Dry Materials Only</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {dryBulkTanks.map(tank => (
                  <div 
                    key={tank.id}
                    className={`${getStatusColor(tank)} p-1.5 rounded relative cursor-pointer hover:shadow-md transition-shadow ${
                      planningMode ? (
                        selectedTanks.includes(tank.id) 
                          ? 'border-2 border-blue-500 ring-2 ring-blue-300' 
                          : 'border border-gray-300'
                      ) : (
                        highlightPumpSystem !== null ? 'border border-gray-300 opacity-50' : 'border border-gray-300'
                      )
                    }`}
                    onClick={() => {
                      if (planningMode) {
                        setSelectedTanks(prev => 
                          prev.includes(tank.id) 
                            ? prev.filter(id => id !== tank.id)
                            : [...prev, tank.id]
                        );
                        // Also update the current step
                        setCurrentStep(prev => ({
                          ...prev,
                          tanks: prev.tanks.includes(tank.id)
                            ? prev.tanks.filter(id => id !== tank.id)
                            : [...prev.tanks, tank.id]
                        }));
                      } else {
                        onSetExpandedTank(expandedTank === tank.id ? null : tank.id);
                      }
                    }}
                    style={{
                      borderColor: planningMode && selectedTanks.includes(tank.id)
                        ? 'rgb(59, 130, 246)' // blue-500
                        : ''
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <div className="text-xs font-bold">{tank.id}</div>
                      <div className="text-xs bg-gray-200 px-1 rounded text-gray-700">Independent</div>
                    </div>
                    <div className="text-xs">{tank.capacity} bbl</div>
                    <div className="text-xs truncate">{tank.contents}</div>
                    {tank.client && (
                      <div className={`text-xs mt-1 ${getClientColor(tank.client)} px-1 py-0.5 rounded-sm text-center`}>
                        {tank.client.split(' ').pop()}
                      </div>
                    )}
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                      <div 
                        className={`h-1.5 rounded-full ${tank.currentLevel/(tank.capacity||1) > 0.8 ? 'bg-red-600' : 'bg-green-600'}`}
                        style={{ width: `${Math.min(100, (tank.currentLevel/(tank.capacity||1)) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Expanded Tank Details */}
          {expandedTank && (
            <div className="mt-4 p-4 bg-white border rounded-lg shadow">
              {(() => {
                const tank = selectedVessel.tanks.find(t => t.id === expandedTank);
                if (!tank) return null;
                
                return (
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-lg flex items-center">
                        {tank.id} Details
                        {tank.type !== "DRY BULK" && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                            {tank.pumpSystemId === 4 ? "Methanol System" : 
                             tank.pumpSystemId === 5 ? "Slop Tank System" : 
                             `Pump System ${tank.pumpSystemId}`}
                          </span>
                        )}
                        {tank.type === "DRY BULK" && (
                          <span className="ml-2 text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full">
                            Independent Tank
                          </span>
                        )}
                      </h4>
                      <button 
                        className="text-gray-500 hover:text-gray-700"
                        onClick={() => onSetExpandedTank(null)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h5 className="font-medium mb-2 text-blue-800">Tank Information</h5>
                        <div className="space-y-2">
                          <div className="flex justify-between"><span className="text-gray-600">Type:</span><span className="font-medium">{tank.type}</span></div>
                          <div className="flex justify-between"><span className="text-gray-600">Capacity:</span><span>{tank.capacity} bbl</span></div>
                          <div className="flex justify-between"><span className="text-gray-600">Last Cleaned:</span><span>{tank.lastCleaning}</span></div>
                          <div className="flex justify-between"><span className="text-gray-600">Cleaning History:</span><span>{tank.history}</span></div>
                        </div>
                        <div className="mt-3 p-2 bg-gray-50 border rounded text-sm">
                          <div className="font-medium mb-1 text-gray-700">Tank Constraints:</div>
                          <div className="text-gray-600">{getTankConstraints(tank.type)}</div>
                        </div>
                      </div>
                      <div>
                        <h5 className="font-medium mb-2 text-blue-800">Current Status</h5>
                        <div className="space-y-2">
                          <div className="flex justify-between"><span className="text-gray-600">Content:</span><span className="font-medium">{tank.contents}</span></div>
                          <div className="flex justify-between"><span className="text-gray-600">Current Level:</span><span>{tank.currentLevel} bbl ({Math.round((tank.currentLevel/(tank.capacity||1)) * 100)}%)</span></div>
                          <div className="flex justify-between"><span className="text-gray-600">Available Space:</span><span>{tank.capacity - tank.currentLevel} bbl</span></div>
                          <div className="flex justify-between"><span className="text-gray-600">Pressure:</span><span>{tank.pressure} bar</span></div>
                        </div>
                        {tank.type !== "DRY BULK" && (
                          <div className="mt-3 p-2 bg-gray-50 border rounded text-sm">
                            <div className="font-medium mb-1 text-gray-700">Pump System Information:</div>
                            <div className="text-gray-600">
                              This tank belongs to {tank.pumpSystemId === 4 ? "Methanol System" : 
                                                   tank.pumpSystemId === 5 ? "Slop Tank System" : 
                                                   `Pump System ${tank.pumpSystemId}`}
                              <ul className="mt-1 list-disc pl-4">
                                <li>Total tanks in system: {pumpSystems[tank.pumpSystemId]?.length || 0}</li>
                                <li>Total capacity: {pumpSystems[tank.pumpSystemId]?.reduce((sum, t) => sum + t.capacity, 0) || 0} bbl</li>
                                <li>Currently used: {pumpSystems[tank.pumpSystemId]?.reduce((sum, t) => sum + t.currentLevel, 0) || 0} bbl</li>
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                      <div>
                        <h5 className="font-medium mb-2 text-blue-800">Assignment</h5>
                        <div className="space-y-2">
                          <div className="flex justify-between"><span className="text-gray-600">Client:</span><span className={getClientColor(tank.client)}>{tank.client || "Unassigned"}</span></div>
                          {tank.type !== "DRY BULK" && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">System:</span>
                              <span>
                                {tank.pumpSystemId === 4 ? "Methanol System" : 
                                 tank.pumpSystemId === 5 ? "Slop Tank System" : 
                                 `System ${tank.pumpSystemId}`}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="mt-4">
                          <h5 className="font-medium mb-2 text-blue-800">Quick Actions</h5>
                          <div className="flex flex-col space-y-2">
                            <button className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm hover:bg-blue-200 transition">Schedule Cleaning</button>
                            <button 
                              className={`${tank.type === 'DRY BULK' ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-green-100 text-green-800 hover:bg-green-200'} px-3 py-1 rounded text-sm transition`}
                              disabled={tank.type === 'DRY BULK'}
                              title={tank.type === 'DRY BULK' ? "Dry bulk tanks cannot be loaded with fluids" : ""}
                            >
                              Plan Load Operation
                              {tank.type === 'DRY BULK' && <span className="ml-1 text-xs">(Dry materials only)</span>}
                            </button>
                            <button className="bg-red-100 text-red-800 px-3 py-1 rounded text-sm hover:bg-red-200 transition">Plan Discharge Operation</button>
                            {tank.type !== "DRY BULK" && (
                              <button 
                                className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded text-sm hover:bg-indigo-200 transition"
                                onClick={() => setHighlightPumpSystem(tank.pumpSystemId)}
                              >
                                Show Connected Tanks
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>
      
      {/* Tank list */}
      <div className="bg-white border rounded-lg shadow-sm">
        <div className="grid grid-cols-6 bg-gray-200 p-3 font-medium">
          <div>Tank ID</div>
          <div>Type</div>
          <div>Capacity</div>
          <div>Contents</div>
          <div>Client</div>
          <div>System</div>
        </div>
        <div className="divide-y">
          {selectedVessel.tanks.map(tank => (
            <div 
              key={tank.id} 
              className={`${getStatusColor(tank)} grid grid-cols-6 p-3 cursor-pointer hover:bg-gray-50 ${
                planningMode && selectedTanks.includes(tank.id) ? 'bg-blue-50 border-l-4 border-blue-500' : ''
              }`}
              onClick={() => {
                if (planningMode) {
                  setSelectedTanks(prev => 
                    prev.includes(tank.id) 
                      ? prev.filter(id => id !== tank.id)
                      : [...prev, tank.id]
                  );
                } else {
                  onSetExpandedTank(expandedTank === tank.id ? null : tank.id);
                }
              }}
            >
              <div>{tank.id}</div>
              <div>{tank.type}</div>
              <div>{tank.capacity} bbl</div>
              <div>{tank.contents}</div>
              <div>{tank.client || "Unassigned"}</div>
              <div>
                {tank.type === "DRY BULK" ? (
                  <span className="text-gray-500">Independent</span>
                ) : (
                  <span>
                    {tank.pumpSystemId === 4 ? "Methanol System" : 
                     tank.pumpSystemId === 5 ? "Slop Tank System" : 
                     `System ${tank.pumpSystemId}`}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TankManagementTab;