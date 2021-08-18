import { dropCandidate, row, col, block } from '../App';

function eliminateCandidates(other, grid, cell, addLog) {
    if(!cell.value) return;
    dropCandidate(grid, other, cell.value, addLog);
  }
  
export default function uniqueOnAVector({ grid, addLog }) {
  const newGrid = grid.slice();
  // elim candidates in row 
  newGrid.forEach((cell, index) => {
    [[row, "row"], [col, "col"], [block, "block"]].map(([f, p]) => 
      f(newGrid, cell[p]).forEach(other => {
        if(cell.is(other)) return;
        const limiter = cell;
        eliminateCandidates(other, newGrid, cell, (cell, action) => addLog(cell, action, `Candidate was assigned at (${limiter.row+1}, ${limiter.col+1})`));
      }))
  });
  return newGrid;
}