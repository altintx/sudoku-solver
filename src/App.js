import { useState } from 'react';
import strategies from './strategy';
import expertPuzzle from './puzzles/expert';
import hardPuzzle from './puzzles/hard';
import blankPuzzle from './puzzles/blank';
import LogTable from './components/log-table';
import './App.css';
import { Board } from './components/Board';
import { CellInspector } from './components/CellInspector';

const arrayOneToNine = [1, 2, 3, 4, 5, 6, 7, 8, 9];

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
  if (value && typeof value === "object" && "value" in value) {
    col = value.col;
    candidates = value.candidates;
    block = value.block;
    row = value.row;
    col = value.col;  
    value = value.value;
  }
  return {
    value: value? value: "",
    block, 
    row, 
    col, 
    candidates: value? [value]: candidates.length? candidates: arrayOneToNine,
    is: (c) => c.block === block && c.row === row && c.col === col,
    unchanged: function(c) { return c.is(this) && c.value === this.value && c.candidates.length === this.candidates.length }
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
function compare(expected, actual) {
  let array1 = expected.slice()
  let array2 = actual.slice()
  return array1.length === array2.length && array1.sort().every(function (value, index) { return value === array2.sort()[index] });
}
function isSolved(board) {
  let expected = arrayOneToNine;
  let valid = true
  // Check all rows
  for (let r = 0; r < 9 && valid; r++) {
      if (!compare(expected, row(board, r).map(cell => cell.value) )) {
          valid = false
      }
  }
  // Check all columns
  for (let c = 0; c < 9 && valid; c++) {
      if (!compare(expected, col(board, c).map(cell => cell.value))) {
          valid = false
      }
  }
  // Check all quadrants
  for (let q = 0; q < 9 && valid; q++) {
      if (!compare(expected, block(board, q).map(cell => cell.value))) {
          valid = false
      }
  }
  return valid
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
function forPrintSort(a,b) {
  if(a.row < b.row) return -1;
  if(b.row < a.row) return 1;
  if(a.col < b.col) return -1;
  if(b.col < a.col) return 1;
  return 0;
}
function fixCandidates(grid) {
  const newGrid = grid
    .map(cell => Object.assign(
      {},
      cell,
      { 
        candidates: cell.value? 
          [cell.value]: 
          arrayOneToNine
      }))
    .map((cell, ix, all) => {
      // get all in-use numbers on intersection cell
      [].concat(
        without(row(all, cell.row), cell).map(cell => cell.value),
        without(col(all, cell.col), cell).map(cell => cell.value),
        without(block(all, cell.block), cell).map(c => c.value)
      )
      // throw away unknowns
      .filter(v => v)
      .filter(unique)
      .forEach(inUse => cell.candidates = without(cell.candidates, inUse));
      return cell;
    });
  return newGrid;
}
function brute(grid, start = 0) {
  let newGrid = grid.map(c => cellFactory(c)); // make a copy of grid
        
  for(let ixCell = start; ixCell < grid.length; ixCell++) {
    if(!newGrid[ixCell].value) { // don't change solved cells
      const newCell = cellFactory(grid[ixCell]); // make a copy of cell
      const all = newCell.candidates; // grab its existing candidates
      let candidate = 0;
      for(let i = 0; i < all.length; i++) {
        candidate = all[i];
        newCell.value = candidate; 
        newCell.candidates = [candidate];
        newGrid[ixCell] = newCell;
        if(newCell.value == 9 && newCell.row == 0 && newCell.col == 0) debugger;
        newGrid = fixCandidates(newGrid);
        console.log(`setting (${newCell.row+1},${newCell.col+1}) to ${newCell.value}`);
        if(newGrid.every(cell => cell.candidates.length > 0)) {  // if every cell has possibilities
          if(newGrid.every(cell => cell.value)) { // if every cell has a value
            if (isSolved(newGrid)) { // if every value works
              return newGrid; // found it
            } else {
              return false; // backtrack
            }
          } else {
            // flush out additional cells
            const try2 = brute(newGrid, ixCell + 1);
            if(try2) {
              return try2;
            } else {
              if(i + 1 === all.length) {
                // a previous cell must have been bad, backtrack
                console.log(`Backtracking solving (${newCell.row+1},${newCell.col+1}) because all candidates from this cell have failed`);
                return false;
              } else {
                // additional candidates on this cell
              }
            }
          }
        } else {
          if(i + 1 === all.length) {
            // impossible puzzle, backtrack
            console.log(`Backtracking solving (${newCell.row+1},${newCell.col+1}) because all candidates from this cell have failed`);
            return false;
          } else {
            // additional candidates on this cell
          }
        }
      }
    }
  }
  return isSolved(newGrid)? newGrid: false;
}
function solver(grid, steps, actions, setLog) {
  const newLog = actions.slice();
  if (steps < 1) return grid;
  // any single candidates?
  let newGrid = grid.slice();
  newGrid = strategies.reduce((newGrid, strategy) => {
    return strategy({
      grid: newGrid,
      cellFactory,
      addLog: (cell, action, reason) => newLog.push(logEntry(cell, strategy.name, action, reason, newGrid)),
      row,
      col,
      block,
      dropCandidate,
      unsolved,
      flatten,
      unique,
    })
  }, newGrid);
  if(newGrid.every((cell, i) => grid[i].unchanged(cell))) {
    if(window.confirm("Couldn't deduce next step. Brute force?")) {
      const bruteGrid = brute(grid, 0, steps, actions, setLog);
      console.log("done with brute force")
      if(bruteGrid) {
        return { newGrid: bruteGrid, newLog: newLog };
      } else {
        alert("Couldn't find a solution from this board state.");
      }
    }
  } else {
    console.log(newGrid.filter((cell, i) => !grid[i].unchanged(cell)));
  }
  return { newGrid, newLog };
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
            <button onClick={() => { setLog([]); const newGrid = brute(grid, 0); if (newGrid) setGrid(newGrid); else alert("Can't solve")}}>Brute Force</button>
            <button onClick={() => { const { newLog, newGrid } = solver(grid, 1, log, setLog); setGrid(newGrid); setLog(newLog); }}>Next Step (Hint)</button>
          </div>
          <LogTable cell={cell} setGrid={setGrid} grid={grid} log={log} />
        </div>
      </div>
    </div>
  );
}

export default App;
