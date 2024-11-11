"use client";

import { useEffect, useRef } from "react";

interface OptionSelectorProps<T extends string | number> {
  title: string;
  options: T[];
  selected: T;
  onChange: (value: T) => void;
  formatOption?: (option: T) => string;
}

export function OptionSelector<T extends string | number>({
  title,
  options,
  selected,
  onChange,
  formatOption = (option) => `${option}`,
}: OptionSelectorProps<T>) {
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
          {options.map((option) => (
            <button
              key={option}
              ref={option === selected ? selectedRef : null}
              onClick={() => onChange(option)}
              className={`relative rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                option === selected
                  ? "text-white"
                  : "text-white/80 hover:text-white"
              }`}
            >
              {formatOption(option)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
