"use client";

import { useEffect, useRef } from "react";

import { Select } from "@/components/shared/select";

import { useMediaQuery } from "@/hooks/use-media-query";

interface OptionSelectorProps<T extends string | number> {
  className?: string;
  formatOption?: (option: T) => string;
  onChange: (value: T) => void;
  options: T[];
  selected: T;
  title: string;
}

export function OptionSelector<T extends string | number>({
  className,
  formatOption = (option) => `${option}`,
  onChange,
  options,
  selected,
  title,
}: OptionSelectorProps<T>) {
  const isXsScreen = useMediaQuery("(max-width: 29rem)");
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedRef.current || !highlightRef.current || !containerRef.current)
      return;

    // prevent layout thrashing
    requestAnimationFrame(() => {
      const container = containerRef.current!;
      const selected = selectedRef.current!;
      const highlight = highlightRef.current!;

      const containerRect = container.getBoundingClientRect();
      const selectedRect = selected.getBoundingClientRect();

      highlight.style.left = `${selectedRect.left - containerRect.left}px`;
      highlight.style.width = `${selectedRect.width}px`;
    });

    // though isXsScreen is not a real dependency, the selected scale option must
    // be re-rerendered when it changes, because otherwise the highlight will be
    // missing/not calculated when the user resizes the window and the scale selector
    // switches between its two different display modes
  }, [selected, isXsScreen]);

  return (
    <div
      className={`${isXsScreen ? "w-full" : ""} flex flex-col items-center gap-2`}
    >
      <span className="text-sm text-white/60">{title}</span>
      <div
        className={`flex ${isXsScreen ? "w-full flex-row" : "flex-col"} items-center justify-center gap-2`}
      >
        {isXsScreen ? (
          <Select
            options={options}
            selected={selected}
            onChange={onChange}
            formatOption={formatOption}
            className={className}
          />
        ) : (
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
                className={`option focus:ring-none relative rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none ${
                  option === selected
                    ? "text-white"
                    : "text-white/60 hover:text-white focus:bg-white/10"
                }`}
              >
                {formatOption(option)}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
