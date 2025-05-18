// src/components/TankManagementTab.jsx
import React from 'react';
import { getStatusColor, getClientColor } from '../utils/uiHelpers.jsx'; // Import helpers

const TankManagementTab = ({
  vessels,
  selectedVessel,
  onSetSelectedVessel,
  expandedTank,
  onSetExpandedTank
}) => {
  if (!selectedVessel) return <div className="p-4">Please select a vessel.</div>; // Handle no vessel selected

  return (
    <div className="p-4">
      <h2 className="text-xl mb-4">Tank Management</h2>
      <select 
        className="border p-2 mb-4 rounded shadow-sm"
        value={selectedVessel.id}
        onChange={(e) => {
          const newSelectedVessel = vessels.find(v => v.id === parseInt(e.target.value));
          if (newSelectedVessel) {
            onSetSelectedVessel(newSelectedVessel);
            onSetExpandedTank(null); // Reset expanded tank when vessel changes
          }
        }}
      >
        {vessels.map(vessel => (
          <option key={vessel.id} value={vessel.id}>{vessel.name}</option>
        ))}
      </select>
      
      {/* Tank Visualization */}
      <div className="mb-6 bg-white border rounded-lg p-4 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">
          Tank Layout - {selectedVessel.name}
        </h3>
        
        <div className="relative border-2 border-gray-300 rounded-lg p-6 bg-gray-50">
          <div className="absolute top-2 left-1/4 transform -translate-x-1/2 text-gray-600 font-medium">STARBOARD</div>
          <div className="absolute top-2 right-1/4 transform translate-x-1/2 text-gray-600 font-medium">PORTSIDE</div>
          
          {/* Liquid tanks (in paired rows) */}
          <div className="mb-8">
            <div className="text-center mb-3 font-medium text-gray-700 border-b pb-2">Liquid Tanks</div>
            {[1, 2, 3, 4, 5, 6].map((tankNum) => {
              const starboardTank = selectedVessel.tanks.find(t => t.id === `Tk ${tankNum}S` || t.id === `Meth ${tankNum}S` || t.id === `Slop ${tankNum}S`);
              const portTank = selectedVessel.tanks.find(t => t.id === `Tk ${tankNum}P` || t.id === `Meth ${tankNum}P` || t.id === `Slop ${tankNum}P`);
              
              if (!starboardTank && !portTank) return null;
              
              return (
                <div key={tankNum} className="flex mb-2">
                  {/* Starboard Tank (Left) */}
                  <div className="w-1/2 pr-1">
                    {starboardTank && (
                      <div 
                        className={`${getStatusColor(starboardTank)} p-2 rounded border relative cursor-pointer hover:shadow-md transition-shadow`}
                        onClick={() => onSetExpandedTank(expandedTank === starboardTank.id ? null : starboardTank.id)}
                      >
                        <div className="text-xs font-bold">{starboardTank.id}</div>
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
                  
                  <div className="flex-none w-4 relative">
                    <div className="absolute h-1/2 left-1/2 top-0 border-l border-gray-400"></div>
                    <div className="absolute w-full top-1/2 border-t border-gray-400"></div>
                    <div className="absolute h-1/2 left-1/2 bottom-0 border-l border-gray-400"></div>
                  </div>
                  
                  {/* Port Tank (Right) */}
                  <div className="w-1/2 pl-1">
                    {portTank && (
                      <div 
                        className={`${getStatusColor(portTank)} p-2 rounded border relative cursor-pointer hover:shadow-md transition-shadow`}
                        onClick={() => onSetExpandedTank(expandedTank === portTank.id ? null : portTank.id)}
                      >
                        <div className="text-xs font-bold">{portTank.id}</div>
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
            
            {/* Expanded Tank Details */}
            {expandedTank && (
              <div className="mt-4 p-4 bg-white border rounded-lg shadow">
                {(() => {
                  const tank = selectedVessel.tanks.find(t => t.id === expandedTank);
                  if (!tank) return null;
                  
                  return (
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium text-lg">{tank.id} Details</h4>
                        <button 
                          className="text-gray-500 hover:text-gray-700"
                          onClick={() => onSetExpandedTank(null)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <h5 className="font-medium mb-2 text-blue-800">Tank Information</h5>
                          <div className="space-y-2">
                            <div className="flex justify-between"><span className="text-gray-600">Type:</span><span className="font-medium">{tank.type}</span></div>
                            <div className="flex justify-between"><span className="text-gray-600">Capacity:</span><span>{tank.capacity} bbl</span></div>
                            <div className="flex justify-between"><span className="text-gray-600">Last Cleaned:</span><span>{tank.lastCleaning}</span></div>
                            <div className="flex justify-between"><span className="text-gray-600">Cleaning History:</span><span>{tank.history}</span></div>
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
                        </div>
                        <div>
                          <h5 className="font-medium mb-2 text-blue-800">Assignment</h5>
                          <div className="space-y-2">
                            <div className="flex justify-between"><span className="text-gray-600">Client:</span><span className={getClientColor(tank.client)}>{tank.client || "Unassigned"}</span></div>
                            <div className="flex justify-between"><span className="text-gray-600">Pump System:</span><span>System {tank.id.includes('Meth') ? 3 : tank.id.includes('Slop') ? 2 : 1}</span></div>
                          </div>
                          <div className="mt-4">
                            <h5 className="font-medium mb-2 text-blue-800">Quick Actions</h5>
                            <div className="flex flex-col space-y-2">
                              <button className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm hover:bg-blue-200 transition">Schedule Cleaning</button>
                              <button className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm hover:bg-green-200 transition">Plan Load Operation</button>
                              <button className="bg-red-100 text-red-800 px-3 py-1 rounded text-sm hover:bg-red-200 transition">Plan Discharge Operation</button>
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
          
          {/* Dry bulk tanks */}
          <div>
            <div className="text-center mb-3 font-medium text-gray-700 border-b pb-2">Dry Bulk Tanks</div>
            <div className="grid grid-cols-3 gap-2">
              {selectedVessel.tanks
                .filter(tank => tank.id.includes('Dry Bulk'))
                .map(tank => (
                  <div 
                    key={tank.id}
                    className={`${getStatusColor(tank)} p-2 rounded border relative cursor-pointer hover:shadow-md transition-shadow`}
                    onClick={() => onSetExpandedTank(expandedTank === tank.id ? null : tank.id)}
                  >
                    <div className="text-xs font-bold">{tank.id}</div>
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
                ))
              }
            </div>
          </div>
        </div>
      </div>
      
      {/* Tank list */}
      <div className="bg-white border rounded-lg shadow-sm">
        <div className="grid grid-cols-4 bg-gray-200 p-3 font-medium">
          <div>Tank ID</div>
          <div>Capacity</div>
          <div>Contents</div>
          <div>Client</div>
        </div>
        <div className="divide-y">
          {selectedVessel.tanks.map(tank => (
            <div key={tank.id} className={`${getStatusColor(tank)} grid grid-cols-4 p-3`}>
              <div>{tank.id}</div>
              <div>{tank.capacity} bbl</div>
              <div>{tank.contents}</div>
              <div>{tank.client || "Unassigned"}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TankManagementTab;