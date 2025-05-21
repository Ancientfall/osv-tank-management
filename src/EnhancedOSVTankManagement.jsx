// src/EnhancedOSVTankManagement
import React, { useState, useEffect } from 'react';
import { Ship, Droplet, Layers } from 'lucide-react'; // Only icons needed for tabs here

// Import Data
import { vessels as initialVesselsData, clients as initialClientsData, fluidTypes as initialFluidTypesData } from './data/appData';
import { compatibilityMatrix } from './utils/compatibilityUtils';

// Import Tab Components
import FleetViewTab from './components/FleetViewTab';
import TankManagementTab from './components/tanks/TankManagementTab';
import FleetComparisonTab from './components/FleetComparisonTab';

const EnhancedOSVTankManagement = () => {
  const [activeTab, setActiveTab] = useState(0);
  
  // Keep original data immutable, pass it down.
  // If data were to be modified (e.g., CRUD operations), you'd use useState for them.
  const [vessels, setVessels] = useState(initialVesselsData);
  const [clients, setClients] = useState(initialClientsData);
  const [fluidTypes, setFluidTypes] = useState(initialFluidTypesData);

  const [selectedVessel, setSelectedVessel] = useState(vessels[0]); // Initialize with the first vessel
  const [expandedTank, setExpandedTank] = useState(null);

  // Handler to change vessel and switch to Tank Management tab
  const handleSelectVesselForManagement = (vessel) => {
    setSelectedVessel(vessel);
    setExpandedTank(null); // Reset expanded tank when vessel changes
    setActiveTab(1);
  };
  
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-blue-600 text-white p-4">
        <h1 className="text-2xl font-bold">OSV Tank Management System</h1>
      </header>
      
      <div className="flex-1 overflow-auto">
        <div className="flex bg-gray-200 border-b border-gray-300">
          <button 
            className={`px-6 py-3 focus:outline-none ${activeTab === 0 ? 'bg-white text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-300'}`}
            onClick={() => setActiveTab(0)}
          >
            <div className="flex items-center space-x-2">
              <Ship size={20} />
              <span>Fleet View</span>
            </div>
          </button>
          <button 
            className={`px-6 py-3 focus:outline-none ${activeTab === 1 ? 'bg-white text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-300'}`}
            onClick={() => setActiveTab(1)}
          >
            <div className="flex items-center space-x-2">
              <Droplet size={20} />
              <span>Tank Management</span>
            </div>
          </button>
          <button 
            className={`px-6 py-3 focus:outline-none ${activeTab === 2 ? 'bg-white text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-300'}`}
            onClick={() => setActiveTab(2)}
          >
            <div className="flex items-center space-x-2">
              <Layers size={20} />
              <span>Fleet Comparison</span>
            </div>
          </button>
        </div>
        
        <div className="tab-content">
          {activeTab === 0 && (
            <FleetViewTab
              vessels={vessels}
              onSelectVessel={handleSelectVesselForManagement}
            />
          )}
          
          {activeTab === 1 && (
            <TankManagementTab
              vessels={vessels}
              selectedVessel={selectedVessel}
              onSetSelectedVessel={setSelectedVessel}
              expandedTank={expandedTank}
              onSetExpandedTank={setExpandedTank}
            />
          )}
          
          {activeTab === 2 && (
            <FleetComparisonTab
              vessels={vessels}
              clients={clients}
              fluidTypes={fluidTypes} // Pass fluidTypes if needed for filters/display
              compatibilityMatrix={compatibilityMatrix}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedOSVTankManagement;