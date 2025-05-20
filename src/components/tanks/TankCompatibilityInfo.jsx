import React from 'react';
import { getCompatibilityLevel } from '@/utils/compatibilityUtils';
import { getCompatibilityIcon, getCompatibilityColor } from '@/utils/uiHelpers';

const TankCompatibilityInfo = ({ tank, compatibilityMatrix }) => {
  if (!tank || !tank.currentFluid || !tank.previousFluid) return null;

  const level = getCompatibilityLevel(tank.currentFluid, tank.previousFluid, compatibilityMatrix);
  const Icon = getCompatibilityIcon(level);
  const color = getCompatibilityColor(level);

  return (
    <div className="p-4 border rounded bg-white shadow-sm mb-4">
      <h3 className="text-lg font-semibold mb-2">Compatibility</h3>
      <div className="flex items-center gap-2">
        <Icon size={20} color={color} />
        <span className="text-sm text-muted-foreground">{level}</span>
      </div>
    </div>
  );
};

export default TankCompatibilityInfo;