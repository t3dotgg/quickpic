import { useEffect, useMemo, useRef } from "react";

// inspired by Radix UI: https://github.com/radix-ui/primitives/blob/main/packages/react/use-callback-ref/src/use-callback-ref.tsx
// converts a callback function into a stable reference that avoids triggering re-renders or re-running effects/re-registering event listeners
export function useCallbackRef<
  T extends (...args: Parameters<T>) => ReturnType<T>,
>(callback?: T): T {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  });

  return useMemo(() => ((...args) => callbackRef.current?.(...args)) as T, []);
}
