import React from 'react';
import { getCompatibilityLevel } from '@/utils/compatibilityUtils';
import { getCompatibilityIcon, getCompatibilityColor } from '@/utils/uiHelpers';

const TankStatusID = ({ currentFluid, previousFluid, compatibilityMatrix }) => {
  if (!currentFluid || !previousFluid) return null;

  const level = getCompatibilityLevel(currentFluid, previousFluid, compatibilityMatrix);
  const Icon = getCompatibilityIcon(level);
  const color = getCompatibilityColor(level);

  return (
    <div className="flex items-center gap-1">
      <Icon size={16} color={color} />
      <span className="text-sm text-muted-foreground">{level}</span>
    </div>
  );
};

export default TankStatusID;