import { useEffect, useState } from "react";

/** Reads the live column count back from CSS so breakpoints live in exactly one
 *  place (the --site--column-count media queries in styles.css). */
export function useColumnCount(): number {
  const [count, setCount] = useState(12);
  useEffect(() => {
    const read = () =>
      setCount(
        parseInt(
          getComputedStyle(document.documentElement).getPropertyValue(
            "--site--column-count",
          ),
          10,
        ) || 12,
      );
    read();
    window.addEventListener("resize", read);
    return () => window.removeEventListener("resize", read);
  }, []);
  return count;
}

/** The canonical dashed column grid (absolute, fills its positioned parent). */
export default function GridLines() {
  const count = useColumnCount();
  return (
    <div className="grid-lines" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="grid-lines_col" />
      ))}
    </div>
  );
}
