// src/components/EnhancedOSVTankManagement.jsx
import React, { useState } from 'react';
import TankManagementTab from './TankManagementTab';
import FleetViewTab from './FleetViewTab';
import KPIReportingTab from './KPIReportingTab';
import { vessels } from '../data/appData';

const EnhancedOSVTankManagement = () => {
  const [activeTab, setActiveTab] = useState('fleet-view');
  const [selectedVessel, setSelectedVessel] = useState(null);
  const [expandedTank, setExpandedTank] = useState(null);

  // Add error handling for vessels data
  if (!vessels || !Array.isArray(vessels) || vessels.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Data Loading Error</h2>
          <p className="text-gray-600 mb-4">Unable to load vessel data. Please check your data file.</p>
          <div className="text-sm text-gray-500">
            Expected: Array of vessels from ../data/appData.js<br/>
            Received: {vessels ? typeof vessels : 'undefined'}
          </div>
        </div>
      </div>
    );
  }

  const handleSelectVessel = (vessel) => {
    setSelectedVessel(vessel);
    setExpandedTank(null);
    setActiveTab('tank-management');
  };

  const tabs = [
    {
      id: 'fleet-view',
      label: 'Fleet Overview',
      description: 'View and compare all vessels with compatibility checking',
      icon: '🚢'
    },
    {
      id: 'tank-management',
      label: 'Tank Management',
      description: 'Manage individual vessel tanks, plan operations, and check compatibility',
      icon: '🛢️'
    },
    {
      id: 'kpi-reporting',
      label: 'KPI Dashboard',
      description: 'Analytics, performance metrics, and fleet reporting',
      icon: '📊'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Navigation Header */}
      <div className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <span className="mr-3 text-4xl">⚓</span>
                OSV Tank Management System
              </h1>
              <p className="text-gray-600 mt-1">
                Comprehensive fleet and tank management solution
              </p>
              {selectedVessel && (
                <div className="mt-2 flex items-center space-x-4 text-sm">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md font-medium">
                    Active Vessel: {selectedVessel.name}
                  </span>
                  <span className="text-gray-500">
                    Last Updated: {selectedVessel.lastUpdated}
                  </span>
                </div>
              )}
            </div>
            
            {/* Enhanced Tab Navigation */}
            <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'bg-white text-blue-700 shadow-md ring-1 ring-blue-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-sm'
                  }`}
                  title={tab.description}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span>{tab.label}</span>
                  {activeTab === tab.id && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  )}
                </button>
              ))}
            </nav>
          </div>
          
          {/* Tab Description Bar */}
          <div className="pb-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
              <div className="flex items-center space-x-2">
                <span className="text-blue-600 text-lg">
                  {tabs.find(tab => tab.id === activeTab)?.icon}
                </span>
                <span className="text-blue-800 font-medium">
                  {tabs.find(tab => tab.id === activeTab)?.label}:
                </span>
                <span className="text-blue-700">
                  {tabs.find(tab => tab.id === activeTab)?.description}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Tab Content */}
      <div className="max-w-7xl mx-auto">
        {activeTab === 'fleet-view' && (
          <div className="animate-fadeIn">
            <FleetViewTab
              vessels={vessels}
              onSelectVessel={handleSelectVessel}
            />
          </div>
        )}
        
        {activeTab === 'tank-management' && (
          <div className="animate-fadeIn">
            {selectedVessel ? (
              <TankManagementTab
                vessels={vessels}
                selectedVessel={selectedVessel}
                onSetSelectedVessel={setSelectedVessel}
                expandedTank={expandedTank}
                onSetExpandedTank={setExpandedTank}
              />
            ) : (
              <div className="p-8 text-center">
                <div className="max-w-md mx-auto">
                  <div className="text-6xl mb-4">🚢</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No Vessel Selected
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Please select a vessel from the Fleet Overview to manage its tanks.
                  </p>
                  <button
                    onClick={() => setActiveTab('fleet-view')}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Go to Fleet Overview
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'kpi-reporting' && (
          <div className="animate-fadeIn">
            {/* Temporary fallback for KPI Dashboard */}
            <div className="p-6 bg-gray-50 min-h-screen">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">KPI Dashboard</h1>
                <p className="text-gray-600">Fleet performance metrics and analytics</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-semibold mb-4">Fleet Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{vessels.length}</div>
                    <div className="text-blue-700">Total Vessels</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {vessels.reduce((sum, v) => sum + v.tanks.length, 0)}
                    </div>
                    <div className="text-green-700">Total Tanks</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {vessels.reduce((sum, v) => sum + v.tanks.reduce((tankSum, t) => tankSum + t.capacity, 0), 0).toLocaleString()}
                    </div>
                    <div className="text-purple-700">Total Capacity (bbl)</div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Vessel List</h3>
                  <div className="space-y-2">
                    {vessels.map(vessel => (
                      <div key={vessel.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <span className="font-medium">{vessel.name}</span>
                        <span className="text-sm text-gray-600">{vessel.tanks.length} tanks</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Status Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-600 font-medium">System Online</span>
              </div>
              
              <div className="text-gray-600">
                Fleet Status: 
                <span className="font-medium text-gray-900 ml-1">
                  {vessels.length} vessels active
                </span>
              </div>
              
              {selectedVessel && (
                <div className="text-gray-600">
                  Current Vessel: 
                  <span className="font-medium text-gray-900 ml-1">
                    {selectedVessel.name}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="text-gray-600">
                Active Tab: 
                <span className="font-medium text-gray-900 ml-1">
                  {tabs.find(tab => tab.id === activeTab)?.label}
                </span>
              </div>
              
              <div className="text-gray-600">
                Total Capacity: 
                <span className="font-medium text-blue-600 ml-1">
                  {vessels.reduce((total, vessel) => 
                    total + vessel.tanks.reduce((sum, tank) => sum + tank.capacity, 0), 0
                  ).toLocaleString()} bbl
                </span>
              </div>
              
              <div className="text-gray-600">
                Available: 
                <span className="font-medium text-green-600 ml-1">
                  {vessels.reduce((total, vessel) => 
                    total + vessel.tanks.reduce((sum, tank) => sum + (tank.capacity - tank.currentLevel), 0), 0
                  ).toLocaleString()} bbl
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add some padding to account for fixed status bar */}
      <div className="h-16"></div>
    </div>
  );
};

export default EnhancedOSVTankManagement;