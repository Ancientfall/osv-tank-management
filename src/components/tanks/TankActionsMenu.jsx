import React from 'react';

// Placeholder sample history — replace with real data source if available
const mockHistory = [
  { id: 1, timestamp: '2025-05-15T10:30Z', action: 'Filled with SBM 10.5ppg' },
  { id: 2, timestamp: '2025-05-12T13:00Z', action: 'Flushed and cleaned' },
  { id: 3, timestamp: '2025-05-08T08:15Z', action: 'Drained OBM 14.2ppg' },
];

const TankHistoryLog = ({ tankId }) => {
  // In a real app, you’d fetch or filter history by tankId
  const history = mockHistory;

  return (
    <div className="p-4 border rounded bg-white shadow-sm mb-4">
      <h3 className="text-lg font-semibold mb-2">Tank History</h3>
      <ul className="text-sm text-muted-foreground space-y-1 max-h-48 overflow-y-auto">
        {history.map(entry => (
          <li key={entry.id}>
            <span className="font-medium">{new Date(entry.timestamp).toLocaleString()}</span>: {entry.action}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TankHistoryLog;