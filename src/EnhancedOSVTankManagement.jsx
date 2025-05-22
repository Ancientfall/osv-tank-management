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

  const [vessels, setVessels] = useState(initialVesselsData);
  const [clients, setClients] = useState(initialClientsData);
  const [fluidTypes, setFluidTypes] = useState(initialFluidTypesData);

  const [selectedVessel, setSelectedVessel] = useState(vessels[0]);
  const [expandedTank, setExpandedTank] = useState(null);

  const handleSelectVesselForManagement = (vessel) => {
    setSelectedVessel(vessel);
    setExpandedTank(null);
    setActiveTab(1);
  };

  return (
    <div className="flex flex-col h-screen bg-eco-white">
      <header className="bg-eco-navy text-eco-white p-4">
        <h1 className="text-2xl font-bold">ECO OSV Tank Management System</h1>
      </header>

      <div className="flex-1 overflow-auto">
        <div className="flex bg-eco-white border-b border-eco-navy">
          <button
            className={`px-6 py-3 focus:outline-none ${activeTab === 0 ? 'bg-eco-white text-eco-navy font-semibold border-b-4 border-eco-orange' : 'text-eco-navy hover:bg-eco-orange/10'}`}
            onClick={() => setActiveTab(0)}
          >
            <div className="flex items-center space-x-2">
              <Ship size={20} />
              <span>Fleet View</span>
            </div>
          </button>
          <button
            className={`px-6 py-3 focus:outline-none ${activeTab === 1 ? 'bg-eco-white text-eco-navy font-semibold border-b-4 border-eco-orange' : 'text-eco-navy hover:bg-eco-orange/10'}`}
            onClick={() => setActiveTab(1)}
          >
            <div className="flex items-center space-x-2">
              <Droplet size={20} />
              <span>Tank Management</span>
            </div>
          </button>
          <button
            className={`px-6 py-3 focus:outline-none ${activeTab === 2 ? 'bg-eco-white text-eco-navy font-semibold border-b-4 border-eco-orange' : 'text-eco-navy hover:bg-eco-orange/10'}`}
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
              fluidTypes={fluidTypes}
              compatibilityMatrix={compatibilityMatrix}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedOSVTankManagement;
