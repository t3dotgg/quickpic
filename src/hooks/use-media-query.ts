import { useSyncExternalStore } from "react";

export function useMediaQuery(query: string) {
  const subscribe = (cb: () => void) => {
    const mediaQueryList = window.matchMedia(query);
    mediaQueryList.addEventListener("change", cb);
    return () => mediaQueryList.removeEventListener("change", cb);
  };

  const getSnapshot = () => window.matchMedia(query).matches;

  return useSyncExternalStore(subscribe, getSnapshot);
}
