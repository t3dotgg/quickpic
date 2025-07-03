import { useCallback, type ChangeEvent, useState, useEffect } from "react";
import { useClipboardPaste } from "./use-clipboard-paste";
import { useAsyncMemo } from "./use-async-memo";

const getImageDimensions = (
  blobUrl: string,
): Promise<{
  width: number;
  height: number;
}> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };
    img.src = blobUrl;
  });
};

export type FileUploaderResult = {
  /** Metadata about the uploaded image including dimensions and filename */
  imageMetadata: {
    width: number;
    height: number;
    name: string;
  } | null;
  /** The image content as a Blob object */
  imageBlob: Blob | null;
  /** That Blob's object URL (not the actual content, just a reference) */
  imageBlobUrl: string | null;
  /** Handler for file input change events */
  handleFileUpload: (file: File) => void;
  handleFileUploadEvent: (event: ChangeEvent<HTMLInputElement>) => void;
  /** Resets the upload state */
  cancel: () => void;
};

/**
 * A hook for handling file uploads, particularly images and SVGs
 * @returns {FileUploaderResult} An object containing:
 * - imageBlobUrl: Use this as the src for an img tag
 * - imageBlob: The raw file content as a Blob
 * - imageMetadata: Width, height, and name of the image
 * - handleFileUpload: Function to handle file input change events
 * - cancel: Function to reset the upload state
 */
export const useFileUploader = (): FileUploaderResult => {
  const [imageBlob, setImageBlob] = useState<File | null>(null);

  const { imageBlobUrl, imageMetadata } = useAsyncMemo(
    async () => {
      if (!imageBlob) return { imageBlobUrl: null, imageMetadata: null };
      const imageBlobUrl = URL.createObjectURL(imageBlob);
      const dimensions = await getImageDimensions(imageBlobUrl);
      return {
        imageBlobUrl,
        imageMetadata: { ...dimensions, name: imageBlob.name },
      };
    },
    [imageBlob],
    { imageBlobUrl: null, imageMetadata: null },
  );

  // Clean up blob URLs when switching blobs
  useEffect(
    () => () => {
      if (imageBlobUrl) URL.revokeObjectURL(imageBlobUrl);
    },
    [imageBlobUrl],
  );

  const handleFileUploadEvent = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageBlob(file);
    }
  };

  const handleFilePaste = useCallback((file: File) => {
    setImageBlob(file);
  }, []);

  useClipboardPaste({
    onPaste: handleFilePaste,
    acceptedFileTypes: ["image/*", ".jpg", ".jpeg", ".png", ".webp", ".svg"],
  });

  const cancel = () => {
    setImageBlob(null);
  };

  return {
    imageMetadata,
    imageBlob,
    imageBlobUrl,
    handleFileUpload: setImageBlob,
    handleFileUploadEvent,
    cancel,
  };
};
