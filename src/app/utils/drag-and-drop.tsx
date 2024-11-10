"use client"
import { useCallback } from "react";
import { Accept, useDropzone } from "react-dropzone";

export function DragAndDrop({
  accept,
  handleDrop,
}: {
  accept: Accept;
  handleDrop: (files: File[]) => void;
}) {
  const onDrop = useCallback(handleDrop, [handleDrop]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: 1
  });

  return (
    <div
      {...getRootProps()}
      className={`w-full max-w-lg h-44 flex flex-col justify-center items-center border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
        ${isDragActive
          ? "border-blue-500 bg-blue-50"
          : "border-gray-700 hover:border-gray-600"
        }`}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p className="text-blue-600 font-medium">Drop the file here ...</p>
      ) : (
        <p className="text-gray-600">
          Drag &apos;n&apos; drop here, or click to select file
        </p>
      )}
    </div>
  );
}