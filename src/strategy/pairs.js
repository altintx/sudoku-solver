export default function pairs({ grid, row, block, addLog, col, dropCandidate }) {
    // TODO: Can this be expanded to three (triples)
  const newGrid = grid.slice();
  for(let rowIndex = 0; rowIndex < 9; rowIndex++) {
    const pairs = row(newGrid, rowIndex).filter(cell => cell.candidates.length === 2);
    pairs.forEach(cell => {
      pairs.filter(pair => !cell.is(pair) && pair.block === cell.block).forEach(pair => {
        if(pair.candidates[0] === cell.candidates[0] && pair.candidates[1] === cell.candidates[1]) {
          // get all cells in block
          block(newGrid, cell.block)
            // exclude these 2
            .filter(blockCell => !cell.is(blockCell) && !pair.is(blockCell))
            // remove these 2 candidates from other cells
            .forEach(c => {
              dropCandidate(newGrid, c, pair.candidates[0], (cell, action) => { debugger; addLog(cell, action, "Candidate is part of a pair on the row") });
              dropCandidate(newGrid, c, pair.candidates[1], (cell, action) => { debugger; addLog(cell, action, "Candidate is part of a pair on the row") });
            })
        }
      })
    });
  }
  // TODO: Can this be expanded to three (triples)
  for(let colIndex = 0; colIndex < 9; colIndex++) {
    const pairs = col(newGrid, colIndex).filter(cell => cell.candidates.length === 2);
    pairs.forEach(cell => {
      pairs.filter(pair => !cell.is(pair) && pair.block === cell.block).forEach(pair => {
        if(pair.candidates[0] === cell.candidates[0] && pair.candidates[1] === cell.candidates[1]) {
          // get all cells in block
          block(newGrid, cell.block)
            // exclude these 2
            .filter(blockCell => !cell.is(blockCell) && !pair.is(blockCell))
            // remove these 2 candidates from other cells
            .forEach(c => {
              dropCandidate(newGrid, c, pair.candidates[0], (cell, action) => addLog(cell, action, "Candidate is part of a pair on the col"));
              dropCandidate(newGrid, c, pair.candidates[1], (cell, action) => addLog(cell, action, "Candidate is part of a pair on the col"));
            })         
        }
      })
    });
  }
  return newGrid;
}