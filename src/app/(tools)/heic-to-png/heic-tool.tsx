"use client";
import { usePlausible } from "next-plausible";
import { useState, useCallback } from "react";
import heicConvert from "heic-convert";

interface FileWithNewName extends File {
  newName: string;
}

export const HeicTool = () => {
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [currentFile, setCurrentFile] = useState<FileWithNewName | null>(null);
  const plausible = usePlausible();

  const convertHeicToPng = async (file: File): Promise<Blob> => {
    const arrayBuffer = await file.arrayBuffer();
    const pngBuffer = await heicConvert({
      buffer: Buffer.from(arrayBuffer),
      format: "PNG",
    });

    return new Blob([pngBuffer], { type: "image/png" });
  };

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.name.toLowerCase().endsWith(".heic")) {
        setError("Please select a HEIC file");
        return;
      }

      const fileWithName: FileWithNewName = {
        ...file,
        newName: file.name.replace(/\.heic$/i, ""),
      };
      setCurrentFile(fileWithName);
      setError(null);
    },
    [],
  );

  const handleConvert = async () => {
    if (!currentFile) return;

    try {
      setIsConverting(true);
      plausible("convert-heic");

      const pngBlob = await convertHeicToPng(currentFile);

      const url = URL.createObjectURL(pngBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${currentFile.newName}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Conversion error:", err);
      setError(
        "Failed to convert file. Please make sure the file is a valid HEIC image.",
      );
    } finally {
      setIsConverting(false);
    }
  };

  const handleNameChange = (newName: string) => {
    if (currentFile) {
      setCurrentFile({ ...currentFile, newName });
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      const file = e.dataTransfer?.files?.[0];
      if (file) void handleFile(file);
    },
    [handleFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target?.files?.[0];
      if (file) void handleFile(file);
    },
    [handleFile],
  );

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-8 p-4">
      <div className="text-center">
        <h1 className="mb-2 text-4xl font-bold">HEIC to PNG Converter</h1>
        <p className="text-gray-400">
          Convert Apple HEIC photos to PNG format.
          <br />
          Your files never leave your device.
        </p>
      </div>

      {!currentFile && (
        <div
          className={`relative flex min-h-[200px] w-full max-w-xl flex-col items-center justify-center rounded-lg border-2 border-dashed ${
            dragActive
              ? "border-blue-500 bg-blue-50/10"
              : "border-gray-500 bg-gray-900"
          } p-6 transition-colors duration-200 hover:border-gray-400`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            type="file"
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            accept=".heic,image/heic"
            onChange={handleChange}
            disabled={isConverting}
          />
          <div className="text-center">
            <p className="mb-2 text-lg font-medium text-gray-300">
              {isConverting ? "Converting..." : "Drop your HEIC file here"}
            </p>
            <p className="text-sm text-gray-400">or click to select file</p>
          </div>
        </div>
      )}

      {error && <p className="max-w-md text-center text-red-500">{error}</p>}

      {currentFile && !error && (
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={currentFile.newName}
              onChange={(e) => handleNameChange(e.target.value)}
              className="rounded border border-gray-600 bg-transparent p-2 text-foreground"
              placeholder="Enter file name"
            />
            <span className="text-gray-400">.png</span>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => void handleConvert()}
              disabled={isConverting}
              className={`rounded px-4 py-2 text-white ${
                isConverting
                  ? "cursor-not-allowed bg-gray-400"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              {isConverting ? "Converting..." : "Convert"}
            </button>
            
            <button
              onClick={() => {
                setCurrentFile(null);
                setError(null);
              }}
              className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="text-center text-sm text-gray-400">
        <p>Supported file types: .heic</p>
        <p className="mt-1 text-xs text-gray-500">
          Free and private - files are processed entirely in your browser
        </p>
      </div>
    </div>
  );
};
