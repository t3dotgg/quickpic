import { useState } from "react";
import {
  parseSvgFile,
  parseImageFile,
  readFileContent,
} from "@/lib/file-utils";

export type ProcessFileResult = {
  /** The processed image content as a data URL (for regular images) or object URL (for SVGs) */
  imageContent: string;
  /** The raw file content as a string */
  rawContent: string;
  /** Metadata about the uploaded image including dimensions and filename */
  imageMetadata: {
    width: number;
    height: number;
    name: string;
  } | null;
  /** Function that reads file content and sets the above three values */
  processFile: (file: File) => Promise<void>;
  cancel: () => void;
};

type ProcessFileOptions = {
  onError?: (error: string) => void;
};

/**
 * A hook for centralizing file (e.g. svg and raster images) processing logic
 * in a reusable form factor for use in other, more specialized hooks like
 * useFileUploader and useFileFetcher.
 * @param {ProcessFileOptions} [options] - Optional configuration object
 * @param {function(string): void} [options.onError] - Optional error handler
 * @returns {ProcessFileResult} An object cont                  aining:
 * - imageContent: Use this as the src for an img tag
 * - rawContent: The raw file content as a string (useful for SVG tags)
 * - imageMetadata: Width, height, and name of the image
 * - processFile: Function to process files and set the above three values
 * - cancel: Function to reset the upload state
 */
export function useProcessFile({
  onError,
}: ProcessFileOptions = {}): ProcessFileResult {
  const [imageContent, setImageContent] = useState<string>("");
  const [rawContent, setRawContent] = useState<string>("");
  const [imageMetadata, setImageMetadata] = useState<{
    width: number;
    height: number;
    name: string;
  } | null>(null);

  const processFile = async (file: File): Promise<void> => {
    try {
      const content = await readFileContent(file);
      setRawContent(content);

      if (file.type === "image/svg+xml") {
        const { content: parsedSvgContent, metadata } = parseSvgFile(
          content,
          file.name,
        );

        setImageContent(parsedSvgContent);
        setImageMetadata(metadata);
      } else {
        const { content: parsedImageContent, metadata } = await parseImageFile(
          content,
          file.name,
        );

        setImageContent(parsedImageContent);
        setImageMetadata(metadata);
      }
    } catch (error) {
      if (error instanceof Error) {
        if (onError) onError(error.message);
        else alert(error.message);
      }
    }
  };

  const cancel = () => {
    setImageContent("");
    setRawContent("");
    setImageMetadata(null);
  };

  return {
    imageContent,
    rawContent,
    imageMetadata,
    processFile,
    cancel,
  };
}
