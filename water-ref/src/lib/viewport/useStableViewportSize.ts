// @ts-nocheck
import { useEffect, useState } from "react";
import { getStableViewportSize, subscribeStableViewport } from "./stableViewport";

export function useStableViewportSize() {
  const [size, setSize] = useState(() => getStableViewportSize());

  useEffect(() => subscribeStableViewport(setSize), []);

  return size;
}
