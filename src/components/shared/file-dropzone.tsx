import React, { useCallback, useState, useRef } from "react";

import { UploadIcon } from "@/components/shared/icons";

import { type FileTypeString, generateFileTypesString } from "@/lib/file-utils";

interface FileDropzoneProps {
  children: React.ReactNode;
  acceptedFileTypes: string[];
  dropText: string;
  setCurrentFile: (file: File) => void;
  onError?: (error: string | null) => void;
}

export function FileDropzone({
  children,
  acceptedFileTypes,
  dropText,
  setCurrentFile,
  onError,
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;

    if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragOut = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;

    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounter.current = 0;

      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        const droppedFile = files[0];

        if (!droppedFile) {
          if (onError) onError("How did you do a drop with no files???");
          else alert("How did you do a drop with no files???");
          return;
        }

        if (
          !acceptedFileTypes.includes(droppedFile.type) &&
          !acceptedFileTypes.some((type) =>
            droppedFile.name.toLowerCase().endsWith(type.replace("*", "")),
          )
        ) {
          const acceptedFileTypesString = generateFileTypesString(
            acceptedFileTypes as FileTypeString[],
          );
          if (onError)
            onError(
              `Uploaded file has invalid type. Valid types are: ${acceptedFileTypesString}.`,
            );
          else
            alert(
              `Uploaded file has invalid type. Valid types are: ${acceptedFileTypesString}.`,
            );
          return;
        }

        // Happy path
        setCurrentFile(droppedFile);
      }
    },
    [acceptedFileTypes, setCurrentFile, onError],
  );

  return (
    <div
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className="size-full"
    >
      {isDragging && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
          <div className="animate-in fade-in zoom-in relative flex size-full transform flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/30 transition-all duration-200 ease-out">
            <UploadIcon className="size-12 text-gray-500" />
            <p className="text-2xl font-semibold text-gray-500">{dropText}</p>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
