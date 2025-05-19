// This component displays a preview of the transfer plan with options to download or email it.
import React from 'react';
import toast from 'react-hot-toast';

const TransferPlanner = ({ selectedVessel, transferSteps }) => {
  if (!transferSteps.length) return null;

  const handleDownloadPlan = () => {
    const transferPlanData = {
      vessel: selectedVessel.name,
      date: new Date().toISOString().split('T')[0],
      steps: transferSteps.map((step, index) => ({
        stepNumber: index + 1,
        tanks: step.tanks.map(tankId => {
          const tank = selectedVessel.tanks.find(t => t.id === tankId);
          return {
            id: tank.id,
            type: tank.type,
            capacity: tank.capacity,
            contents: tank.contents,
            currentLevel: tank.currentLevel
          };
        }),
        instructions: step.note
      }))
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(transferPlanData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `transfer-plan-${selectedVessel.name.replace(/\s+/g, '-')}-${transferPlanData.date}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    toast.success('Transfer plan downloaded');
  };

  const handleEmailPlan = () => {
    const subject = `Multi-Step Transfer Plan for ${selectedVessel.name} - ${new Date().toISOString().split('T')[0]}`;
    let body = `Transfer Plan for ${selectedVessel.name}\n\n`;
    transferSteps.forEach((step, index) => {
      body += `STEP ${index + 1}:\n`;
      body += `Tanks: ${step.tanks.join(', ')}\n`;
      body += `Instructions: ${step.note}\n\n`;
    });

    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);
    toast.success('Email client opened');
  };

  return (
    <div className="mb-6 bg-white border rounded-lg p-4 shadow-sm">
      <h3 className="text-lg font-semibold mb-2">Multi-Step Transfer Plan Preview</h3>

      <div className="relative border-2 border-blue-200 rounded-lg p-6 bg-blue-50 mb-3">
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
          Transfer Plan: {selectedVessel.name} ({transferSteps.length} {transferSteps.length === 1 ? 'step' : 'steps'})
        </div>

        <div className="mt-8">
          <div className="relative">
            {transferSteps.map((step, index) => (
              <div key={index} className="mb-10 relative">
                <div className="flex items-center mb-2">
                  <div className="bg-blue-600 text-white font-bold rounded-full w-6 h-6 flex items-center justify-center mr-2 z-10">
                    {index + 1}
                  </div>
                  <h4 className="font-medium text-blue-800">Step {index + 1}</h4>
                </div>

                {index < transferSteps.length - 1 && (
                  <div className="absolute left-3 top-6 bottom-0 w-0.5 bg-blue-300 -mb-8"></div>
                )}

                <div className="ml-8">
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {step.tanks.map(tankId => {
                      const tank = selectedVessel.tanks.find(t => t.id === tankId);
                      if (!tank) return null;
                      return (
                        <div
                          key={tankId}
                          className="bg-white p-2 rounded-lg border-2 border-blue-400 shadow-sm relative"
                        >
                          <div className="font-bold text-sm">{tankId}</div>
                          <div className="text-xs">{tank.capacity} bbl</div>
                          <div className="text-xs font-medium">{tank.contents}</div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="bg-blue-600 text-white p-2 rounded-lg shadow mb-2 text-sm">
                    {step.note}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <button
          className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200"
          onClick={handleDownloadPlan}
        >
          Download Plan
        </button>
        <button
          className="px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700"
          onClick={handleEmailPlan}
        >
          Email Plan
        </button>
      </div>
    </div>
  );
};

export default TransferPlanner;
