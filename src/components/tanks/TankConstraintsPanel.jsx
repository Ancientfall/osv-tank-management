import React from 'react';

const TankConstraintsPanel = ({ tank }) => {
  if (!tank) return null;

  // Example constraints; replace with actual logic as needed
  const constraints = {
    maxFillLevel: tank.capacity * 0.95,
    minTemperature: tank.minTemperature || 'N/A',
    maxPressure: tank.maxPressure || 'N/A',
  };

  return (
    <div className="p-4 border rounded bg-white shadow-sm mb-4">
      <h3 className="text-lg font-semibold mb-2">Tank Constraints</h3>
      <ul className="text-sm text-muted-foreground space-y-1">
        <li><strong>Max Fill Level:</strong> {constraints.maxFillLevel} bbl</li>
        <li><strong>Min Temperature:</strong> {constraints.minTemperature} °F</li>
        <li><strong>Max Pressure:</strong> {constraints.maxPressure} psi</li>
      </ul>
    </div>
  );
};

export default TankConstraintsPanel;
