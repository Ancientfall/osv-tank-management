// This component displays the tank layout of a selected vessel, allowing users to select tanks for planning operations.
import React from 'react';
import { getStatusColor, getClientColor } from '@/utils/uiHelpers';
import TankCard from './TankCard';

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

  const renderPairedTanks = (typeLabel, tanks) => (
    <div className="mb-6">
      <div className="text-center mb-3 font-medium text-gray-700 border-b pb-2">{typeLabel}</div>
      {[1, 2, 3, 4, 5, 6].map(num => {
        const sTank = tanks.find(t => t.id.endsWith(`${num}S`));
        const pTank = tanks.find(t => t.id.endsWith(`${num}P`));
        if (!sTank && !pTank) return null;

        return (
          <div key={`${typeLabel}-${num}`} className="flex mb-2">
            <div className="w-5/12 pr-1">{sTank && (
              <TankCard
                tank={sTank}
                planningMode={planningMode}
                selectedTanks={selectedTanks}
                highlightPumpSystem={highlightPumpSystem}
                onClickTank={handleClickTank}
              />
            )}</div>

            <div className="flex-none w-2/12 relative flex justify-center items-center">
              <div className="w-px h-full bg-gray-300"></div>
              <div className="absolute w-full top-1/2 border-t border-gray-300"></div>
            </div>

            <div className="w-5/12 pl-1">{pTank && (
              <TankCard
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

        {renderPairedTanks("Liquid Tanks", groupedTanks.LIQUID)}
        {groupedTanks.METHANOL.length > 0 && renderPairedTanks("Methanol Tanks", groupedTanks.METHANOL)}
        {groupedTanks.SLOP.length > 0 && renderPairedTanks("Slop Tanks", groupedTanks.SLOP)}

        {groupedTanks.DRY_BULK.length > 0 && (
          <div>
            <div className="text-center mb-3 font-medium text-gray-700 border-b pb-2">
              Dry Bulk Tanks
              <span className="ml-2 text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full">Dry Materials Only</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {groupedTanks.DRY_BULK.map(tank => (
                <TankCard
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
