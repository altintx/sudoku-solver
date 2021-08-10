export default function soleCandidates ({ grid, addLog, cellFactory }) {
  return grid.map(cell => {
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
}