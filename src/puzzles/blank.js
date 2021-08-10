export default function blankPuzzle(cellFactory) {
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
  