export function Cell({ value, candidates, onChange, onFocus, }) {
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
  };
  return <div className={classes[candidates.length] + " cell"}><input value={value} onChange={onChange} onFocus={onFocus} /></div>;
}
