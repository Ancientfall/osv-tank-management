// This component displays the tank layout of a selected vessel, allowing users to select tanks for planning operations.
import React from 'react';
import { getStatusColor, getClientColor } from '../utils/uiHelpers.jsx';

const TankBlock = ({
  tank,
  planningMode,
  selectedTanks,
  highlightPumpSystem,
  onClickTank
}) => {
  const isSelected = selectedTanks.includes(tank.id);
  const isHighlighted = highlightPumpSystem !== null && tank.pumpSystemId === highlightPumpSystem;
  const dimOthers = highlightPumpSystem !== null && !isHighlighted;

  const levelPercent = Math.min(100, (tank.currentLevel / (tank.capacity || 1)) * 100);
  const levelColor = levelPercent > 80 ? 'bg-red-600' :
    tank.type === 'METHANOL' ? 'bg-purple-600' :
    tank.type === 'SLOP' ? 'bg-yellow-600' :
    'bg-green-600';

  return (
    <div
      className={`${getStatusColor(tank)} p-1.5 rounded relative cursor-pointer hover:shadow-md transition-shadow
        ${planningMode
          ? isSelected
            ? 'border-2 border-blue-500 ring-2 ring-blue-300'
            : 'border border-gray-300'
          : dimOthers
            ? 'border border-gray-300 opacity-50'
            : 'border border-gray-300'
        }`}
      onClick={() => onClickTank(tank.id)}
      style={{
        borderColor: planningMode && isSelected
          ? 'rgb(59, 130, 246)'
          : isHighlighted
            ? `rgba(${tank.pumpSystemId * 40}, ${150 - tank.pumpSystemId * 10}, ${200 - tank.pumpSystemId * 20}, 0.8)`
            : ''
      }}
    >
      <div className="flex justify-between items-center text-xs font-bold">
        <div>{tank.id}</div>
        <div className="bg-blue-100 px-1 rounded text-blue-800">
          {tank.pumpSystemId === 4 ? 'Methanol' :
            tank.pumpSystemId === 5 ? 'Slop' :
            tank.type === 'DRY BULK' ? 'Independent' :
            `PS-${tank.pumpSystemId}`}
        </div>
      </div>
      <div className="text-xs">{tank.capacity} bbl</div>
      <div className="text-xs truncate">{tank.contents}</div>
      {tank.client && (
        <div className={`text-xs mt-1 ${getClientColor(tank.client)} px-1 py-0.5 rounded-sm text-center`}>
          {tank.client.split(' ').pop()}
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
        <div className={`h-1.5 rounded-full ${levelColor}`} style={{ width: `${levelPercent}%` }}></div>
      </div>
    </div>
  );
};

const TankLayout = ({
  selectedVessel,
  planningMode,
  selectedTanks,
  highlightPumpSystem,
  onSelectTank,
  onExpandTank,
  expandedTank
}) => {
  if (!selectedVessel) return null;

  const groupedTanks = {
    LIQUID: selectedVessel.tanks.filter(t => t.type === "LIQUID"),
    METHANOL: selectedVessel.tanks.filter(t => t.type === "METHANOL"),
    SLOP: selectedVessel.tanks.filter(t => t.type === "SLOP"),
    DRY_BULK: selectedVessel.tanks.filter(t => t.type === "DRY BULK"),
  };

  const handleClickTank = (tankId) => {
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

  const renderPairedTanks = (typeLabel, tanks, prefix = '') => (
    <div className="mb-6">
      <div className="text-center mb-3 font-medium text-gray-700 border-b pb-2">{typeLabel}</div>
      {[1, 2, 3, 4, 5, 6].map(num => {
        const sTank = tanks.find(t => t.id === `${prefix}${num}S`);
        const pTank = tanks.find(t => t.id === `${prefix}${num}P`);
        if (!sTank && !pTank) return null;

        return (
          <div key={`${typeLabel}-${num}`} className="flex mb-2">
            <div className="w-5/12 pr-1">{sTank && (
              <TankBlock
                tank={sTank}
                planningMode={planningMode}
                selectedTanks={selectedTanks}
                highlightPumpSystem={highlightPumpSystem}
                onClickTank={handleClickTank}
              />
            )}</div>

            <div className="flex-none w-2/12 relative flex justify-center">
              <div className="absolute h-1/2 border-l border-gray-400"></div>
              <div className="absolute w-full top-1/2 border-t border-gray-400"></div>
              <div className="absolute h-1/2 bottom-0 border-l border-gray-400"></div>
            </div>

            <div className="w-5/12 pl-1">{pTank && (
              <TankBlock
                tank={pTank}
                planningMode={planningMode}
                selectedTanks={selectedTanks}
                highlightPumpSystem={highlightPumpSystem}
                onClickTank={handleClickTank}
              />
            )}</div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="mb-6 bg-white border rounded-lg p-4 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Tank Layout - {selectedVessel.name}</h3>
      <div className="relative border-2 border-gray-300 rounded-lg p-6 bg-gray-50">
        <div className="absolute top-2 left-1/4 transform -translate-x-1/2 text-gray-600 font-medium">STARBOARD</div>
        <div className="absolute top-2 right-1/4 transform translate-x-1/2 text-gray-600 font-medium">PORTSIDE</div>

        {renderPairedTanks("Liquid Tanks", groupedTanks.LIQUID, "Tk ")}
        {groupedTanks.METHANOL.length > 0 && renderPairedTanks("Methanol Tanks", groupedTanks.METHANOL, "Meth ")}
        {groupedTanks.SLOP.length > 0 && renderPairedTanks("Slop Tanks", groupedTanks.SLOP, "Slop ")}

        {groupedTanks.DRY_BULK.length > 0 && (
          <div>
            <div className="text-center mb-3 font-medium text-gray-700 border-b pb-2">
              Dry Bulk Tanks
              <span className="ml-2 text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full">Dry Materials Only</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {groupedTanks.DRY_BULK.map(tank => (
                <TankBlock
                  key={tank.id}
                  tank={tank}
                  planningMode={planningMode}
                  selectedTanks={selectedTanks}
                  highlightPumpSystem={highlightPumpSystem}
                  onClickTank={handleClickTank}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TankLayout;
