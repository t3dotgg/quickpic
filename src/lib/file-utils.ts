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

type FileTypeValidationResult =
  | {
      isValid: true;
    }
  | {
      isValid: false;
      error: string;
    };

export function validateFileType({
  acceptedFileTypes,
  file,
}: {
  acceptedFileTypes: string[];
  file: File;
}): FileTypeValidationResult {
  const fileExtension = file.name.split(".").pop()?.toLowerCase() ?? "";

  // Common list of image formats to check against for image files except for SVGs
  const commonImageFormats = [
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".gif",
    ".bmp",
    ".tiff",
    ".ico",
    ".apng",
    ".heif",
    ".heic",
    ".raw",
    ".jfif",
  ];

  // Check to see if `acceptedFileTypes` accepts SVGs
  const isSvgSupported = acceptedFileTypes.some((type) => type.includes("svg"));

  /* 
  Check to see if `acceptedFileTypes` accepts any type of images to specify the type of validation
    1. Checks for file extensions passed to `acceptedFileTypes`
    2. Checks for file mimes passed to `acceptedFileTypes`
  */
  const isImageSupported =
    acceptedFileTypes.some((type) => commonImageFormats.includes(type)) ||
    acceptedFileTypes
      .filter((type) => !type.includes("svg"))
      .some((type) => type.includes("image"));

  if (
    (isSvgSupported && isImageSupported) ||
    (isImageSupported && !isSvgSupported)
  ) {
    /*
     If `acceptedFileTypes` is using an `image/*` wildcard, simply validate the file type if it 
     includes the mime of `image/` since any type of image is supported.
    */

    if (
      acceptedFileTypes.includes("image/*") &&
      !file.type.includes("image/")
    ) {
      return {
        isValid: false,
        error: "Only Images are supported.",
      };
    }

    /* 
      If `acceptedFileTypes` does not have `image/*` wildcard and is using file extensions, then
      use the file extension instead and match `acceptedFileTypes`. This can be useful for 
      validating very specific file types like `.png` formats only if set correctly in `acceptedFileTypes`
    */

    if (
      !acceptedFileTypes.some((type) =>
        type.replace("image/", ".").includes(fileExtension),
      )
    ) {
      /*
        Filters and cleans out duplicate file extensions, in case `acceptedFileTypes` uses only specific mimes,
        specific extensions or both. In the case of using both for example `image/png` and `.png`, it would create
        duplicates so we remove them.
      */
      const filteredAcceptedFileTypes = [
        ...new Set(
          acceptedFileTypes
            .filter((type) => !type.includes("*")) // filters out wildcards
            .map((type) =>
              type.includes("/") ? `.${type.split("/")[1]}` : type,
            ),
        ),
      ];

      return {
        isValid: false,
        error: `Only ${filteredAcceptedFileTypes.join(", ")} files are supported.`,
      };
    }

    return {
      isValid: true,
    };
  }

  if (!isImageSupported && isSvgSupported) {
    /* 
      Since all SVG types are esentially the same, after checking that only SVG are accepted using `isSvgSupported`,
      simply check if the file type or extension has anything with svg in it. 
    */

    if (!file.type.includes("svg") || !fileExtension?.includes("svg")) {
      return {
        isValid: false,
        error: "Only SVGs are supported.",
      };
    }

    return {
      isValid: true,
    };
  }

  // In case of passing an invalid `acceptedFileTypes`, we throw an error
  throw new Error("Invalid acceptedFileTypes");
}
