import { cellFactory, without } from '../App';

export function CellInspector({ grid, cell, setGrid, setCell }) {
  const toggleCandidate = (cell, candidate) => {
    const newGrid = grid.slice().map(newCell => {
      if (newCell === cell) {
        const candidates = cell.candidates;
        if (candidates.includes(candidate)) {
          return cellFactory(cell.value, without(candidates, candidate), cell.block, cell.row, cell.col);
        } else {
          return cellFactory(cell.value, candidates.concat(candidate), cell.block, cell.row, cell.col);
        }
      } else {
        return newCell;
      }
    });
    const newCell = newGrid.filter(newCell => cell.is(newCell))[0];
    setGrid(newGrid);
    setCell(newCell);
  };
  const index = grid.indexOf(cell);
  return index > -1 && cell ? (<>
    <h2>Cell Row {cell.row + 1} Col {cell.col + 1} Block {cell.block + 1} Index {index}</h2>
    <div className="grid">{[1, 2, 3, 4, 5, 6, 7, 8, 9].map(candidate => {
      return <div key={candidate}>
        <label><input type="checkbox" checked={cell.candidates.includes(candidate)} onChange={() => toggleCandidate(cell, candidate)} />{candidate}</label>
      </div>;
    })}</div>
  </>) : null;
}
