import { dropCandidate, unique, cellFactory, row, col, block } from '../App';

export function __uniqueOnAVector(newGrid, cell, index, vector, prop, addLog) {
  let cont = true;
  // is a particular number a candidate in a single cell
  cell.candidates.forEach(candidate => {
    if(cont && !(vector(newGrid, cell[prop])
      .filter(other => !cell.is(other))
      .reduce((instances, other) => instances.concat(other.candidates), [])
      .filter(unique)
      .includes(candidate))
    ) {
      if(!cell.value) {
        newGrid[index] = cellFactory(candidate, [], cell.block, cell.row, cell.col);
      }
      cont = false;
    }
  });
  return cont;
}

function eliminateCandidates(other, grid, cell, addLog) {
    if(cell === other) return;
    if(!cell.value) return;
    dropCandidate(grid, other, cell.value, addLog);
  }
  
export default function uniqueOnAVector({ grid, addLog }) {
  const newGrid = grid.slice();
  // elim candidates in row 
  newGrid.forEach((cell, index) => {
    [[row, "row"], [col, "col"], [block, "block"]].map(([f, p]) => 
      f(newGrid, cell[p]).forEach(other => eliminateCandidates(other, newGrid, cell, (cell, action) => addLog(cell, action, `Candidate was assigned elsewhere on ${p}`))))
    __uniqueOnAVector(newGrid, cell, index, row, 'row', addLog) &&
    __uniqueOnAVector(newGrid, cell, index, col, 'col', addLog) &&
    __uniqueOnAVector(newGrid, cell, index, block, 'block', addLog);
  });
  return newGrid;
}