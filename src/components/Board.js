import { Block } from "./Block";

export function Board({ grid, setGrid, setCell }) {
  const blocks = [];
  for (let i = 0; i < 9; i++) {
    blocks.push(<Block key={i} number={i} grid={grid} setGrid={setGrid} setCell={setCell} />);
  }
  return <div className="grid">{blocks}</div>;
}
