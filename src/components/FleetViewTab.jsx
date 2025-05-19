// src/components/FleetViewTab.jsx
import React, { useState, useEffect, createContext, useContext } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const FILL_COLORS = {
  dry: '#3b82f6',       // blue
  methanol: '#a78bfa',  // purple
  slop: '#facc15'       // yellow
};

const FillLimitContext = createContext(0.8);
export const useFillLimit = () => useContext(FillLimitContext);

const getInitialFillLimit = () => {
  const saved = localStorage.getItem('fleetFillLimit');
  return saved ? parseFloat(saved) : 0.8;
};

const FleetViewTab = ({ vessels, onSelectVessel }) => {
  const [fillLimit, setFillLimit] = useState(getInitialFillLimit());

  useEffect(() => {
    localStorage.setItem('fleetFillLimit', fillLimit.toString());
  }, [fillLimit]);

  return (
    <FillLimitContext.Provider value={fillLimit}>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl">Fleet Overview</h2>
          <div className="text-sm">
            <label className="mr-2 font-medium">Fill Limit:</label>
            <select
              className="border rounded px-2 py-1 text-sm"
              value={fillLimit}
              onChange={(e) => setFillLimit(parseFloat(e.target.value))}
            >
              <option value={0.8}>Normal Ops (80%)</option>
              <option value={0.9}>Override (90%)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vessels.map(vessel => {
            const liquidTanks = vessel.tanks.filter(t => t.type === 'LIQUID');
            const methanolTanks = vessel.tanks.filter(t => t.type === 'METHANOL');
            const slopTanks = vessel.tanks.filter(t => t.type === 'SLOP');
            const dryBulkTanks = vessel.tanks.filter(t => t.type === 'DRY BULK');

            const adjustedTanks = [...liquidTanks, ...methanolTanks, ...slopTanks];

            const totalCapacity = adjustedTanks.reduce((sum, t) => sum + (t.capacity * fillLimit), 0);
            const usedCapacity = adjustedTanks.reduce((sum, t) => sum + t.currentLevel, 0);
            const dryBulkCapacity = dryBulkTanks.reduce((sum, t) => sum + t.capacity, 0);

            const pieData = [
              { name: 'Dry Bulk', value: dryBulkCapacity, fill: FILL_COLORS.dry, unit: 'cuft' },
              { name: 'Methanol', value: methanolTanks.reduce((sum, t) => sum + (t.capacity * fillLimit), 0), fill: FILL_COLORS.methanol, unit: 'bbl' },
              { name: 'Slop', value: slopTanks.reduce((sum, t) => sum + (t.capacity * fillLimit), 0), fill: FILL_COLORS.slop, unit: 'bbl' }
            ];

            const overfilled = adjustedTanks.some(t => t.currentLevel > t.capacity * fillLimit);

            return (
              <div key={vessel.id} className="border rounded p-4 bg-white shadow-sm hover:shadow transition-shadow">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">{vessel.name}</h3>
                  <span className="text-xs text-gray-500">Last updated: {vessel.lastUpdated}</span>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-3">
                  <div className="border rounded p-2 bg-blue-50">
                    <div className="text-sm text-gray-600">Tanks</div>
                    <div className="font-bold text-lg">{vessel.tanks.length}</div>
                  </div>
                  <div className="border rounded p-2 bg-green-50">
                    <div className="text-sm text-gray-600">Total Capacity</div>
                    <div className="font-bold text-lg">{Math.round(totalCapacity)} bbl</div>
                  </div>
                  <div className="border rounded p-2 bg-purple-50">
                    <div className="text-sm text-gray-600">Used Capacity</div>
                    <div className="font-bold text-lg">
                      {totalCapacity > 0 ? Math.round(usedCapacity / totalCapacity * 100) : 0}%
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="text-sm font-medium mb-1">Tank Allocation</div>
                  <div className="h-40 w-full">
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={55}
                          label={({ name, value, unit }) => `${name}: ${Math.round(value)} ${unit}`}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name, props) => [`${Math.round(value)} ${props.payload.unit}`, name]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-between text-xs mt-2 text-gray-500">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 mr-1 rounded-full"></div>
                      <span>Dry Bulk</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-purple-500 mr-1 rounded-full"></div>
                      <span>Methanol</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-yellow-500 mr-1 rounded-full"></div>
                      <span>Slop</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  {vessel.tanks.some(t => t.type === 'METHANOL' && !['Methanol', 'Xylene'].includes(t.contents)) && (
                    <div className="text-xs text-red-600 mb-1">⚠️ Warning: Incompatible fluid in Methanol tank</div>
                  )}
                  {vessel.tanks.some(t => t.type === 'SLOP' && !['Rainwater', 'Oily Water', 'Trash'].includes(t.contents)) && (
                    <div className="text-xs text-red-600 mb-1">⚠️ Warning: Incompatible fluid in Slop tank</div>
                  )}
                  {overfilled && (
                    <div className="text-xs text-red-600 mb-1">⚠️ Warning: One or more tanks exceed {fillLimit * 100}% threshold</div>
                  )}
                </div>

                <div className="mt-2 flex justify-end">
                  <button 
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm hover:bg-blue-200 transition mr-2"
                    onClick={() => onSelectVessel(vessel)}
                  >
                    Manage Tanks
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </FillLimitContext.Provider>
  );
};

export default FleetViewTab;
