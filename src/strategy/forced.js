import { unsolved, flatten, unique, dropCandidate, row, col, block } from '../App';
function candidatesOnVector(vector) {
    return vector
      .filter(unsolved) 
      .map(cell => cell.candidates)
      .reduce(flatten, [])
      .filter(unique);
}

function firstCellsInBlock(vector) {
    return vector
      .filter((cell, _, all) => cell === all.filter(bc => bc.block === cell.block)[0]);
  }
  
export default function forced ({ grid, addLog }) {
  const newGrid = grid.slice();
  // maybe we can't jail a number to a cell but every possibility in a particular block is.
  // on a common col, then it's not elsewhere on that col.
  // same for row.
  for(let ixRow = 0; ixRow < 9; ixRow++) {
    const cells = row(newGrid, ixRow);
    candidatesOnVector(cells).forEach((candidate, i, candidates) => {
      firstCellsInBlock(cells).forEach(cell => {
        const possibilitiesInBlock = block(newGrid, cell.block)
          .filter(blockCell => blockCell.candidates.includes(candidate));
        if(possibilitiesInBlock.every(blockCell => blockCell.row === cell.row)) {
          // console.log(`${candidate} in row ${ixRow} must be in block ${cell.block}`);
          cells
            .filter(c => c.block !== cell.block)
            .forEach(c => {
              if(c.candidates.includes(candidate)) {
                addLog(c, `Removed candidate ${candidate}`, `${candidate} in row ${ixRow + 1} must in block ${cell.block + 1}`)
                dropCandidate(newGrid, c, candidate, () => {});
              }
            })
        }
      })
    })
  }
  for(let ixCol = 0; ixCol < 9; ixCol++) {
    const cells = col(newGrid, ixCol);
    candidatesOnVector(cells).forEach(candidate => {
      firstCellsInBlock(cells).forEach(cell => {
        const possibilitiesInBlock = block(newGrid, cell.block)
          .filter(blockCell => blockCell.candidates.includes(candidate));
        if(possibilitiesInBlock.every(blockCell => blockCell.col === cell.col)) {
          // console.log(`${candidate} in col ${ixCol} must be in block ${cell.block}`);
          cells
            .filter(c => c.block !== cell.block)
            .forEach(c => {
              if(c.candidates.includes(candidate)) {
                addLog(c, `Removed candidate ${candidate}`, `${candidate} in column ${ixCol + 1} must in block ${cell.block + 1}`)
                dropCandidate(newGrid, c, candidate, () => {});
              }
            })
        }
      })
    })
  }
  return newGrid;
}