import type { ChangeEvent } from "react";

export function createFileChangeEvent(
  file: File,
): ChangeEvent<HTMLInputElement> {
  const target: Partial<HTMLInputElement> = {
    files: [file] as unknown as FileList,
    value: "",
    name: "",
    type: "file",
    accept: ".svg",
    multiple: false,
    webkitdirectory: false,
    className: "hidden",
  };

  return {
    target: target as HTMLInputElement,
    currentTarget: target as HTMLInputElement,
    preventDefault: () => {},
    stopPropagation: () => {},
    bubbles: true,
    cancelable: true,
    timeStamp: Date.now(),
    type: "change",
    nativeEvent: new Event("change"),
    isDefaultPrevented: () => false,
    isPropagationStopped: () => false,
    isTrusted: true,
    persist: () => {},
  } as ChangeEvent<HTMLInputElement>;
}
