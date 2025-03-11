"use client";

import { useEffect, useCallback } from "react";

import { type FileTypeString, generateFileTypesString } from "@/lib/file-utils";

interface UseClipboardPasteProps {
  acceptedFileTypes: FileTypeString[];
  onError?: (error: string) => void;
  onPaste: (file: File) => void;
}

export function useClipboardPaste({
  acceptedFileTypes,
  onError,
  onPaste,
}: UseClipboardPasteProps) {
  const handlePaste = useCallback(
    async (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return;

      for (const item of Array.from(items)) {
        if (item.kind === "string") break;

        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (!file) continue;

          const isAcceptedType = acceptedFileTypes.some(
            (type) =>
              type === "image/*" ||
              type === item.type ||
              file.name.toLowerCase().endsWith(type.replace("*", "")),
          );

          const acceptedFileTypesString =
            generateFileTypesString(acceptedFileTypes);

          event.preventDefault();

          if (isAcceptedType) {
            onPaste(file);
            break;
          } else {
            if (onError)
              onError(
                `Pasted image has invalid type. Valid types are: ${acceptedFileTypesString}.`,
              );
            else
              alert(
                `Pasted image has invalid type. Valid types are: ${acceptedFileTypesString}.`,
              );
            break;
          }
        } else {
          if (onError)
            onError(
              `Pasted file is not an image. Please upload a valid image file.`,
            );
          else
            alert(
              `Pasted file is not an image. Please upload a valid image file.`,
            );
          break;
        }
      }
    },
    [acceptedFileTypes, onError, onPaste],
  );

  useEffect(() => {
    const handler = (event: ClipboardEvent) => {
      void handlePaste(event);
    };

    document.addEventListener("paste", handler);
    return () => document.removeEventListener("paste", handler);
  }, [handlePaste]);
}
