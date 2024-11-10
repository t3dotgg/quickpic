"use client";

import { useEffect, useRef } from "react";
import type { Scale } from "../svg-tool";

interface AnimatedScaleSelectorProps {
  scales: Scale[];
  selectedScale: Scale;
  onChange: (scale: Scale) => void;
}

export function AnimatedScaleSelector({
  scales,
  selectedScale,
  onChange,
}: AnimatedScaleSelectorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedRef.current && highlightRef.current && containerRef.current) {
      const container = containerRef.current;
      const selected = selectedRef.current;
      const highlight = highlightRef.current;

      const containerRect = container.getBoundingClientRect();
      const selectedRect = selected.getBoundingClientRect();

      highlight.style.left = `${selectedRect.left - containerRect.left}px`;
      highlight.style.width = `${selectedRect.width}px`;
    }
  }, [selectedScale]);

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-sm text-white/60">Scale Factor</span>
      <div
        ref={containerRef}
        className="relative inline-flex rounded-lg bg-white/5 p-1"
      >
        <div
          ref={highlightRef}
          className="absolute top-1 h-[calc(100%-8px)] rounded-md bg-blue-600 transition-all duration-200"
        />
        {scales.map((value) => (
          <button
            key={value}
            ref={value === selectedScale ? selectedRef : null}
            onClick={() => onChange(value)}
            className={`relative rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              value === selectedScale
                ? "text-white"
                : "text-white/80 hover:text-white"
            }`}
          >
            {value}×
          </button>
        ))}
      </div>
    </div>
  );
}
