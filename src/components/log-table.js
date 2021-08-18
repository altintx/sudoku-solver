export default function logTable({ log, cell, grid, setGrid }) {
    return <table>
        <thead>
          <tr>
            {!grid.includes(cell) && (
              <><th>Row</th>
              <th>Col</th></>
            )}
            <th>Strategy</th>
            <th>Action</th>
            <th>Reason</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {grid.includes(cell) && log.filter(entry => entry.row === cell.row && entry.col === cell.col).map((event, i) => <tr key={i}>
            <td>{event.strategy}</td>
            <td>{event.action}</td>
            <td>{event.reason}</td>
            <td><button onClick={() => setGrid(event.grid)}>Restore</button></td>
          </tr>)}
          {!grid.includes(cell) && log.map((event, i) => <tr key={"row-header" + i}>
            <td>{event.row + 1}</td>
            <td>{event.col + 1}</td>
            <td>{event.strategy}</td>
            <td>{event.action}</td>
            <td>{event.reason}</td>
            <td><button onClick={() => setGrid(event.grid)}>Restore</button></td>
          </tr>)}

        </tbody>
      </table>
}