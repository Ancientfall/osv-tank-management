import React from 'react';
import { Table, Thead, Tbody, Tr, Th } from '@/components/ui/table';
import TankListRow from './TankListRow';

const TankListTable = ({
  tanks,
  planningMode,
  selectedTanks,
  expandedTank,
  onSelectTank,
  onExpandTank,
  compatibilityMatrix
}) => {
  return (
    <div className="mt-4">
      <Table>
        <Thead>
          <Tr>
            <Th>Tank Name</Th>
            <Th>Capacity</Th>
            <Th>Current Fluid</Th>
            <Th>Previous Fluid</Th>
            <Th>Compatibility</Th>
          </Tr>
        </Thead>
        <Tbody>
          {tanks.map((tank) => (
            <TankListRow
              key={tank.id}
              tank={tank}
              planningMode={planningMode}
              selectedTanks={selectedTanks}
              expandedTank={expandedTank}
              compatibilityMatrix={compatibilityMatrix}
              onSelectTank={onSelectTank}
              onExpandTank={onExpandTank}
            />
          ))}
        </Tbody>
      </Table>
    </div>
  );
};

export default TankListTable;