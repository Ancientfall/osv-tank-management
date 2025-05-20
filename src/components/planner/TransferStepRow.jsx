import React from 'react';
import { Trash2 } from 'lucide-react';

const TransferStepRow = ({ step, index, onRemove }) => {
  return (
    <div className="flex items-center justify-between bg-white border rounded p-2 shadow-sm mb-2">
      <div className="text-sm">
        <strong>Step {index + 1}:</strong> Transfer from
        <span className="font-medium text-blue-600 mx-1">{step.tanks.join(', ')}</span>
        <span className="text-muted-foreground">– {step.note || 'No note'}</span>
      </div>
      {onRemove && (
        <button
          onClick={() => onRemove(index)}
          className="text-red-500 hover:text-red-700"
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
};

export default TransferStepRow;