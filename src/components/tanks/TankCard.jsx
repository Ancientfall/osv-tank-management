import React, { useState } from 'react';
import { getStatusColor, getClientColor } from '@/utils/uiHelpers';
import { Info, ClipboardEdit } from 'lucide-react';

const getPumpSystemLabel = (tank) => {
  if (tank.pumpSystemId === 4) return { label: 'Methanol', emoji: '💧', tooltip: 'Dedicated methanol tank system' };
  if (tank.pumpSystemId === 5) return { label: 'Slop', emoji: '⚠️', tooltip: 'Slop tank system for waste fluids' };
  if (tank.type === 'DRY BULK') return { label: 'Independent', emoji: '🛢️', tooltip: 'Independent dry bulk tank' };
  return { label: `PS-${tank.pumpSystemId}`, emoji: '🔁', tooltip: 'Shared pump system' };
};

const getTankUnit = (tank) => {
  if (tank.type === 'DRY BULK') return 'cuft';
  return 'bbl';
};

const TankCard = ({
  tank = {},
  planningMode = false,
  selectedTanks = [],
  highlightPumpSystem = null,
  onClickTank = () => {}
}) => {
  if (!tank || typeof tank.id !== 'string') return null;

  const [showInfo, setShowInfo] = useState(false);

  const isSelected = selectedTanks.includes(tank.id);
  const isHighlighted = highlightPumpSystem !== null && tank.pumpSystemId === highlightPumpSystem;
  const dimOthers = highlightPumpSystem !== null && !isHighlighted;

  const unit = getTankUnit(tank);
  const capacity = typeof tank.capacity === 'number' ? tank.capacity : 0;
  const currentLevel = typeof tank.currentLevel === 'number' ? tank.currentLevel : 0;
  const contents = typeof tank.contents === 'string' ? tank.contents : 'Unknown';
  const client = typeof tank.client === 'string' ? tank.client : '';

  const levelPercent = Math.min(100, (currentLevel / (capacity || 1)) * 100);
  const levelColor = levelPercent > 80 ? 'bg-red-600' :
    tank.type === 'METHANOL' ? 'bg-purple-600' :
    tank.type === 'SLOP' ? 'bg-yellow-600' :
    'bg-green-600';

  const { label, emoji, tooltip } = getPumpSystemLabel(tank);
  const tooltipText = `Tank ID: ${tank.id}\nContents: ${contents}\nClient: ${client || 'Unassigned'}\nCapacity: ${capacity} ${unit}\nCurrent Level: ${currentLevel} ${unit}`;
  const isStarboard = tank.id.endsWith('S');

  return (
    <div
      className={`relative animate-fade-in ${getStatusColor(tank)} p-2 rounded-md cursor-pointer shadow-sm bg-white transform transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-lg
        ${planningMode
          ? isSelected
            ? 'border-2 border-blue-500 ring-2 ring-blue-300'
            : 'border border-gray-300'
          : dimOthers
            ? 'border border-gray-300 opacity-50'
            : 'border border-gray-300'
        } z-10`}
      onClick={() => onClickTank(tank.id)}
      title={tooltipText}
      onMouseLeave={() => setShowInfo(false)}
      onMouseEnter={() => {
        if (highlightPumpSystem === null) {
          setShowInfo(false);
        }
      }}
    >
      <div className="flex justify-between items-center text-[10px] font-semibold">
        <div>{tank.id}</div>
        <div
          className="text-[9px] px-1 py-0.5 rounded-full uppercase tracking-wide bg-blue-100 text-blue-800"
          title={tooltip}
        >
          <span className="mr-1">{emoji}</span>{label}
        </div>
      </div>
      <div className="text-[10px] text-gray-700">{capacity} {unit}</div>
      <div className="text-[10px] truncate text-gray-600">{contents}</div>
      {client && (
        <div className={`text-[10px] mt-1 ${getClientColor(client)} px-1 py-0.5 rounded-sm text-center`}>
          {client.split(' ').pop()}
        </div>
      )}
      <div className="w-full bg-gray-200 rounded h-1 mt-1 overflow-hidden">
        <div className={`h-full ${levelColor} transition-all duration-300 ease-in-out`} style={{ width: `${levelPercent}%` }}></div>
      </div>
      <div className="absolute bottom-1 right-1 flex gap-1 z-50">
        <button
          className="text-gray-400 hover:text-blue-600"
          onClick={(e) => { e.stopPropagation(); setShowInfo(prev => !prev); }}
          title="More info"
        >
          <Info size={12} />
        </button>
        <button
          className="text-gray-400 hover:text-green-600"
          onClick={(e) => { e.stopPropagation(); alert('Edit functionality coming soon!'); }}
          title="Quick edit"
        >
          <ClipboardEdit size={12} />
        </button>
      </div>
      {showInfo && (
        <div className={`fixed top-1/2 ${isStarboard ? 'left-full ml-2' : 'right-full mr-2'} w-56 bg-white border border-gray-300 rounded-lg shadow-2xl p-3 text-[10px] text-gray-700 z-[9999] animate-fade-in-fast`}>
          <div><strong>ID:</strong> {tank.id}</div>
          <div><strong>Contents:</strong> {contents}</div>
          <div><strong>Client:</strong> {client || 'Unassigned'}</div>
          <div><strong>Capacity:</strong> {capacity} {unit}</div>
          <div><strong>Level:</strong> {currentLevel} {unit}</div>
          <div><strong>System:</strong> {label}</div>
        </div>
      )}
    </div>
  );
};

const SectionHeader = ({ title, subtitle }) => (
  <div className="text-center mb-6 mt-8 animate-fade-in">
    <h4 className="text-base font-bold text-gray-800 uppercase tracking-wide border-b border-gray-300 pb-1 inline-block px-4">
      {title}
    </h4>
    {subtitle && (
      <div className="mt-2 text-[10px] bg-blue-100 text-blue-700 px-3 py-1 inline-block rounded-full shadow-sm">
        {subtitle}
      </div>
    )}
  </div>
);

const renderSection = (title, subtitle, tanks, renderCardRow) => (
  <div className="mb-8 px-4 py-4 bg-gray-50 rounded-lg shadow-inner animate-fade-in">
    <SectionHeader title={title} subtitle={subtitle} />
    <div className="space-y-2">
      {renderCardRow(tanks)}
    </div>
  </div>
);

const renderPairedTanks = (typeLabel, tanks, prefix, planningMode, selectedTanks, highlightPumpSystem, onClickTank) => (
  <div className="mb-8 px-4 py-4 bg-gray-50 rounded-lg shadow-inner animate-fade-in">
    <SectionHeader title={typeLabel} />
    {[1, 2, 3, 4, 5, 6].map(num => {
      const sTank = tanks.find(t => t.id === `${prefix}${num}S`);
      const pTank = tanks.find(t => t.id === `${prefix}${num}P`);
      if (!sTank && !pTank) return null;
      return (
        <div
          key={`${typeLabel}-${num}`}
          className="flex mb-2 gap-2 relative z-0"
        >
          <div className="w-5/12 relative z-0">{sTank && (
            <TankCard
              tank={sTank}
              planningMode={planningMode}
              selectedTanks={selectedTanks}
              highlightPumpSystem={highlightPumpSystem}
              onClickTank={onClickTank}
            />
          )}</div>

          <div className="flex-none w-2/12 relative flex justify-center items-center z-0">
            <div className="w-px h-full bg-gray-300"></div>
            <div className="absolute w-full top-1/2 border-t border-gray-300"></div>
          </div>

          <div className="w-5/12 relative z-0">{pTank && (
            <TankCard
              tank={pTank}
              planningMode={planningMode}
              selectedTanks={selectedTanks}
              highlightPumpSystem={highlightPumpSystem}
              onClickTank={onClickTank}
            />
          )}</div>
        </div>
      );
    })}
  </div>
);

export { TankCard, SectionHeader, renderSection, renderPairedTanks };
export default TankCard;
