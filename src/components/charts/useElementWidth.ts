"use client";

import { useCallback, useRef, useState } from "react";

/** Callback-ref based width tracking: no effect, no setState-in-effect. */
export function useElementWidth(initial = 640) {
  const [width, setWidth] = useState(initial);
  const obs = useRef<ResizeObserver | null>(null);
  const ref = useCallback(
    (node: HTMLElement | null) => {
      obs.current?.disconnect();
      obs.current = null;
      if (!node) return;
      setWidth(Math.round(node.getBoundingClientRect().width) || initial);
      const ro = new ResizeObserver((entries) => {
        const w = Math.round(entries[0].contentRect.width);
        if (w > 0) setWidth(w);
      });
      ro.observe(node);
      obs.current = ro;
    },
    [initial],
  );
  return [ref, width] as const;
}
