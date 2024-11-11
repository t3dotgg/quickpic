import React, { useRef, useEffect } from "react";

interface SVGScaleSelectorProps {
  title: string;
  options: number[];
  selected: number | "custom";
  onChange: (value: number | "custom") => void;
  customValue?: number;
  onCustomValueChange?: (value: number) => void;
}

export function SVGScaleSelector({
  title,
  options,
  selected,
  onChange,
  customValue,
  onCustomValueChange,
}: SVGScaleSelectorProps) {
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
  }, [selected]);

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-sm text-white/60">{title}</span>
      <div className="flex flex-col items-center gap-2">
        <div
          ref={containerRef}
          className="relative inline-flex rounded-lg bg-white/5 p-1"
        >
          <div
            ref={highlightRef}
            className="absolute top-1 h-[calc(100%-8px)] rounded-md bg-blue-600 transition-all duration-200"
          />
          {[...options, "custom" as const].map((option) => (
            <button
              key={String(option)}
              ref={option === selected ? selectedRef : null}
              onClick={() =>
                onChange(typeof option === "number" ? option : "custom")
              }
              className={`relative rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                option === selected
                  ? "text-white"
                  : "text-white/80 hover:text-white"
              }`}
            >
              {option === "custom" ? "Custom" : `${option}×`}
            </button>
          ))}
        </div>
        {selected === "custom" && (
          <input
            type="number"
            min="0"
            max="64"
            step="1"
            value={customValue}
            onChange={(e) => {
              const value = Math.min(64, parseFloat(e.target.value));
              onCustomValueChange?.(value);
            }}
            onKeyDown={(e) => {
              if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;

              e.preventDefault();
              const currentValue = customValue ?? 0;
              let step = 1;

              if (e.shiftKey) step = 10;
              if (e.altKey) step = 0.1;

              const newValue =
                e.key === "ArrowUp" ? currentValue + step : currentValue - step;

              const clampedValue = Math.min(
                64,
                Math.max(0, Number(newValue.toFixed(1))),
              );
              onCustomValueChange?.(clampedValue);
            }}
            className="w-24 rounded-lg bg-white/5 px-3 py-1.5 text-sm text-white"
            placeholder="Enter scale"
          />
        )}
      </div>
    </div>
  );
}
