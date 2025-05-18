// src/components/FleetViewTab.jsx
import React from 'react';

const FleetViewTab = ({ vessels, onSelectVessel }) => {
  return (
    <div className="p-4">
      <h2 className="text-xl mb-4">Fleet Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vessels.map(vessel => (
          <div key={vessel.id} className="border rounded p-4 bg-white shadow-sm hover:shadow transition-shadow">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">{vessel.name}</h3>
              <span className="text-xs text-gray-500">Last updated: {vessel.lastUpdated}</span>
            </div>
            
            <div className="mt-3 grid grid-cols-3 gap-3">
              <div className="border rounded p-2 bg-blue-50">
                <div className="text-sm text-gray-600">Tanks</div>
                <div className="font-bold text-lg">{vessel.tanks.length}</div>
              </div>
              
              <div className="border rounded p-2 bg-green-50">
                <div className="text-sm text-gray-600">Total Capacity</div>
                <div className="font-bold text-lg">
                  {vessel.tanks.reduce((sum, t) => sum + t.capacity, 0)} bbl
                </div>
              </div>
              
              <div className="border rounded p-2 bg-purple-50">
                <div className="text-sm text-gray-600">Used Capacity</div>
                <div className="font-bold text-lg">
                  {vessel.tanks.reduce((sum, t) => sum + t.capacity, 0) > 0 ?
                    Math.round(vessel.tanks.reduce((sum, t) => sum + t.currentLevel, 0) / 
                    vessel.tanks.reduce((sum, t) => sum + t.capacity, 0) * 100) : 0}%
                </div>
              </div>
            </div>
            
            <div className="mt-3">
              <div className="text-sm font-medium mb-1">Tank Allocation</div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="flex h-2.5 rounded-full overflow-hidden">
                  {/* Dry Bulk */}
                  <div 
                    className="bg-blue-500 h-full" 
                    style={{ 
                      width: `${Math.round(vessel.tanks
                        .filter(t => t.type === "DRY BULK")
                        .reduce((sum, t) => sum + t.capacity, 0) / 
                        (vessel.tanks.reduce((sum, t) => sum + t.capacity, 0) || 1) * 100)}%` // Avoid division by zero
                    }}
                  ></div>
                  {/* Methanol */}
                  <div 
                    className="bg-purple-500 h-full" 
                    style={{ 
                      width: `${Math.round(vessel.tanks
                        .filter(t => t.type === "METHANOL")
                        .reduce((sum, t) => sum + t.capacity, 0) / 
                        (vessel.tanks.reduce((sum, t) => sum + t.capacity, 0) || 1) * 100)}%` 
                    }}
                  ></div>
                  {/* Slop */}
                  <div 
                    className="bg-yellow-500 h-full" 
                    style={{ 
                      width: `${Math.round(vessel.tanks
                        .filter(t => t.type === "SLOP")
                        .reduce((sum, t) => sum + t.capacity, 0) / 
                        (vessel.tanks.reduce((sum, t) => sum + t.capacity, 0) || 1) * 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
              <div className="flex justify-between text-xs mt-1 text-gray-500">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 mr-1 rounded-full"></div>
                  <span>Dry Bulk</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-purple-500 mr-1 rounded-full"></div>
                  <span>Methanol</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-500 mr-1 rounded-full"></div>
                  <span>Slop</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button 
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm hover:bg-blue-200 transition mr-2"
                onClick={() => onSelectVessel(vessel)}
              >
                Manage Tanks
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FleetViewTab;