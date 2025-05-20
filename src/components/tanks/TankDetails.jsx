import React from 'react';
import TankPropertiesPanel from './TankPropertiesPanel';
import TankCompatibilityInfo from './TankCompatibilityInfo';
import TankHistoryLog from './TankHistoryLog';
import TankActionsMenu from './TankActionsMenu';
import TankConstraintsPanel from './TankConstraintsPanel';

const TankDetails = ({ tank, pumpSystems, onClose, onHighlightPumpSystem }) => {
  if (!tank) return null;

  return (
    <div className="p-4 border rounded bg-background shadow-md mt-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Tank Details</h2>
        <button
          onClick={onClose}
          className="text-sm text-muted-foreground hover:underline"
        >
          Close
        </button>
      </div>

      <TankPropertiesPanel tank={tank} />
      <TankConstraintsPanel tank={tank} />
      <TankCompatibilityInfo tank={tank} compatibilityMatrix={pumpSystems.compatibilityMatrix} />
      <TankHistoryLog tankId={tank.id} />
      <TankActionsMenu tank={tank} onHighlightPumpSystem={onHighlightPumpSystem} />
    </div>
  );
};

export default TankDetails;