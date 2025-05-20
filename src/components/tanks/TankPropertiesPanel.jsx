import React from 'react';

const TankPropertiesPanel = ({ tank }) => {
  if (!tank) return null;

  return (
    <div className="p-4 border rounded bg-white shadow-sm mb-4">
      <h3 className="text-lg font-semibold mb-2">Tank Properties</h3>
      <ul className="text-sm text-muted-foreground space-y-1">
        <li><strong>Name:</strong> {tank.name}</li>
        <li><strong>Capacity:</strong> {tank.capacity} bbl</li>
        <li><strong>Current Fluid:</strong> {tank.currentFluid || '—'}</li>
        <li><strong>Previous Fluid:</strong> {tank.previousFluid || '—'}</li>
        <li><strong>Pump System ID:</strong> {tank.pumpSystemId ?? 'N/A'}</li>
        {tank.outOfService && <li className="text-red-500 font-medium">Out of Service</li>}
      </ul>
    </div>
  );
};

export default TankPropertiesPanel;