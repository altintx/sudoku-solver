import { row, col, block, without, eliminateCandidate } from '../App';
const numbersOneToNine = [1,2,3,4,5,6,7,8,9];
export default function hiddenUniqueStrategy({grid }) {
    grid.forEach(cell => {
        if(cell.value) return;
        [[block, "block"], [col, "col"], [row, "row"]].forEach(([getter, vectorName]) => {
            const vector = getter(grid, cell[vectorName]);
            cell.candidates.forEach(candidate => {
                const cells = vector.filter(cell => !cell.value && cell.candidates.includes(candidate));
                if(cells.length === 1) {
                    console.log("Found a hidden unique");
                    debugger;
                    const cell = cells[0];
                    const others = without(row(grid, cell.row), cell).concat(
                        without(block(grid, cell.block), cell),
                        without(col(grid, cell.grid))
                    );
                    others.forEach(cell => cell.candidates = without(cell.candidates, candidate));
                    cell.value = candidate;
                    cell.candidates = [candidate];
                }
                
            })
        })
    });
    return grid;
}