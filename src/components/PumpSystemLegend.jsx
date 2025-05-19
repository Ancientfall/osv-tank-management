import React from 'react';

const PumpSystemLegend = ({
  pumpSystemIds,
  highlightPumpSystem,
  pumpSystems,
  onHighlight
}) => {
  return (
    <div className="mb-4 bg-white border rounded-lg p-3 shadow-sm">
      <h4 className="font-medium mb-2">Connected Pump Systems</h4>
      <div className="text-sm mb-2">
        Tanks belonging to the same pump system are physically connected and can be used to carry compatible fluids.
      </div>
      <div className="flex flex-wrap gap-2">
        {pumpSystemIds.map(pumpId => (
          <button
            key={pumpId}
            className={`px-3 py-1 rounded-full text-sm border ${
              highlightPumpSystem === pumpId ? 'ring-2 ring-offset-1 ring-blue-500' : ''
            }`}
            style={{
              backgroundColor: highlightPumpSystem === pumpId
                ? `rgba(${pumpId * 40}, ${150 - pumpId * 10}, ${200 - pumpId * 20}, 0.3)`
                : 'transparent',
              borderColor: `rgba(${pumpId * 40}, ${150 - pumpId * 10}, ${200 - pumpId * 20}, 0.8)`
            }}
            onClick={() => onHighlight(highlightPumpSystem === pumpId ? null : pumpId)}
          >
            {pumpId === 4
              ? "Methanol System"
              : pumpId === 5
              ? "Slop Tank System"
              : `System ${pumpId}`} ({pumpSystems[pumpId]?.length || 0} tanks)
          </button>
        ))}
        {highlightPumpSystem && (
          <button
            className="px-3 py-1 rounded-full text-sm border border-gray-300 bg-gray-100"
            onClick={() => onHighlight(null)}
          >
            Clear Selection
          </button>
        )}
      </div>
    </div>
  );
};

export default PumpSystemLegend;
