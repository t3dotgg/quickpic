import type { ChangeEvent } from "react";

// Create a no-op function that satisfies the linter
const noop = () => {
  /* intentionally empty */
};

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
    preventDefault: noop,
    stopPropagation: noop,
    bubbles: true,
    cancelable: true,
    timeStamp: Date.now(),
    type: "change",
    nativeEvent: new Event("change"),
    isDefaultPrevented: () => false,
    isPropagationStopped: () => false,
    isTrusted: true,
    persist: noop,
  } as ChangeEvent<HTMLInputElement>;
}

export function validateFileType(
  acceptedFileTypes: string[],
  currentFileType: string,
): {
  type: "IMAGE" | "SVG" | "UNKNOWN";
  isValid: boolean;
} {
  const supportsSVGs = acceptedFileTypes.some((type) => type.includes("svg"));

  const supportsImages = acceptedFileTypes
    .filter((type) => !type.includes("svg"))
    .some((type) => type.includes("image"));

  if ((supportsSVGs && supportsImages) || (supportsImages && !supportsSVGs)) {
    if (!currentFileType.includes("image")) {
      return {
        type: "IMAGE",
        isValid: false,
      };
    }

    return {
      type: "IMAGE",
      isValid: true,
    };
  }

  if (!supportsImages && supportsSVGs) {
    if (!currentFileType.includes("svg")) {
      return {
        type: "SVG",
        isValid: false,
      };
    }
    return {
      type: "SVG",
      isValid: true,
    };
  }

  return {
    type: "UNKNOWN",
    isValid: false,
  };
}
