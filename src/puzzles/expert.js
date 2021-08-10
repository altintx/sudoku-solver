export default function expertPuzzle ({ cellFactory, gridSort, flatten }) {
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
    })).reduce(flatten, []).sort(gridSort); 
}