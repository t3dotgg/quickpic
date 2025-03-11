import type { ChangeEvent } from "react";

import type { FileUploaderResult } from "@/hooks/use-file-uploader";
import type { FileFetcherResult } from "@/hooks/use-file-fetcher";

export type ImageMetadata =
  | FileUploaderResult["imageMetadata"]
  | FileFetcherResult["imageMetadata"];

export type FileType = "Image (any type)" | "JPG" | "PNG" | "WEBP" | "SVG";
export type FileTypeString =
  | "image/*"
  | "image/jpeg"
  | ".jpg"
  | ".jpeg"
  | "image/png"
  | ".png"
  | "image/webp"
  | ".webp"
  | "image/svg+xml"
  | ".svg";

// Mapping of file extensions and MIME types to human-readable file types
export const allFileTypes: { type: FileTypeString; group: FileType }[] = [
  { type: "image/*", group: "Image (any type)" },
  { type: ".jpeg", group: "JPG" },
  { type: ".jpg", group: "JPG" },
  { type: "image/jpeg", group: "JPG" },
  { type: ".png", group: "PNG" },
  { type: "image/png", group: "PNG" },
  { type: ".webp", group: "WEBP" },
  { type: "image/webp", group: "WEBP" },
  { type: ".svg", group: "SVG" },
  { type: "image/svg+xml", group: "SVG" },
] as const;

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

export function parseImageFile(
  content: string,
  fileName: string,
): Promise<{
  content: string;
  metadata: { width: number; height: number; name: string };
}> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        content,
        metadata: {
          width: img.width,
          height: img.height,
          name: fileName,
        },
      });
    };
    img.src = content;
  });
}

export function parseSvgFile(content: string, fileName: string) {
  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(content, "image/svg+xml");
  const svgElement = svgDoc.documentElement;
  const viewBox = svgElement.getAttribute("viewBox");
  let width = parseInt(svgElement.getAttribute("width") ?? "");
  let height = parseInt(svgElement.getAttribute("height") ?? "");

  // If width and height are not expliclitly defined, try to extract them from the viewBox attribute
  if ((!width || !height) && viewBox) {
    const viewBoxValues = viewBox.split(" ").map(parseFloat);
    if (viewBoxValues.length === 4) {
      width = viewBoxValues[2]!;
      height = viewBoxValues[3]!;
    }
  }

  if (isNaN(width) || isNaN(height))
    throw new TypeError("Unable to parse SVG. File may be corrupted.");

  // Convert SVG content to a data URL
  const svgBlob = new Blob([content], { type: "image/svg+xml" });
  const svgUrl = URL.createObjectURL(svgBlob);

  return {
    content: svgUrl,
    metadata: {
      width,
      height,
      name: fileName,
    },
  };
}

export function readFileContent(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      if (!e.target?.result) {
        reject(new Error("Unable to read file"));
      } else {
        resolve(e.target.result as string);
      }
    };

    if (file.type === "image/svg+xml") {
      reader.readAsText(file);
    } else {
      reader.readAsDataURL(file);
    }
  });
}

/**
 * Given a list of accepted file extensions and/or MIME types, generates
 * a human-readable string of accepted file types for display purposes.
 */
export function generateFileTypesString(accepted: FileTypeString[]) {
  return [
    ...new Set(
      accepted.map(
        (acceptedType) =>
          allFileTypes.find(({ type }) => type === acceptedType)!.group,
      ),
    ),
  ].join(", ");
}
