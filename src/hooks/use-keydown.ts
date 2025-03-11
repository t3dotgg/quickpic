import { useEffect, useMemo } from "react";
import { useCallbackRef } from "@/hooks/use-callback-ref";

type Key = "Enter" | "Escape" | "Space" | "ArrowDown" | "ArrowUp"; // Add more keys as needed
type ModifierKey = "Alt" | "Command" | "Control" | "Meta" | "Shift";
type EventCallback = (event: Event) => void;
type EventTarget = Window | Document | Element;

interface EventOptions {
  capture?: boolean;
  condition?: boolean;
  excludeModifiers?: ModifierKey[];
  modifiers?: ModifierKey[];
  preventDefault?: boolean;
  stopPropagation?: boolean;
  target?: EventTarget;
}

const modifiersMap = new Map<ModifierKey, string>([
  ["Alt", "altKey"],
  ["Command", "metaKey"],
  ["Control", "ctrlKey"],
  ["Meta", "metaKey"],
  ["Shift", "shiftKey"],
]);

export function useKeyDown(
  keys: Key | Key[],
  cb: EventCallback,
  options: EventOptions = {},
) {
  const {
    capture = true,
    condition = true,
    excludeModifiers = [],
    modifiers = [],
    preventDefault = false,
    stopPropagation = false,
    target = globalThis?.document,
  } = options;

  const keyList = useMemo(() => (Array.isArray(keys) ? keys : [keys]), [keys]);

  // inspired by Radix UI: https://github.com/radix-ui/primitives/blob/main/packages/react/use-escape-keydown/src/use-escape-keydown.tsx
  // provides a stable reference to the latest version of the callback function without re-registering event listeners
  const callbackRef = useCallbackRef(cb);

  useEffect(() => {
    if (condition === false) return;

    const handleKeyDown = (event: Event) => {
      const isKeyMatch = keyList.includes((event as KeyboardEvent).code as Key);
      const areModifiersPressed = modifiers.every(
        (m) =>
          (event as KeyboardEvent)[modifiersMap.get(m)! as keyof KeyboardEvent],
      );
      const areExcludedModifiersPressed = excludeModifiers.some(
        (m) =>
          (event as KeyboardEvent)[modifiersMap.get(m)! as keyof KeyboardEvent],
      );

      if (isKeyMatch && areModifiersPressed && !areExcludedModifiersPressed) {
        if (stopPropagation) event.stopPropagation();
        if (preventDefault) event.preventDefault();
        callbackRef(event as KeyboardEvent);
      }
    };

    target.addEventListener("keydown", handleKeyDown, { capture });

    return () =>
      target.removeEventListener("keydown", handleKeyDown, { capture });
  }, [
    callbackRef,
    capture,
    condition,
    excludeModifiers,
    keyList,
    modifiers,
    preventDefault,
    stopPropagation,
    target,
  ]);
}
