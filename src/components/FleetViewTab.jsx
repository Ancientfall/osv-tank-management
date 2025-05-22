// src/components/FleetViewTab
import React, { useState, useEffect } from 'react';
import { Droplet, Package, AlertTriangle, FlaskConical, Fuel, Waves, Star } from 'lucide-react';

const getInitialFillLimit = () => {
  const saved = localStorage.getItem('fleetFillLimit');
  return saved ? parseFloat(saved) : 0.8;
};

const FleetViewTab = ({ vessels, onSelectVessel }) => {
  const [sortByPumpSystem, setSortByPumpSystem] = useState(false);
  const [taggedVessels, setTaggedVessels] = useState([]);
  const [exportPlan, setExportPlan] = useState('');
  const [fillLimit, setFillLimit] = useState(getInitialFillLimit());
  const [showOnlyBest, setShowOnlyBest] = useState(false);

  useEffect(() => {
    localStorage.setItem('fleetFillLimit', fillLimit.toString());
  }, [fillLimit]);

  const getPercent = (used, total) => total > 0 ? Math.round((used / total) * 100) : 0;

  const renderMiniBar = (used, total, pumpGroupId) => {
    const percent = getPercent(used, total);
    const tooltipText = `${used} of ${total} (${percent}%)`;
    const pumpClass = pumpGroupId ? `bg-pump-${pumpGroupId}` : '';
    return (
      <div className="w-full bg-gray-200 rounded-full h-2 mt-1" title={tooltipText}>
        <div
          className={`h-2 rounded-full transition-all duration-500 ease-in-out ${pumpClass || (percent >= 90 ? 'bg-red-600' : percent >= 80 ? 'bg-yellow-400' : 'bg-eco-orange')}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    );
  };

  const sortedVessels = [...vessels].sort((a, b) => {
    if (sortByPumpSystem) {
      const aPump = a.tanks.filter(t => t.pumpSystemId).length;
      const bPump = b.tanks.filter(t => t.pumpSystemId).length;
      return bPump - aPump;
    }
    const aLiquidCapacity = a.tanks.filter(t => t.type === 'LIQUID').reduce((s, t) => s + t.capacity, 0);
    const bLiquidCapacity = b.tanks.filter(t => t.type === 'LIQUID').reduce((s, t) => s + t.capacity, 0);
    return bLiquidCapacity - aLiquidCapacity;
  });

  const topCandidates = sortedVessels.slice(0, 2).map(v => v.id);
  const filteredVessels = showOnlyBest ? sortedVessels.filter(v => topCandidates.includes(v.id)) : sortedVessels;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl text-eco-navy font-bold">Fleet Overview</h2>
        <div className="flex gap-4 items-center text-sm">
          <button onClick={() => setSortByPumpSystem(!sortByPumpSystem)} className="px-2 py-1 border border-eco-navy rounded text-xs hover:bg-eco-navy hover:text-white">
            Sort by {sortByPumpSystem ? 'Capacity' : 'Pump Systems'}
          </button>
          <button onClick={() => setExportPlan(taggedVessels.join(', '))} className="px-2 py-1 border border-eco-orange rounded text-xs hover:bg-eco-orange hover:text-white">
            Export Plan
          </button>
          <label className="text-eco-navy font-medium">Fill Limit:</label>
          <select
            className="border border-eco-navy rounded px-2 py-1 text-sm"
            value={fillLimit}
            onChange={(e) => setFillLimit(parseFloat(e.target.value))}
          >
            <option value={0.8}>Normal Ops (80%)</option>
            <option value={0.9}>Override (90%)</option>
          </select>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlyBest}
              onChange={(e) => setShowOnlyBest(e.target.checked)}
              className="accent-eco-orange"
            />
            <span className="text-eco-navy">Show Only Best Candidates</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredVessels.map(vessel => {
          const liquidTanks = vessel.tanks.filter(t => t.type === 'LIQUID');
          const methanolTanks = vessel.tanks.filter(t => t.type === 'METHANOL');
          const slopTanks = vessel.tanks.filter(t => t.type === 'SLOP');
          const dryBulkTanks = vessel.tanks.filter(t => t.type === 'DRY BULK');

          const totalCapacity = [...liquidTanks, ...methanolTanks, ...slopTanks].reduce((sum, t) => sum + (t.capacity * fillLimit), 0);
          const usedCapacity = [...liquidTanks, ...methanolTanks, ...slopTanks].reduce((sum, t) => sum + t.currentLevel, 0);
          const overfilled = [...liquidTanks, ...methanolTanks, ...slopTanks].some(t => t.currentLevel > t.capacity * fillLimit);

          return (
            <div key={vessel.id} className="border border-eco-navy rounded-xl p-4 bg-eco-white shadow hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-eco-navy">{vessel.name}</h3>
                <div className="flex items-center gap-2">
                  {topCandidates.includes(vessel.id) && (
                    <span className="text-eco-orange flex items-center text-xs font-semibold"><Star size={14} className="mr-1" /> Best Candidate</span>
                  )}
                  <span className="text-xs text-eco-navy">Last updated: {vessel.lastUpdated}</span>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-eco-navy">
                {[{
                  icon: <Droplet size={16} />, label: 'Liquid Mud', tanks: liquidTanks, unit: 'bbls', showPumps: true
                }, {
                  icon: <AlertTriangle size={16} />, label: 'Slop', tanks: slopTanks, unit: 'bbls', showPumps: false
                }, {
                  icon: <FlaskConical size={16} />, label: 'Methanol', tanks: methanolTanks, unit: 'bbls / gal', showPumps: false
                }].map(({ icon, label, tanks, unit, showPumps }, idx) => {
                  const total = tanks.reduce((s, t) => s + t.capacity * fillLimit, 0);
                  const used = tanks.reduce((s, t) => s + t.currentLevel, 0);
                  const fluids = Array.from(new Set(tanks.map(t => t.contents).filter(Boolean))).join(', ');
                  const pumpGroups = showPumps ? Array.from(new Set(tanks.map(t => t.pumpSystemId).filter(Boolean))) : [];
                  return (
                    <div key={idx} className="bg-eco-white border border-eco-navy rounded p-2">
                      <div className="flex items-center gap-2">
                        {icon}
                        <span><strong>{label}:</strong> {tanks.length} tanks — {Math.round(total)} {unit} ({getPercent(used, total)}%)</span>
                      </div>
                      {showPumps && pumpGroups.map((pid) => {
                        const groupTanks = tanks.filter(t => t.pumpSystemId === pid);
                        const groupTotal = groupTanks.reduce((s, t) => s + t.capacity * fillLimit, 0);
                        const groupUsed = groupTanks.reduce((s, t) => s + t.currentLevel, 0);
                        return (
                          <div key={pid} className="mt-1">
                            {renderMiniBar(groupUsed, groupTotal, pid)}
                            <div className="text-xs text-gray-500">Pump System {pid}: {groupTanks.map(t => t.name).join(', ')}</div>
                          </div>
                        );
                      })}
                      {fluids && <div className="text-xs mt-1 text-gray-600">{tanks.map(t => `${t.name}: ${t.contents || 'Empty'}`).join(', ')}</div>}
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-eco-navy">
                <div className="flex items-center gap-2">
                  <Fuel size={16} />
                  <span><strong>Fuel:</strong> {vessel.fuelOnBoard} gal</span>
                </div>
                <div className="flex items-center gap-2">
                  <Waves size={16} />
                  <span><strong>Water:</strong> {vessel.waterOnBoard} gal</span>
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

              <div className="mt-2 flex justify-between items-center">
                <button
                  className={`border px-2 py-1 rounded text-xs ${taggedVessels.includes(vessel.name) ? 'bg-green-100 border-green-400 text-green-700' : 'border-eco-navy text-eco-navy hover:bg-eco-navy hover:text-white'}`}
                  onClick={() => setTaggedVessels(prev => prev.includes(vessel.name) ? prev.filter(v => v !== vessel.name) : [...prev, vessel.name])}
                >
                  {taggedVessels.includes(vessel.name) ? 'Tagged for Job' : 'Tag for Job'}
                </button>
                <button
                  className="bg-eco-orange text-white px-3 py-1 rounded text-sm hover:bg-orange-600 transition"
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
  );
};

export default FleetViewTab;
