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
    <div className="flex flex-col items-center gap-3">
      <span className="text-sm text-[var(--muted)]">{title}</span>
      <div className="flex flex-col items-center gap-3">
        <div
          ref={containerRef}
          className="relative inline-flex rounded-lg bg-black/5 p-1"
        >
          <div
            ref={highlightRef}
            className="absolute top-1 h-[calc(100%-8px)] rounded-md bg-[var(--accent)] transition-all duration-200"
          />
          {[...options, "custom" as const].map((option) => (
            <button
              key={option}
              ref={selected === option ? selectedRef : undefined}
              className={`relative z-10 rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                selected === option
                  ? "text-white"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
              onClick={() => onChange(option)}
            >
              {option === "custom" ? "Custom" : `${option}x`}
            </button>
          ))}
        </div>
        {selected === "custom" && onCustomValueChange && (
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={10}
              step={0.1}
              value={customValue}
              onChange={(e) =>
                onCustomValueChange(parseFloat(e.target.value) || 1)
              }
              className="w-20 rounded-lg border border-[var(--muted)] bg-black/5 px-3 py-1.5 text-sm text-[var(--foreground)] outline-none transition-colors focus:border-[var(--accent)]"
            />
            <span className="text-sm text-[var(--muted)]">x</span>
          </div>
        )}
      </div>
    </div>
  );
}
