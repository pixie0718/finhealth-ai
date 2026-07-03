import React, { useEffect, useRef, useState } from "react";

// Counts from 0 → end (once) when scrolled into view.
export default function CountUp({ end, duration = 1500, decimals = 0, prefix = "", suffix = "", separator = false, style }) {
  const ref = useRef(null);
  const started = useRef(false);
  const [val, setVal] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting && !started.current) {
          started.current = true;
          const t0 = performance.now();
          const tick = (now) => {
            const t = Math.min(1, (now - t0) / duration);
            const eased = 1 - Math.pow(1 - t, 3);
            setVal(end * eased);
            if (t < 1) requestAnimationFrame(tick); else setVal(end);
          };
          requestAnimationFrame(tick);
          io.disconnect();
        }
      }),
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [end, duration]);

  const shown = separator
    ? Math.round(val).toLocaleString("en-IN")
    : val.toFixed(decimals);

  return <span ref={ref} style={style}>{prefix}{shown}{suffix}</span>;
}
