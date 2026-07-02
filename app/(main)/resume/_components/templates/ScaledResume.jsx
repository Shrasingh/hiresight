"use client";

import React, { useLayoutEffect, useRef, useState } from "react";
import { A4_WIDTH, A4_MIN_HEIGHT } from "./frame";

/**
 * Renders a fixed-width A4 template scaled down to fit its container.
 * The inner element keeps its true 794px width (so PDF capture and layout are
 * pixel-identical); only a GPU-accelerated CSS transform scales the visual.
 */
function ScaledResume({ scale, children, className = "" }) {
  const innerRef = useRef(null);
  const [height, setHeight] = useState(A4_MIN_HEIGHT);

  useLayoutEffect(() => {
    if (innerRef.current) {
      setHeight(innerRef.current.offsetHeight || A4_MIN_HEIGHT);
    }
  });

  return (
    <div
      className={className}
      style={{
        width: A4_WIDTH * scale,
        height: height * scale,
        overflow: "hidden",
      }}
    >
      <div
        ref={innerRef}
        style={{
          width: A4_WIDTH,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          willChange: "transform",
        }}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * Responsive wrapper that fits the A4 template to the available width
 * (never upscales past 1×). Centers the scaled sheet.
 */
export function ResponsiveResume({ children, maxScale = 1, className = "" }) {
  const boxRef = useRef(null);
  const [scale, setScale] = useState(0.5);

  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth;
      setScale(Math.min(maxScale, w / A4_WIDTH));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [maxScale]);

  return (
    <div ref={boxRef} className={`flex justify-center ${className}`}>
      <ScaledResume scale={scale}>{children}</ScaledResume>
    </div>
  );
}

export default ScaledResume;
