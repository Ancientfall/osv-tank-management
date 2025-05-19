import React from 'react';

const TankSelector = ({
  vessels,
  selectedVesselId,
  onChangeVessel,
  planningMode,
  onTogglePlanningMode,
  onResetPlanning
}) => {
  return (
    <div className="flex justify-between items-center mb-4">
      {/* Vessel Selector */}
      <select
        className="border p-2 rounded shadow-sm"
        value={selectedVesselId}
        onChange={(e) => onChangeVessel(parseInt(e.target.value))}
      >
        {vessels.map(vessel => (
          <option key={vessel.id} value={vessel.id}>
            {vessel.name}
          </option>
        ))}
      </select>

      {/* Planning Mode Toggle */}
      <div className="flex space-x-2">
        <button
          className={`px-4 py-2 rounded text-sm font-medium ${
            planningMode
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
          onClick={() => {
            onTogglePlanningMode(!planningMode);
            if (planningMode) onResetPlanning();
          }}
        >
          {planningMode ? 'Exit Planning Mode' : 'Plan Transfer Operation'}
        </button>
      </div>
    </div>
  );
};

export default TankSelector;
// This component allows the user to select a vessel from a dropdown and toggle planning mode.