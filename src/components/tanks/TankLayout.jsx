import React from 'react';
import TankCard from './TankCard';
import TankBlock from './TankBlock';

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

  const handleClickTank = (tankId) => {
    if (planningMode) {
      if (selectedTanks.includes(tankId)) {
        onSelectTank(selectedTanks.filter(id => id !== tankId));
      } else {
        onSelectTank([...selectedTanks, tankId]);
      }
    }
  };

  const renderTank = (tank) => {
    if (tank.outOfService) {
      return <TankBlock key={tank.id} tank={tank} />;
    }

    return (
      <TankCard
        key={tank.id}
        tank={tank}
        isSelected={selectedTanks.includes(tank.id)}
        isHighlighted={highlightPumpSystem === tank.pumpSystemId}
        onClick={handleClickTank}
        onExpand={onExpandTank}
      />
    );
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
      {selectedVessel.tanks.map(renderTank)}
    </div>
  );
};

export default TankLayout;