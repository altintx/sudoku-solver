import React, { useRef } from 'react';
import { Popover, OverlayTrigger } from 'react-bootstrap';
import {CellInspector} from './CellInspector';

const popover = (grid, cell, setCell, setGrid) => (
  <Popover>
    <Popover.Header as="h3">Candidates</Popover.Header>
    <Popover.Body>
      <CellInspector grid={grid} setGrid={setGrid} cell={cell} setCell={setCell}/>
    </Popover.Body>
  </Popover>
);

export function Cell({ value, candidates, onChange, onFocus, cell, grid, setCell, setGrid, focusedCell }) {
  const classes = {
    1: "blue",
    2: "green",
    3: "yellow",
    4: "white",
    5: "white",
    6: "white",
    7: "white",
    8: "white",
    9: "white",
    0: "red"
  };
  if (focusedCell && cell.is(focusedCell)) {
    return <OverlayTrigger trigger="click" placement="right" overlay={popover(grid, cell, setCell, setGrid)} rootClose>
      <div className={classes[candidates.length] + " cell"}><input autoFocus value={value} onChange={onChange} onFocus={onFocus} onClick={({target}) => target.select()} /></div>
    </OverlayTrigger>
  } else {
    return (
      <div className={classes[candidates.length] + " cell"}><input value={value} onChange={onChange} onFocus={onFocus} onClick={({target}) => target.select()} /></div>
    )
  }
}
