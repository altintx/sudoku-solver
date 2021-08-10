export default function logTable({ log, cell, setGrid }) {
    return <table>
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
}