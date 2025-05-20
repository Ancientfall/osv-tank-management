import React, { useState, useEffect } from 'react';
import TankSelector from './TankSelector';
import PlanningControls from '../planner/PlanningControls';
import TransferPlanner from '../planner/TransferPlanner';
import PumpSystemLegend from '../legend/PumpSystemLegend';
import TankLayout from './TankLayout';
import TankDetails from './TankDetails';
import TankListTable from './TankListTable';

const LOCAL_STORAGE_KEY = 'osv_transfer_steps';

const TankManagementTab = ({ vessels, selectedVessel, onSetSelectedVessel, expandedTank, onSetExpandedTank }) => {
  if (!selectedVessel) return <div className="p-4">Please select a vessel.</div>;

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

  const handleAddStep = () => {
    setTransferSteps(prev => [...prev, { tanks: [], note: "", volume: 0, fluidType: "" }]);
  };

  const handleRemoveStep = (index) => {
    setTransferSteps(prev => prev.filter((_, i) => i !== index));
  };

  const handleEditStep = (index, updatedStep) => {
    setTransferSteps(prev => {
      const updated = [...prev];
      updated[index] = updatedStep;
      return updated;
    });
  };

  return (
    <div className="p-4">
      <h2 className="text-xl mb-4">Tank Management</h2>

      <TankSelector
        vessels={vessels}
        selectedVesselId={selectedVessel.id}
        onChangeVessel={(vesselId) => {
          const newVessel = vessels.find(v => v.id === vesselId);
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
          setCurrentStep({ tanks: [], note: "" });
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
        onRemoveStep={handleRemoveStep}
        onEditStep={handleEditStep}
        onAddStep={handleAddStep}
      />

      <PumpSystemLegend
        pumpSystemIds={Array.from(new Set(selectedVessel.tanks.map(t => t.pumpSystemId).filter(Boolean))).sort((a, b) => a - b)}
        pumpSystems={selectedVessel.tanks.reduce((acc, tank) => {
          if (tank.type === "DRY BULK") return acc;
          const id = tank.pumpSystemId || 0;
          acc[id] = acc[id] || [];
          acc[id].push(tank);
          return acc;
        }, {})}
        highlightPumpSystem={highlightPumpSystem}
        onHighlight={setHighlightPumpSystem}
      />

      <TankLayout
        selectedVessel={selectedVessel}
        planningMode={planningMode}
        selectedTanks={selectedTanks}
        highlightPumpSystem={highlightPumpSystem}
        onSelectTank={setSelectedTanks}
        onExpandTank={onSetExpandedTank}
        expandedTank={expandedTank}
      />

      {expandedTank && (
        <TankDetails
          tank={selectedVessel.tanks.find(t => t.id === expandedTank)}
          pumpSystems={{ compatibilityMatrix: {} }}
          onClose={() => onSetExpandedTank(null)}
          onHighlightPumpSystem={setHighlightPumpSystem}
        />
      )}

      <TankListTable
        tanks={selectedVessel.tanks}
        planningMode={planningMode}
        selectedTanks={selectedTanks}
        expandedTank={expandedTank}
        onSelectTank={setSelectedTanks}
        onExpandTank={onSetExpandedTank}
        compatibilityMatrix={{}} // Placeholder for now
      />
    </div>
  );
};

export default TankManagementTab;