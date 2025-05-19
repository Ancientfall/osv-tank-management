//TankListTable component displays a list of tanks in a table format, allowing users to select and expand tanks for more details. It is used in the TankLayout component to provide a quick overview of the tanks available for planning operations.
import React from 'react';
import { getStatusColor } from '../utils/uiHelpers.jsx';

const TankListTable = ({
  tanks,
  planningMode,
  selectedTanks,
  expandedTank,
  onSelectTank,
  onExpandTank
}) => {
  const handleClick = (tankId) => {
    if (planningMode) {
      onSelectTank(prev =>
        prev.includes(tankId)
          ? prev.filter(id => id !== tankId)
          : [...prev, tankId]
      );
    } else {
      onExpandTank(expandedTank === tankId ? null : tankId);
    }
  };

  return (
    <div className="bg-white border rounded-lg shadow-sm">
      <div className="grid grid-cols-6 bg-gray-200 p-3 font-medium text-sm">
        <div>Tank ID</div>
        <div>Type</div>
        <div>Capacity</div>
        <div>Contents</div>
        <div>Client</div>
        <div>System</div>
      </div>
      <div className="divide-y text-sm">
        {tanks.map(tank => (
          <div
            key={tank.id}
            className={`${getStatusColor(tank)} grid grid-cols-6 p-3 cursor-pointer hover:bg-gray-50 ${
              planningMode && selectedTanks.includes(tank.id)
                ? 'bg-blue-50 border-l-4 border-blue-500'
                : ''
            }`}
            onClick={() => handleClick(tank.id)}
          >
            <div>{tank.id}</div>
            <div>{tank.type}</div>
            <div>{tank.capacity} bbl</div>
            <div>{tank.contents}</div>
            <div>{tank.client || "Unassigned"}</div>
            <div>
              {tank.type === "DRY BULK"
                ? <span className="text-gray-500">Independent</span>
                : tank.pumpSystemId === 4
                  ? "Methanol System"
                  : tank.pumpSystemId === 5
                    ? "Slop Tank System"
                    : `System ${tank.pumpSystemId}`
              }
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TankListTable;