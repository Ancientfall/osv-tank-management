import React from 'react';

const TransferSummaryPanel = ({ transferSteps = [] }) => {
  if (transferSteps.length === 0) return null;

  // Placeholder aggregation: volume by tank and fluid type
  const tankUsage = {};
  const fluidTotals = {};

  transferSteps.forEach((step) => {
    const volume = step.volume || 0; // Assuming volume may be added later
    step.tanks.forEach((tankId) => {
      tankUsage[tankId] = (tankUsage[tankId] || 0) + 1;
    });

    if (step.fluidType) {
      fluidTotals[step.fluidType] = (fluidTotals[step.fluidType] || 0) + volume;
    }
  });

  const tankEntries = Object.entries(tankUsage);
  const fluidEntries = Object.entries(fluidTotals);

  return (
    <div className="p-4 border rounded bg-white shadow-sm mt-4">
      <h3 className="text-lg font-semibold mb-2">Transfer Summary</h3>

      <div className="mb-3">
        <h4 className="text-sm font-medium mb-1">Tank Usage</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          {tankEntries.map(([tankId, count]) => (
            <li key={tankId}>
              <strong>Tank {tankId}:</strong> used in {count} step{count > 1 ? 's' : ''}
            </li>
          ))}
        </ul>
      </div>

      {fluidEntries.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-1">Fluid Totals</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            {fluidEntries.map(([fluid, total]) => (
              <li key={fluid}>
                <strong>{fluid}:</strong> {total} bbl
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TransferSummaryPanel;