"use client";

import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";

interface DropzoneUploadProps {
  accept: Record<string, string[]>;
  onFilesAdded: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function DropzoneUpload({
  accept,
  onFilesAdded,
}: DropzoneUploadProps) {
  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFilesAdded({
        target: {
          files: acceptedFiles,
        } as unknown as EventTarget,
      } as unknown as React.ChangeEvent<HTMLInputElement>);
    }
  };
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept,
    onDrop,
  });

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-lg p-6 cursor-pointer ${
          isDragActive
            ? "border-green-500 text-green-500"
            : "border-muted-foreground"
        }`}
      >
        <input {...getInputProps()} onChange={onFilesAdded} />
        <div className="text-center">
          <Upload className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-6 text-sm text-muted-foreground">
            Drag &apos;n&apos; drop files here, or click to select files
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {Object.keys(accept).length > 0
              ? `Allowed files: ${Object.keys(accept).join(", ")}`
              : "All file types are allowed"}
          </p>
        </div>
      </div>
    </div>
  );
}
