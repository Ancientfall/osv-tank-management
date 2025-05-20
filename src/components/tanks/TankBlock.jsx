// src/components/TankBlock.jsx
import React from 'react';
import { getStatusColor, getClientColor } from '../../utils/uiHelpers.jsx';

const TankBlock = ({
  tank,
  planningMode,
  selectedTanks,
  highlightPumpSystem,
  onClickTank,
  onToggleOutOfService
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
      className={`${getStatusColor(tank)} p-1.5 rounded relative cursor-pointer hover:shadow-md transition-shadow ${tank.contents === 'Out of Service' ? 'opacity-30 grayscale' : ''} ${planningMode ? isSelected ? 'border-2 border-blue-500 ring-2 ring-blue-300' : 'border border-gray-300' : dimOthers ? 'border border-gray-300 opacity-50' : 'border border-gray-300'}`}
      onClick={(e) => {
        if (e.shiftKey) {
          onToggleOutOfService(tank.id);
        } else {
          onClickTank(tank.id);
        }
      }}
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
      <div className="text-xs">{tank.capacity} {tank.unit}</div>
      <div className="text-xs truncate">{tank.contents}</div>
      {tank.contents === 'Out of Service' && (
        <div className="text-[10px] mt-1 px-1 py-0.5 bg-red-100 text-red-700 rounded-sm text-center font-medium uppercase tracking-wide">
          OUT OF SERVICE
        </div>
      )}
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

export default TankBlock;
