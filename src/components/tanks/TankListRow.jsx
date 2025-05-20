import React from 'react';
import { Droplet, Package } from 'lucide-react';
import TankStatusID from './TankStatusID';

const TankListRow = ({
  tank,
  planningMode,
  selectedTanks,
  expandedTank,
  compatibilityMatrix,
  onSelectTank,
  onExpandTank
}) => {
  const isSelected = selectedTanks.includes(tank.id);
  const isExpanded = expandedTank === tank.id;

  const toggleSelection = () => {
    if (!planningMode) return;
    if (isSelected) {
      onSelectTank(selectedTanks.filter(id => id !== tank.id));
    } else {
      onSelectTank([...selectedTanks, tank.id]);
    }
  };

  const handleExpand = () => {
    onExpandTank(isExpanded ? null : tank.id);
  };

  return (
    <tr
      className={
        isSelected ? 'bg-blue-50 cursor-pointer' : 'hover:bg-muted cursor-pointer'
      }
      onClick={toggleSelection}
    >
      <td className="px-3 py-2 text-sm">{tank.name}</td>
      <td className="px-3 py-2 text-sm">{tank.capacity} bbl</td>
      <td className="px-3 py-2 text-sm flex items-center gap-1">
        <Droplet size={14} /> {tank.currentFluid}
      </td>
      <td className="px-3 py-2 text-sm flex items-center gap-1">
        <Package size={14} /> {tank.previousFluid}
      </td>
      <td className="px-3 py-2 text-sm" onClick={handleExpand}>
        <TankStatusID
          currentFluid={tank.currentFluid}
          previousFluid={tank.previousFluid}
          compatibilityMatrix={compatibilityMatrix}
        />
      </td>
    </tr>
  );
};

export default TankListRow;