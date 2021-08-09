import { useState } from 'react';
import './App.css';
import './Block.css';

function logEntry(cell, action, reason, grid) {
  return {
    row: cell.row, 
    col: cell.col,
    action,
    reason,
    grid
  }
}
function cellFactory(value, candidates, block, row, col) {
  return {
    value: value? value: "",
    block, 
    row, 
    col, 
    candidates: value? [value]: candidates.length? candidates: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    is: (c) => c.block === block && c.row === row && c.col === col
  };
}

function flatten(out, array) {
  return out.concat(array);
}
function uniqueOnAVector(newGrid, cell, index, vector, prop, addLog) {
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
        // addLog(cell, `Assigned ${candidate}`, `${prop} ${cell[prop] + 1} only contains candidate ${candidate} in this cell`);
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

function dropCandidate(grid, cell, candidate, addLog) {
  const cellIndex = cell.block * 9 + (cell.row % 3) * 3 + (cell.col % 3);
  const existingCandidates = cell.candidates;
  const newCandidates = without(existingCandidates, candidate);
  if(existingCandidates.length !== newCandidates.length) {
    addLog(cell, `Removed candidate ${candidate}`)
  }
  grid[cellIndex] = cellFactory(
    cell.value,
    newCandidates,
    cell.block,
    cell.row,
    cell.col
  );
}

function row(grid, index) {
  return grid.filter((cell) => cell.row === index );
}
function col(grid, index) {
  return grid.filter((cell) => cell.col === index );
}
function block(grid, index) {
  return grid.filter((cell) => cell.block === index );
}
function without(array, v) {
  return array.filter(value => v !== value);
}
function unique(v, i, a) {
  return a.indexOf(v) === i;
}
function unsolved(cell) {
  return cell.candidates.length > 1;
}
function firstCellsInBlock(vector) {
  return vector
    .filter((c, _, v) => c === v.filter(bc => bc.block === c.block)[0]);
}
function candidatesOnVector(vector) {
  return vector
    .filter(unsolved) 
    .map(cell => cell.candidates)
    .reduce(flatten, [])
    .filter(unique);
}
function solver(grid, steps, actions, setLog) {
  const log = actions.slice();
  if (steps < 1) return grid;
  const addLog = (cell, action, reason) => log.push(logEntry(cell, action, reason, newGrid));
  // any single candidates?
  let newGrid = grid.slice();
  newGrid = newGrid.map(cell => {
    if (!cell.value && cell.candidates.length === 1) {
      addLog(cell, `Assigned ${cell.candidates[0]}`, "Last remaining candidate for cell");
      return cellFactory(
        cell.candidates[0],
        [cell.candidates[0]],
        cell.block, 
        cell.row, 
        cell.col
      );
    } else {
      return cellFactory(
        cell.value,
        cell.candidates,
        cell.block,
        cell.row, 
        cell.col
      );
    }
  });
  // elim candidates in row 
  newGrid.forEach((cell, index) => {
    [[row, "row"], [col, "col"], [block, "block"]].map(([f, p]) => 
      f(newGrid, cell[p]).forEach(other => eliminateCandidates(other, newGrid, cell, (cell, action) => addLog(cell, action, `Candidate was assigned elsewhere on ${p}`))))
    uniqueOnAVector(newGrid, cell, index, row, 'row', addLog) &&
    uniqueOnAVector(newGrid, cell, index, col, 'col', addLog) &&
    uniqueOnAVector(newGrid, cell, index, block, 'block', addLog);
  });
  // TODO: Can this be expanded to three (triples)
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
  setLog(log);
  return newGrid;
}

function defaultGrid() {
  const grid = [];
  for(let block = 0; block < 9; block++) {
    for(let row = 0; row < 3; row++) {
      for(let col=0; col < 3; col++) {
        grid.push(cellFactory(
          0,
          [1, 2, 3, 4, 5, 6, 7, 8, 9],
          block,
          Math.floor(block / 3) * 3 + row, 
          (block % 3) * 3 + col));
      }
    }
  }
  return grid;
}
function expertPuzzle() {
  const blocksInOrder = (a, b) => {
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
      debugger;
      return 0;
    }
  }
  const template = [
    [0, 0, 5, 0, 8, 0, 3, 0, 2],
    [4, 2, 0, 0, 0, 0, 5, 0, 0],
    [6, 0, 0, 0, 0, 4, 0, 0, 0],
    [0, 0, 0, 3, 0, 0, 9, 0, 0],
    [3, 0, 0, 0, 2, 6, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 7, 0],
    [0, 0, 0, 0, 7, 0, 6, 8, 0],
    [0, 9, 8, 0, 0, 0, 0, 0, 4],
    [0, 0, 0, 5, 0, 0, 0, 0, 0]
  ];
  return template.map((cols, row) => cols.map((val, col) => {
    const block = Math.floor(row / 3) * 3 + Math.floor(col / 3);
    return cellFactory(val, [1, 2, 3, 4, 5, 6, 7, 8, 9], block, row, col);
  })).reduce(flatten, []).sort(blocksInOrder);
}
function hardPuzzle() {
  const blocksInOrder = (a, b) => {
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
      debugger;
      return 0;
    }
  }
  const template = [
    [7, 4, 0, 0, 0, 0, 0, 0, 2],
    [6, 5, 0, 1, 3, 2, 0, 0, 9],
    [0, 0, 0, 0, 0, 4, 0, 0, 0],
    [0, 0, 5, 0, 0, 0, 7, 0, 0],
    [9, 0, 2, 8, 0, 1, 0, 0, 0],
    [0, 0, 7, 0, 0, 0, 0, 0, 1],
    [0, 2, 0, 9, 1, 5, 0, 0, 0],
    [0, 8, 0, 0, 2, 0, 0, 1, 0],
    [1, 0, 0, 0, 0, 3, 0, 5, 0]
  ];
  return template.map((cols, row) => cols.map((val, col) => {
    const block = Math.floor(row / 3) * 3 + Math.floor(col / 3);
    return cellFactory(val, [1, 2, 3, 4, 5, 6, 7, 8, 9], block, row, col);
  })).reduce(flatten, []).sort(blocksInOrder);
}
function Cell({ value, candidates, block, row, col, onChange, onFocus, data, era }) {
  const classes = {
    1: "white",
    2: "green",
    3: "yellow",
    4: "white",
    5: "white",
    6: "white",
    7: "white",
    8: "white",
    9: "white",
    0: "red"
  }
  return <div className={classes[candidates.length] + " cell"}><input value={value} onChange={onChange} onFocus={onFocus} /></div>
}
function Block({ number, grid, setGrid, setCell }) {
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
          value? parseInt(value, 10): null,
          value? [value]: [1, 2, 3, 4, 5, 6, 7, 8, 9],
          cell.block,
          cell.row,
          cell.col
        );
        if(value !== cell.value) setGrid(newGrid);
      }
      cols.push(<Cell key={`${cell.block}-${cell.row}-${cell.col}`} data={cell} value={cell.value} candidates={cell.candidates} block={number} row={row} col={col} onChange={f} onFocus={() => setCell(cell)} />)
    }
    rows.push(cols);
  }
  return <div className="grid">{rows}</div>;
}

function Board({grid, setGrid, setCell}) {
  const blocks = [];
  for (let i = 0; i < 9; i++) {
    blocks.push(<Block key={i} number={i} grid={grid} setGrid={setGrid} setCell={setCell} />);
  }
  return <div className="grid">{blocks}</div>
}

function CellInspector({grid, cell, setGrid, setCell }) {
  const toggleCandidate = (cell, candidate) => {
    const newGrid = grid.slice().map(newCell => {
      if (newCell === cell) {
        const candidates = cell.candidates;
        if(candidates.includes(candidate)) {
          return cellFactory(cell.value, without(candidates, candidate), cell.block, cell.row, cell.col);
        } else {
          return cellFactory(cell.value, candidates.concat(candidate), cell.block, cell.row, cell.col);
        }
      } else {
        return newCell
      }
    });
    const newCell = newGrid.filter(newCell => cell.is(newCell))[0];
    setGrid(newGrid);
    setCell(newCell);
  }
  const index = grid.indexOf(cell);
  return index > -1 && cell? (<>
    <h2>Cell Row {cell.row + 1} Col {cell.col + 1} Block {cell.block + 1} Index {index}</h2>
    <div className="grid">{[1,2,3,4,5,6,7,8,9].map(candidate => {
      return <div key={candidate}>
        <label><input type="checkbox" checked={cell.candidates.includes(candidate)} onChange={() => toggleCandidate(cell, candidate)} />{candidate}</label>
      </div>
    })}</div>
  </>): null;
}

function App() {
  const [grid, setGrid] = useState(expertPuzzle())
  const [cell, setCell] = useState(null);
  const [log, setLog] = useState([]);
  return (
    <div className="App">
      <header className="App-header">
        Sudoku Solver
      </header>
      <Board grid={grid} setGrid={setGrid} setCell={setCell} log={log} setLog={setLog} />
      <CellInspector grid={grid} setGrid={setGrid} cell={cell} setCell={setCell} log={log} setLog={setLog} />
      <div className="actions">
        <button onClick={() => { setLog([]); }}>Clear Log</button>
        <button onClick={() => { setLog([]); setGrid(hardPuzzle()) }}>Hard Puzzle</button>
        <button onClick={() => { setLog([]); setGrid(expertPuzzle()) }}>Expert Puzzle</button>
        <button onClick={() => { setLog([]); setGrid(defaultGrid()) }}>Blank Puzzle</button>
        <button onClick={() => { setGrid(solver(grid, 1, log, setLog)) }}>Next Step (Hint)</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Row</th>
            <th>Col</th>
            <th>Action</th>
            <th>Reason</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {log.map((event, i) => <tr key={i}>
            <td>{event.row + 1}</td>
            <td>{event.col + 1}</td>
            <td>{event.action}</td>
            <td>{event.reason}</td>
            <td><button onClick={() => setGrid(event.grid)}>Restore</button></td>
          </tr>)}
        </tbody>
      </table>
    </div>
  );
}

export default App;
