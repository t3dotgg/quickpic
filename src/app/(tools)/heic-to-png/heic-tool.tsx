"use client";
import { usePlausible } from "next-plausible";
import { useState, useCallback } from "react";
import heicConvert from 'heic-convert';

export const HeicTool = () => {
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const plausible = usePlausible();

  const convertHeicToPng = async (file: File): Promise<Blob> => {
    const arrayBuffer = await file.arrayBuffer();
    const pngBuffer = await heicConvert({
      buffer: Buffer.from(arrayBuffer), // Convert ArrayBuffer to Buffer
      format: 'PNG'      // Convert to PNG format
    });
    
    return new Blob([pngBuffer], { type: 'image/png' });
  };

  const handleFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".heic")) {
      setError("Please select a HEIC file");
      return;
    }

    try {
      setIsConverting(true);
      setError(null);
      plausible("convert-heic");

      const pngBlob = await convertHeicToPng(file);
      
      // Create download link
      const url = URL.createObjectURL(pngBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${file.name.replace(/\.heic$/i, "")}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Conversion error:", error);
      setError(
        "Failed to convert file. Please make sure the file is a valid HEIC image."
      );
    } finally {
      setIsConverting(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer?.files?.[0];
    if (file) handleFile(file);
  }, []);

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

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target?.files?.[0];
    if (file) handleFile(file);
  }, []);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-8 p-4">
      <div className="text-center">
        <h1 className="mb-2 text-4xl font-bold">HEIC to PNG Converter</h1>
        <p className="text-gray-400">
          Convert Apple HEIC photos to PNG format.<br />
          Your files never leave your device.
        </p>
      </div>
      
      <div 
        className={`relative flex min-h-[200px] w-full max-w-xl flex-col items-center justify-center rounded-lg border-2 border-dashed ${
          dragActive ? 'border-blue-500 bg-blue-50/10' : 'border-gray-500 bg-gray-900'
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
          <p className="text-sm text-gray-400">
            or click to select file
          </p>
        </div>
      </div>

      {error && (
        <p className="max-w-md text-center text-red-500">{error}</p>
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