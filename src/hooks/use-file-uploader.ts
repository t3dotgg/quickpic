import { useClipboardPaste } from "./use-clipboard-paste";
import { useProcessFile } from "./use-process-file";

import { type ChangeEvent } from "react";
import { type FileTypeString } from "@/lib/file-utils";

export type FileUploaderResult = {
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
  /** Handler for file input change events */
  handleFileUpload: (file: File) => void;
  handleFileUploadEvent: (event: ChangeEvent<HTMLInputElement>) => void;
  /** Resets the upload state */
  cancel: () => void;
};

type FileUploaderOptions = {
  accept?: FileTypeString | FileTypeString[];
  onError?: (error: string) => void;
};

/**
 * A hook for handling file uploads, particularly images and SVGs
 * @returns {FileUploaderResult} An object containing:
 * - imageContent: Use this as the src for an img tag
 * - rawContent: The raw file content as a string (useful for SVG tags)
 * - imageMetadata: Width, height, and name of the image
 * - handleFileUpload: Function to handle file input change events
 * - cancel: Function to reset the upload state
 */
export const useFileUploader = ({
  accept,
  onError,
}: FileUploaderOptions = {}): FileUploaderResult => {
  const { imageContent, rawContent, imageMetadata, processFile, cancel } =
    useProcessFile({ onError });

  const acceptedFileTypes: FileTypeString[] = accept
    ? Array.isArray(accept)
      ? accept
      : [accept]
    : ["image/*", ".jpg", ".jpeg", ".png", ".webp", ".svg"];

  const handleFileUpload = (file: File) => {
    void processFile(file);
  };

  const handleFileUploadEvent = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      void processFile(file);
    }
  };

  const handleFilePaste = (file: File) => {
    void processFile(file);
  };

  useClipboardPaste({
    acceptedFileTypes,
    onError,
    onPaste: handleFilePaste,
  });

  return {
    imageContent,
    rawContent,
    imageMetadata,
    handleFileUpload,
    handleFileUploadEvent,
    cancel,
  };
};
