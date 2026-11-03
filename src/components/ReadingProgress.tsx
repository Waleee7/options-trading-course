"use client";

import { useEffect, useRef } from "react";

/** Thin amber bar under the header that fills as you read. Updates a ref, not React state. */
export default function ReadingProgress() {
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, el.scrollTop / max)) : 0;
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div className="pointer-events-none fixed left-0 right-0 top-12 z-30 h-[3px] bg-transparent" role="presentation">
      <div ref={bar} className="h-full origin-left bg-accent" style={{ transform: "scaleX(0)", transition: "transform 80ms linear" }} />
    </div>
  );
}
