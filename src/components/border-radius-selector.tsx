import React, { useEffect, useRef } from "react";

import { Select } from "@/components/shared/select";

import { useMediaQuery } from "@/hooks/use-media-query";

type CustomValueChangeEventContext =
  | {
      e: React.KeyboardEvent<HTMLInputElement>;
      context: "keyboard";
    }
  | {
      e: React.MouseEvent<HTMLButtonElement, MouseEvent>;
      context: "button-up" | "button-down";
    };

interface BorderRadiusSelectorProps {
  customValue?: number | null;
  onChange: (value: number | "custom") => void;
  onCustomValueChange?: (value: number | null) => void;
  options: number[];
  selected: number | "custom";
  title: string;
}

export function BorderRadiusSelector({
  customValue,
  onChange,
  onCustomValueChange,
  options,
  selected,
  title,
}: BorderRadiusSelectorProps) {
  const isXsScreen = useMediaQuery("(max-width: 29rem)");
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const customValueInputRef = useRef<HTMLInputElement>(null);
  const customValueIncrementRef = useRef<HTMLButtonElement>(null);
  const customValueDecrementRef = useRef<HTMLButtonElement>(null);

  // handle basic validation on the change event
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawInput = e.target.value;

    // If the input is a valid number, set state (empty string should become null)
    if (/^(\d+\.?\d*|\.\d*)?$/.test(rawInput)) {
      onCustomValueChange?.(rawInput === "" ? null : parseFloat(rawInput));
    }
  };

  // but handle most of the validation on blur, which allows the user to clear the input
  // completely, so they can type anything—including values that begin with "0", like "0.25"
  const handleInputBlur = () => {
    // Empty input and invalid (NaN) input should cause the input to be reset to 1
    if (
      customValue === null ||
      customValue === undefined ||
      isNaN(customValue)
    ) {
      onCustomValueChange?.(1);
      return;
    }

    // Remove leading and trailing whitespace
    let normalizedValue = customValue.toString().trim();

    // Decimal values should always have a single leading zero
    if (normalizedValue.startsWith("."))
      normalizedValue = "0" + normalizedValue;

    // Decimal values should always have only one leading zero
    if (/^0+\d+$/.test(normalizedValue))
      normalizedValue = String(parseFloat(normalizedValue));

    // Decimal values should never have trailing zeroes
    if (normalizedValue.includes("."))
      normalizedValue = parseFloat(normalizedValue).toString();

    // Values of 0 should be normalized to 1, while still allowing values arbitrarily close to 0
    if (normalizedValue === "0") normalizedValue = "1";

    // Values of 1000 and above should be normalized to 999, while still allowing values arbitrarily close to 1000
    if (+normalizedValue >= 1000) normalizedValue = "999";

    // Parse the normalized value as a number, clamp it to the range 0 < value < 1000, and set state
    const clampedValue = Math.min(
      1000 - Number.EPSILON,
      Math.max(Number.MIN_VALUE, parseFloat(normalizedValue)),
    );
    onCustomValueChange?.(clampedValue);
  };

  // a generalized handler for custom value changes which can operate in different contexts—keyboard/keydown
  // on the custom value input itself, or pointer/click on the custom value input's increment/decrement buttons
  const handleCustomValueStep = ({
    e,
    context,
  }: CustomValueChangeEventContext) => {
    if (context === "keyboard" && e.key !== "ArrowUp" && e.key !== "ArrowDown")
      return;

    e.preventDefault();
    const currentValue = customValue ?? 0.1;
    let step = 1;

    if (e.shiftKey) step = 10;
    if (e.altKey) step = 0.1;

    const newValue =
      (context === "keyboard" && e.key === "ArrowUp") || context === "button-up"
        ? (currentValue || 0) + step
        : (currentValue || 0) - step;

    const clampedValue = Math.min(
      e.altKey ? 999.9 : 999,
      Math.max(e.altKey ? 0.1 : 1, Number(newValue.toFixed(1))),
    );

    onCustomValueChange?.(clampedValue);
  };

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
            placeholder="Select radius…"
            options={[...options, "custom" as const]}
            selected={selected}
            onChange={onChange}
            formatOption={(option: number | "custom") =>
              option === "custom" ? "Custom" : `${option}px`
            }
            className="w-full min-w-0 flex-1 basis-1/2"
          />
        ) : (
          <div
            ref={containerRef}
            className="relative inline-flex rounded-lg bg-white/5 p-1"
          >
            <div
              ref={highlightRef}
              className="absolute inset-y-1 rounded-md bg-blue-600 transition-all duration-200"
            />
            {[...options, "custom" as const].map((option) => (
              <button
                key={String(option)}
                ref={option === selected ? selectedRef : null}
                onClick={() =>
                  onChange(typeof option === "number" ? option : "custom")
                }
                className={`option focus:ring-none relative rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none ${
                  option === selected
                    ? "text-white"
                    : "text-white/60 hover:text-white focus:bg-white/10"
                }`}
              >
                {option === "custom" ? "Custom" : option}
              </button>
            ))}
          </div>
        )}
        {selected === "custom" && (
          <div
            className={`${isXsScreen ? "w-full min-w-0 flex-1 basis-1/2" : "w-36"} flex items-center gap-2`}
          >
            <div className="group relative flex w-full items-center">
              <input
                ref={customValueInputRef}
                type="number"
                min="1"
                max="999"
                step="1"
                value={customValue === null ? "" : customValue}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                onKeyDown={(e) =>
                  handleCustomValueStep({ e, context: "keyboard" })
                }
                className="focus-visible:ring-offset-none h-10 w-full rounded-lg bg-white/5 px-3 py-2 pr-[50px] text-sm font-medium text-white/60 transition-colors duration-200 placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 disabled:cursor-not-allowed disabled:opacity-50 group-focus-within:text-white group-focus-within:ring-2 group-focus-within:ring-white/30 group-hover:text-white [&::-webkit-inner-spin-button]:opacity-0 [&::-webkit-inner-spin-button]:[-webkit-appearance:none] [&::-webkit-outer-spin-button]:opacity-0 [&::-webkit-outer-spin-button]:[-webkit-appearance:none]"
                placeholder="Enter radius"
              />
              <span className="absolute right-8 text-sm font-medium text-gray-500">
                px
              </span>
              <button
                ref={customValueIncrementRef}
                className="focus:ring-none absolute right-2 top-2 flex h-3 w-4 cursor-pointer items-center justify-center text-gray-500 transition-colors hover:text-white focus:rounded-sm focus:bg-white/10 focus:text-white focus:outline-none"
                onClick={(e) =>
                  handleCustomValueStep({ e, context: "button-up" })
                }
                onMouseLeave={() => {
                  // prevent increment/decrement buttons from retaining focus after click and even after mouseleave
                  if (
                    document.activeElement === customValueIncrementRef.current
                  ) {
                    customValueIncrementRef.current?.blur();
                    customValueInputRef.current?.focus();
                  }
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={16}
                  height={16}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m18 15-6-6-6 6" />
                </svg>
              </button>
              <button
                ref={customValueDecrementRef}
                className="focus:ring-none absolute bottom-2 right-2 flex h-3 w-4 cursor-pointer items-center justify-center text-gray-500 transition-colors hover:text-white focus:rounded-sm focus:bg-white/10 focus:text-white focus:outline-none"
                onClick={(e) =>
                  handleCustomValueStep({ e, context: "button-down" })
                }
                onMouseLeave={() => {
                  // prevent increment/decrement buttons from retaining focus after click and even after mouseleave
                  if (
                    document.activeElement === customValueDecrementRef.current
                  ) {
                    customValueDecrementRef.current?.blur();
                    customValueInputRef.current?.focus();
                  }
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={16}
                  height={16}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
