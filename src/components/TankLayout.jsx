// src/components/TankLayout.jsx

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useFillLimit } from './FleetViewTab';
import TankBlock from './TankBlock';
import { getStatusColor } from '../utils/uiHelpers.jsx';

const TANK_UNIT_COLORS = {
  bbl: '#34d399',
  cuft: '#60a5fa',
  methanol: '#a78bfa',
  slop: '#facc15',
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
  const fillLimit = useFillLimit();

  if (!selectedVessel) return null;

  const groupedTanks = {
    LIQUID: selectedVessel.tanks.filter(t => t.type === "LIQUID" && t.contents !== 'Out of Service'),
    METHANOL: selectedVessel.tanks.filter(t => t.type === "METHANOL" && t.contents !== 'Out of Service'),
    SLOP: selectedVessel.tanks.filter(t => t.type === "SLOP" && t.contents !== 'Out of Service'),
    DRY_BULK: selectedVessel.tanks.filter(t => t.type === "DRY BULK" && t.contents !== 'Out of Service'),
  };

  const pieData = [
    {
      name: 'Liquid Tanks',
      value: groupedTanks.LIQUID.reduce((sum, t) => sum + t.capacity * fillLimit, 0),
      unit: 'bbl',
      fill: TANK_UNIT_COLORS.bbl
    },
    {
      name: 'Methanol Tanks',
      value: groupedTanks.METHANOL.reduce((sum, t) => sum + t.capacity * fillLimit, 0),
      unit: 'bbl',
      fill: TANK_UNIT_COLORS.methanol
    },
    {
      name: 'Slop Tanks',
      value: groupedTanks.SLOP.reduce((sum, t) => sum + t.capacity * fillLimit, 0),
      unit: 'bbl',
      fill: TANK_UNIT_COLORS.slop
    },
    {
      name: 'Dry Bulk Tanks',
      value: groupedTanks.DRY_BULK.reduce((sum, t) => sum + t.capacity, 0),
      unit: 'cuft',
      fill: TANK_UNIT_COLORS.cuft
    }
  ];

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

  const toggleOutOfService = (tankId) => {
    const tank = selectedVessel.tanks.find(t => t.id === tankId);
    if (tank) {
      tank.contents = tank.contents === 'Out of Service' ? '' : 'Out of Service';
    }
  };

  const resetOutOfServiceTanks = () => {
    selectedVessel.tanks.forEach(t => {
      if (t.contents === 'Out of Service') t.contents = '';
    });
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
                onToggleOutOfService={toggleOutOfService}
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
                onToggleOutOfService={toggleOutOfService}
              />
            )}</div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="mb-6 bg-white border rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Tank Layout - {selectedVessel.name}</h3>
        <button
          onClick={resetOutOfServiceTanks}
          className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 transition"
        >
          Reset Out-of-Service
        </button>
      </div>

      <div className="mb-4 h-60">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={70}
              label={({ name, value, unit }) => `${Math.round(value)} ${unit}`}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name, props) => [`${Math.round(value)} ${props.payload.unit}`, name]} />
          </PieChart>
        </ResponsiveContainer>
      </div>

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
                  onToggleOutOfService={toggleOutOfService}
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
