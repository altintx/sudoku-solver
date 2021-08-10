export default function hardPuzzle({ gridSort, cellFactory, flatten }) {
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
    })).reduce(flatten, []).sort(gridSort);
  }