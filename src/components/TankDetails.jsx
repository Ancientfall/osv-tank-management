// This component displays detailed information about a selected tank, including its type, capacity, current level, and other relevant data.
// It also provides quick actions for scheduling cleaning, planning load/discharge operations, and showing connected tanks.
import React from 'react';
import { getClientColor } from '../utils/uiHelpers.jsx';

const TankDetails = ({ tank, pumpSystems, onClose, onHighlightPumpSystem }) => {
  if (!tank) return null;

  const getTankConstraints = (type) => {
    switch (type) {
      case "DRY BULK":
        return "Can only contain dry materials (cement, barite, etc.). Cannot contain any fluids.";
      case "SLOP":
        return "Can only contain waste fluids. Cannot contain muds or brines.";
      case "METHANOL":
        return "Primarily for methanol storage. Requires special handling.";
      case "LIQUID":
        return "Can contain various fluids including muds and brines. Cannont contain any dry bulks";
      default:
        return "Standard tank with no special constraints.";
    }
  };

  const pumpSummary = tank.type !== 'DRY BULK' ? {
    totalTanks: pumpSystems[tank.pumpSystemId]?.length || 0,
    totalCapacity: pumpSystems[tank.pumpSystemId]?.reduce((sum, t) => sum + t.capacity, 0) || 0,
    totalUsed: pumpSystems[tank.pumpSystemId]?.reduce((sum, t) => sum + t.currentLevel, 0) || 0
  } : null;

  return (
    <div className="mt-4 p-4 bg-white border rounded-lg shadow">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-medium text-lg flex items-center">
          {tank.id} Details
          <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-800">
            {tank.type === 'DRY BULK' ? 'Independent Tank' :
              tank.pumpSystemId === 4 ? 'Methanol System' :
              tank.pumpSystemId === 5 ? 'Slop Tank System' :
              `Pump System ${tank.pumpSystemId}`}
          </span>
        </h4>
        <button
          className="text-gray-500 hover:text-gray-700"
          onClick={onClose}
          title="Close details"
        >
          ×
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tank Info */}
        <div>
          <h5 className="font-medium mb-2 text-blue-800">Tank Information</h5>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Type:</span><span>{tank.type}</span></div>
            <div className="flex justify-between"><span>Capacity:</span><span>{tank.capacity} bbl</span></div>
            <div className="flex justify-between"><span>Last Cleaned:</span><span>{tank.lastCleaning}</span></div>
            <div className="flex justify-between"><span>Cleaning History:</span><span>{tank.history}</span></div>
          </div>
          <div className="mt-3 p-2 bg-gray-50 border rounded text-sm">
            <div className="font-medium mb-1 text-gray-700">Tank Constraints:</div>
            <div className="text-gray-600">{getTankConstraints(tank.type)}</div>
          </div>
        </div>

        {/* Status */}
        <div>
          <h5 className="font-medium mb-2 text-blue-800">Current Status</h5>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Content:</span><span>{tank.contents}</span></div>
            <div className="flex justify-between">
              <span>Current Level:</span>
              <span>{tank.currentLevel} bbl ({Math.round((tank.currentLevel / tank.capacity) * 100)}%)</span>
            </div>
            <div className="flex justify-between"><span>Available Space:</span><span>{tank.capacity - tank.currentLevel} bbl</span></div>
            <div className="flex justify-between"><span>Pressure:</span><span>{tank.pressure} bar</span></div>
          </div>
          {pumpSummary && (
            <div className="mt-3 p-2 bg-gray-50 border rounded text-sm">
              <div className="font-medium mb-1 text-gray-700">Pump System Info</div>
              <ul className="list-disc ml-5 text-gray-600">
                <li>Total tanks: {pumpSummary.totalTanks}</li>
                <li>Capacity: {pumpSummary.totalCapacity} bbl</li>
                <li>Used: {pumpSummary.totalUsed} bbl</li>
              </ul>
            </div>
          )}
        </div>

        {/* Assignment / Actions */}
        <div>
          <h5 className="font-medium mb-2 text-blue-800">Assignment</h5>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Client:</span>
              <span className={getClientColor(tank.client)}>
                {tank.client || 'Unassigned'}
              </span>
            </div>
            {tank.type !== 'DRY BULK' && (
              <div className="flex justify-between">
                <span>System:</span>
                <span>
                  {tank.pumpSystemId === 4 ? 'Methanol System' :
                    tank.pumpSystemId === 5 ? 'Slop Tank System' :
                    `System ${tank.pumpSystemId}`}
                </span>
              </div>
            )}
          </div>

          <div className="mt-4">
            <h5 className="font-medium mb-2 text-blue-800">Quick Actions</h5>
            <div className="flex flex-col space-y-2">
              <button className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm hover:bg-blue-200">
                Schedule Cleaning
              </button>
              <button
                className={`${tank.type === 'DRY BULK' ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-green-100 text-green-800 hover:bg-green-200'} px-3 py-1 rounded text-sm`}
                disabled={tank.type === 'DRY BULK'}
                title={tank.type === 'DRY BULK' ? 'Dry bulk tanks cannot be loaded with fluids' : ''}
              >
                Plan Load Operation
              </button>
              <button className="bg-red-100 text-red-800 px-3 py-1 rounded text-sm hover:bg-red-200">
                Plan Discharge Operation
              </button>
              {tank.type !== "DRY BULK" && (
                <button
                  className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded text-sm hover:bg-indigo-200"
                  onClick={() => onHighlightPumpSystem(tank.pumpSystemId)}
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
};

export default TankDetails;
