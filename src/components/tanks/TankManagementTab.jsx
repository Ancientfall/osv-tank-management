import React, { useState, useEffect } from 'react';
import TankSelector from '@/components/tanks/TankSelector';
import PlanningControls from '@/components/planner/PlanningControls';
import TransferPlanner from '@/components/planner/TransferPlanner';
import PumpSystemLegend from '@/components/legend/PumpSystemLegend';
import TankLayout from '@/components/tanks/TankLayout';
import TankDetails from '@/components/tanks/TankDetails';

const LOCAL_STORAGE_KEY = 'osv_transfer_steps';

const TankManagementTab = ({
  vessels,
  selectedVessel,
  onSetSelectedVessel,
  expandedTank,
  onSetExpandedTank
}) => {
  if (!selectedVessel || !selectedVessel.tanks?.length) {
    return <div className="p-4 text-gray-500 italic">No vessel or tank data available. Please select a valid vessel.</div>;
  }

  const [highlightPumpSystem, setHighlightPumpSystem] = useState(null);
  const [planningMode, setPlanningMode] = useState(false);
  const [selectedTanks, setSelectedTanks] = useState([]);
  const [transferSteps, setTransferSteps] = useState(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });
  const [currentStep, setCurrentStep] = useState({ tanks: [], note: "" });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(transferSteps));
  }, [transferSteps]);

  const filteredTanks = selectedVessel.tanks.filter(t => t.type !== 'DRY BULK');

  const pumpSystems = {};
  filteredTanks.forEach((tank) => {
    const pumpId = tank.pumpSystemId || 0;
    if (!pumpSystems[pumpId]) pumpSystems[pumpId] = [];
    pumpSystems[pumpId].push(tank);
  });

  const pumpSystemIds = Object.keys(pumpSystems).map(Number).sort((a, b) => a - b);

  return (
    <div className="p-4">
      <h2 className="text-xl mb-4 font-semibold text-gray-800">Tank Management</h2>

      <TankSelector
        vessels={vessels}
        selectedVesselId={selectedVessel.id}
        onChangeVessel={(vesselId) => {
          const newVessel = vessels.find((v) => v.id === vesselId);
          if (newVessel) {
            onSetSelectedVessel(newVessel);
            onSetExpandedTank(null);
            setHighlightPumpSystem(null);
            setPlanningMode(false);
            setSelectedTanks([]);
          }
        }}
        planningMode={planningMode}
        onTogglePlanningMode={setPlanningMode}
        onResetPlanning={() => {
          setSelectedTanks([]);
          setTransferSteps([]);
          setCurrentStep({ tanks: [], note: '' });
        }}
      />

      <PlanningControls
        planningMode={planningMode}
        selectedVessel={selectedVessel}
        selectedTanks={selectedTanks}
        setSelectedTanks={setSelectedTanks}
        transferSteps={transferSteps}
        setTransferSteps={setTransferSteps}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
      />

      <TransferPlanner
        selectedVessel={selectedVessel}
        transferSteps={transferSteps}
        onRemoveStep={(index) => setTransferSteps(prev => prev.filter((_, i) => i !== index))}
        onEditStep={(index, updatedStep) => {
          setTransferSteps(prev => {
            const updated = [...prev];
            updated[index] = updatedStep;
            return updated;
          });
        }}
        onAddStep={() => {
          setTransferSteps(prev => [...prev, { tanks: [], note: '', volume: 0, fluidType: '' }]);
        }}
      />

      <PumpSystemLegend
        pumpSystemIds={pumpSystemIds}
        pumpSystems={pumpSystems}
        highlightPumpSystem={highlightPumpSystem}
        onHighlight={setHighlightPumpSystem}
      />

      <TankLayout
        selectedVessel={{ ...selectedVessel, tanks: filteredTanks }}
        planningMode={planningMode}
        selectedTanks={selectedTanks}
        highlightPumpSystem={highlightPumpSystem}
        onSelectTank={setSelectedTanks}
        onExpandTank={onSetExpandedTank}
        expandedTank={expandedTank}
      />

      {expandedTank && (
        <TankDetails
          tank={filteredTanks.find((t) => t.id === expandedTank)}
          pumpSystems={pumpSystems}
          onClose={() => onSetExpandedTank(null)}
          onHighlightPumpSystem={setHighlightPumpSystem}
        />
      )}
    </div>
  );
};

export default TankManagementTab;
