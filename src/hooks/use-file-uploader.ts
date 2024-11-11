import { useCallback } from "react";
import { type ChangeEvent, useState } from "react";
import { useClipboardPaste } from "./use-clipboard-paste";

const parseSvgFile = (content: string, fileName: string) => {
  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(content, "image/svg+xml");
  const svgElement = svgDoc.documentElement;
  const width = parseInt(svgElement.getAttribute("width") ?? "300");
  const height = parseInt(svgElement.getAttribute("height") ?? "150");

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
};

const parseImageFile = (
  content: string,
  fileName: string,
): Promise<{
  content: string;
  metadata: { width: number; height: number; name: string };
}> => {
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
};

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

/**
 * A hook for handling file uploads, particularly images and SVGs
 * @returns {FileUploaderResult} An object containing:
 * - imageContent: Use this as the src for an img tag
 * - rawContent: The raw file content as a string (useful for SVG tags)
 * - imageMetadata: Width, height, and name of the image
 * - handleFileUpload: Function to handle file input change events
 * - cancel: Function to reset the upload state
 */
export const useFileUploader = (): FileUploaderResult => {
  const [imageContent, setImageContent] = useState<string>("");
  const [rawContent, setRawContent] = useState<string>("");
  const [imageMetadata, setImageMetadata] = useState<{
    width: number;
    height: number;
    name: string;
  } | null>(null);

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      setRawContent(content);

      if (file.type === "image/svg+xml") {
        const { content: svgContent, metadata } = parseSvgFile(
          content,
          file.name,
        );
        setImageContent(svgContent);
        setImageMetadata(metadata);
      } else {
        const { content: imgContent, metadata } = await parseImageFile(
          content,
          file.name,
        );
        setImageContent(imgContent);
        setImageMetadata(metadata);
      }
    };

    if (file.type === "image/svg+xml") {
      reader.readAsText(file);
    } else {
      reader.readAsDataURL(file);
    }
  };

  const handleFileUploadEvent = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleFilePaste = useCallback((file: File) => {
    processFile(file);
  }, []);

  useClipboardPaste({
    onPaste: handleFilePaste,
    acceptedFileTypes: ["image/*", ".jpg", ".jpeg", ".png", ".webp", ".svg"],
  });

  const cancel = () => {
    setImageContent("");
    setImageMetadata(null);
  };

  return {
    imageContent,
    rawContent,
    imageMetadata,
    handleFileUpload: processFile,
    handleFileUploadEvent,
    cancel,
  };
};
