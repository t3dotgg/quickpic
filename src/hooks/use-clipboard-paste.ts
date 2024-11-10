"use client";

import { useEffect, useCallback } from "react";

interface UseClipboardPasteProps {
  onPaste: (file: File) => void;
  acceptedFileTypes: string[];
}

export function useClipboardPaste({
  onPaste,
  acceptedFileTypes,
}: UseClipboardPasteProps) {
  const handlePaste = useCallback(
    async (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return;

      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (!file) continue;

          const isAcceptedType = acceptedFileTypes.some(
            (type) =>
              type === "image/*" ||
              type === item.type ||
              file.name.toLowerCase().endsWith(type.replace("*", "")),
          );

          if (isAcceptedType) {
            event.preventDefault();
            onPaste(file);
            break;
          }
        }
      }
    },
    [onPaste, acceptedFileTypes],
  );

  useEffect(() => {
    const handler = (event: ClipboardEvent) => {
      void handlePaste(event);
    };

    document.addEventListener("paste", handler);
    return () => document.removeEventListener("paste", handler);
  }, [handlePaste]);
}
