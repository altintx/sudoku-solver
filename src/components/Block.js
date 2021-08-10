import { Cell } from './Cell';
import { cellFactory } from '../App';



export function Block({ number, grid, setGrid, setCell }) {
  const rows = [];
  for (let row = 0; row < 3; row++) {
    const cols = [];
    for (let col = 0; col < 3; col++) {
      const cellIndex = number * 9 + row * 3 + col;
      const cell = grid[cellIndex];
      const f = (event) => {
        const value = event.target.value;
        const newGrid = grid.slice();
        newGrid[cellIndex] = cellFactory(
          value ? parseInt(value, 10) : null,
          value ? [value] : [1, 2, 3, 4, 5, 6, 7, 8, 9],
          cell.block,
          cell.row,
          cell.col
        );
        if (value !== cell.value)
          setGrid(newGrid);
      };
      cols.push(<Cell key={`${cell.block}-${cell.row}-${cell.col}`} data={cell} value={cell.value} candidates={cell.candidates} block={number} row={row} col={col} onChange={f} onFocus={() => setCell(cell)} />);
    }
    rows.push(cols);
  }
  return <div className="grid">{rows}</div>;
}
