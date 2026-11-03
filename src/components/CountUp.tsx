"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const subscribe = (cb: () => void) => {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const getReduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Counts from zero to `value` once. Shows the final value immediately under reduced motion or without JS. */
export default function CountUp({ value, decimals = 0, prefix = "", suffix = "", duration = 1000 }: { value: number; decimals?: number; prefix?: string; suffix?: string; duration?: number }) {
  const reduced = useSyncExternalStore(subscribe, getReduced, () => false);
  const [shown, setShown] = useState(value);
  const raf = useRef(0);

  useEffect(() => {
    if (reduced) return;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(value * eased);
      if (t < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [value, duration, reduced]);

  const v = reduced ? value : shown;
  const text = Math.abs(v).toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return (
    <span>
      {v < 0 ? "−" : ""}
      {prefix}
      {text}
      {suffix}
    </span>
  );
}
