// Note: The below code assumes that the components TankSelector, PumpSystemLegend, PlanningControls, TransferPlanner, TankLayout, TankDetails, and TankListTable are already defined and imported correctly.
import React, { useState } from 'react';
import TankSelector from './TankSelector';
import PumpSystemLegend from './PumpSystemLegend';
import PlanningControls from './PlanningControls';
import TransferPlanner from './TransferPlanner';
import TankLayout from './TankLayout';
import TankDetails from './TankDetails';
import TankListTable from './TankListTable';

const TankManagementTab = ({
  vessels,
  selectedVessel,
  onSetSelectedVessel,
  expandedTank,
  onSetExpandedTank
}) => {
  if (!selectedVessel) return <div className="p-4">Please select a vessel.</div>;

  const [highlightPumpSystem, setHighlightPumpSystem] = useState(null);
  const [planningMode, setPlanningMode] = useState(false);
  const [selectedTanks, setSelectedTanks] = useState([]);
  const [transferSteps, setTransferSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState({ tanks: [], note: "" });

  // Group tanks by pump system
  const pumpSystems = {};
  selectedVessel.tanks.forEach(tank => {
    if (tank.type === "DRY BULK") return;
    const pumpId = tank.pumpSystemId || 0;
    if (!pumpSystems[pumpId]) pumpSystems[pumpId] = [];
    pumpSystems[pumpId].push(tank);
  });
  const pumpSystemIds = Object.keys(pumpSystems).map(Number).sort((a, b) => a - b);

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
      />

      <PumpSystemLegend
        pumpSystemIds={pumpSystemIds}
        pumpSystems={pumpSystems}
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
          pumpSystems={pumpSystems}
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
      />
    </div>
  );
};

export default TankManagementTab;
