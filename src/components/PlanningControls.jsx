import React from 'react';

const PlanningControls = ({
  planningMode,
  selectedVessel,
  selectedTanks,
  setSelectedTanks,
  transferSteps,
  setTransferSteps,
  currentStep,
  setCurrentStep
}) => {
  if (!planningMode) return null;

  const handleRemoveTank = (tankId) => {
    setSelectedTanks(prev => prev.filter(id => id !== tankId));
    setCurrentStep(prev => ({
      ...prev,
      tanks: prev.tanks.filter(id => id !== tankId)
    }));
  };

  const handleAddStep = () => {
    setTransferSteps(prev => [...prev, {
      tanks: [...selectedTanks],
      note: currentStep.note
    }]);
    setSelectedTanks([]);
    setCurrentStep({ tanks: [], note: "" });
  };

  const handleLoadStep = (index) => {
    const step = transferSteps[index];
    setCurrentStep(step);
    setSelectedTanks(step.tanks);
    setTransferSteps(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeleteStep = (index) => {
    setTransferSteps(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
      <h4 className="font-medium mb-3 flex items-center text-blue-800">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        Transfer Planning Mode
      </h4>

      {transferSteps.length > 0 && (
        <div className="mb-4 border-b border-blue-200 pb-3">
          <h5 className="text-sm font-medium text-blue-700 mb-2">Transfer Steps:</h5>
          <div className="space-y-2">
            {transferSteps.map((step, index) => (
              <div key={index} className="bg-white rounded p-2 border border-blue-200 flex justify-between items-center">
                <div>
                  <div className="font-medium text-sm">Step {index + 1}:</div>
                  <div className="text-xs text-gray-600">
                    Tanks: {step.tanks.join(', ')}
                  </div>
                  <div className="text-xs mt-1">{step.note}</div>
                </div>
                <div className="flex space-x-1">
                  <button
                    className="text-blue-500 hover:text-blue-700 p-1"
                    onClick={() => handleLoadStep(index)}
                    title="Edit Step"
                  >
                    ✏️
                  </button>
                  <button
                    className="text-red-500 hover:text-red-700 p-1"
                    onClick={() => handleDeleteStep(index)}
                    title="Delete Step"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h5 className="text-sm font-medium text-blue-700 mb-2">
          {transferSteps.length > 0 ? `Step ${transferSteps.length + 1}:` : 'Create Transfer Step:'}
        </h5>
        <p className="text-sm text-blue-700 mb-2">
          Click on tanks to select them for this step. Add a note describing the operation.
        </p>

        <div className="flex flex-col space-y-2">
          <div className="flex items-center">
            <span className="text-sm text-blue-700 w-24">Selected Tanks:</span>
            <div className="flex flex-wrap gap-1">
              {selectedTanks.length === 0 ? (
                <span className="text-sm text-gray-500 italic">No tanks selected</span>
              ) : (
                selectedTanks.map(tankId => {
                  const tank = selectedVessel.tanks.find(t => t.id === tankId);
                  return (
                    <span
                      key={tankId}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full flex items-center"
                    >
                      {tankId} ({tank?.contents || 'Unknown'})
                      <button
                        className="ml-1 text-blue-500 hover:text-blue-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveTank(tankId);
                        }}
                      >
                        ×
                      </button>
                    </span>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-2">
            <label className="text-sm text-blue-700 block mb-1">Step Instructions:</label>
            <textarea
              className="w-full p-2 border border-blue-200 rounded text-sm"
              placeholder="Add details about this step"
              value={currentStep.note}
              onChange={(e) =>
                setCurrentStep(prev => ({ ...prev, note: e.target.value }))
              }
              rows={2}
            />
          </div>

          <div className="flex justify-end space-x-2 mt-2">
            <button
              className="px-3 py-1 bg-gray-100 text-gray-800 rounded text-sm hover:bg-gray-200"
              onClick={() => {
                setSelectedTanks([]);
                setCurrentStep({ tanks: [], note: "" });
              }}
            >
              Clear
            </button>
            <button
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              disabled={selectedTanks.length === 0 || !currentStep.note.trim()}
              onClick={handleAddStep}
            >
              {transferSteps.length > 0 ? 'Add Step' : 'Create First Step'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanningControls;
// This component allows the user to plan transfer operations by selecting tanks, adding notes, and managing transfer steps.1