import { useState } from 'react';
import strategies from './strategy';
import expertPuzzle from './puzzles/expert';
import hardPuzzle from './puzzles/hard';
import blankPuzzle from './puzzles/blank';
import LogTable from './components/log-table';
import './App.css';
import { Board } from './components/Board';
import { CellInspector } from './components/CellInspector';

function logEntry(cell, strategy, action, reason, grid) {
  return {
    row: cell.row, 
    col: cell.col,
    action,
    reason,
    grid,
    strategy
  }
}
export function cellFactory(value, candidates, block, row, col) {
  return {
    value: value? value: "",
    block, 
    row, 
    col, 
    candidates: value? [value]: candidates.length? candidates: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    is: (c) => c.block === block && c.row === row && c.col === col
  };
}

export function flatten(out, array) {
  return out.concat(array);
}

export function dropCandidate(grid, cell, candidate, addLog) {
  const cellIndex = cell.block * 9 + (cell.row % 3) * 3 + (cell.col % 3);
  const existingCandidates = cell.candidates;
  const newCandidates = without(existingCandidates, candidate);
  if(existingCandidates.length !== newCandidates.length) {
    addLog(cell, `Removed candidate ${candidate}`);
    grid[cellIndex] = cellFactory(
      cell.value,
      newCandidates,
      cell.block,
      cell.row,
      cell.col
    );
  }
}

export function row(grid, index) {
  return grid.filter((cell) => cell.row === index );
}
export function col(grid, index) {
  return grid.filter((cell) => cell.col === index );
}
export function block(grid, index) {
  return grid.filter((cell) => cell.block === index );
}
export function without(array, v) {
  return array.filter(value => v !== value);
}
export function unique(v, i, a) {
  return a.indexOf(v) === i;
}
export function unsolved(cell) {
  return cell.candidates.length > 1;
}
const gridSort = (a, b) => {
  if(a.block < b.block) {
    return -1;
  } else if (b.block < a.block) {
    return 1;
  } else if (a.row < b.row) {
    return -1;
  } else if (b.row < a.row) {
    return 1;
  } else if (a.col < b.col) {
    return -1;
  } else if (b.col < a.col) {
    return 1;
  } else {
    return 0;
  }
}

function solver(grid, steps, actions, setLog) {
  const log = actions.slice();
  if (steps < 1) return grid;
  // any single candidates?
  let newGrid = grid.slice();
  newGrid = strategies.reduce((newGrid, strategy) => {
    return strategy({
      grid: newGrid,
      cellFactory,
      addLog: (cell, action, reason) => log.push(logEntry(cell, strategy.name, action, reason, newGrid)),
      row,
      col,
      block,
      dropCandidate,
      unsolved,
      flatten,
      unique,
    })
  }, newGrid)
  setLog(log);
  return newGrid;
}


function App() {
  const gridUtilities = { gridSort, cellFactory, flatten }
  const [grid, setGrid] = useState(expertPuzzle(gridUtilities))
  const [cell, setCell] = useState(null);
  const [log, setLog] = useState([]);
  return (
    <div className="App">
      <header className="App-header">
        Sudoku Solver
      </header>
      <div style={{display:"flex", flexDirection: "row"}}>
        <div style={{flex:"1"}}>
          <Board grid={grid} setGrid={setGrid} setCell={setCell} log={log} setLog={setLog} />
        </div>
        <div style={{flex:"1"}}>
          <CellInspector grid={grid} setGrid={setGrid} cell={cell} setCell={setCell} log={log} setLog={setLog} />
          <div className="actions">
            <button onClick={() => { setLog([]); }}>Clear Log</button>
            <button onClick={() => { setLog([]); setGrid(hardPuzzle(gridUtilities)) }}>Hard Puzzle</button>
            <button onClick={() => { setLog([]); setGrid(expertPuzzle(gridUtilities)) }}>Expert Puzzle</button>
            <button onClick={() => { setLog([]); setGrid(blankPuzzle(gridUtilities)) }}>Blank Puzzle</button>
            <button onClick={() => { setGrid(solver(grid, 1, log, setLog)) }}>Next Step (Hint)</button>
          </div>
          <LogTable cell={cell} setGrid={setGrid} grid={grid} log={log} />
        </div>
      </div>
    </div>
  );
}

export default App;
