import { type DependencyList, useCallback, useEffect, useState } from "react";

export const useAsyncMemo = <T, L>(
  factory: () => Promise<T>,
  deps: DependencyList,
  loadingState: L,
  errorState?: (error: unknown) => L,
): T | L => {
  const [result, setResult] = useState<T | L>(loadingState);
  const defaultErrorState = useCallback(() => loadingState, [loadingState]);
  if (!errorState) errorState = defaultErrorState;

  useEffect(() => {
    setResult(loadingState);

    factory().then(
      (value) => {
        setResult(value);
      },
      (error) => {
        setResult(errorState(error));
      },
    );
  }, [factory, loadingState, errorState, deps]);

  return result;
};
