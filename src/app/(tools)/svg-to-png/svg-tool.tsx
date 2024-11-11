"use client";
import { usePlausible } from "next-plausible";
import { useMemo, useState, useRef, useCallback } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useDropzone } from "react-dropzone";

type Scale = 1 | 2 | 4 | 8 | 16;

function scaleSvg(svgContent: string, scale: Scale) {
  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(svgContent, "image/svg+xml");
  const svgElement = svgDoc.documentElement;
  
  const width = parseInt(svgElement.getAttribute("width") ?? "300");
  const height = parseInt(svgElement.getAttribute("height") ?? "150");

  const maxDimension = 16384;
  if (width * scale > maxDimension || height * scale > maxDimension) {
    throw new Error("Resulting image would be too large. Please try a smaller scale.");
  }

  const scaledWidth = width * scale;
  const scaledHeight = height * scale;

  svgElement.setAttribute("width", scaledWidth.toString());
  svgElement.setAttribute("height", scaledHeight.toString());

  return new XMLSerializer().serializeToString(svgDoc);
}

export function SVGTool() {
  const [currentFile, setCurrentFile] = useState<{
    file: File;
    newName: string;
    width: number;
    height: number;
  } | null>(null);
  const [scale, setScale] = useState<Scale>(1);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(text, "image/svg+xml");
      const svgElement = svgDoc.documentElement;
      
      const width = parseInt(svgElement.getAttribute("width") ?? "300");
      const height = parseInt(svgElement.getAttribute("height") ?? "150");

      setCurrentFile({
        file,
        newName: file.name.replace(/\.svg$/i, ''),
        width,
        height
      });
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to read SVG file");
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/svg+xml': ['.svg'],
    },
    maxFiles: 1,
  });

  const handleNameChange = (newName: string) => {
    if (!currentFile) return;
    setCurrentFile({
      ...currentFile,
      newName,
    });
  };

  const handleConvert = async () => {
    if (!currentFile || !canvasRef.current) return;
    setIsConverting(true);
    setError(null);

    try {
      const svgContent = await currentFile.file.text();
      const scaledSvg = scaleSvg(svgContent, scale);
      
      const canvas = canvasRef.current;
      canvas.width = currentFile.width * scale;
      canvas.height = currentFile.height * scale;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      const img = new Image();
      const blob = new Blob([scaledSvg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = url;
      });

      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      canvas.toBlob((blob) => {
        if (!blob) {
          setError("Failed to create PNG");
          return;
        }

        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `${currentFile.newName}-${scale}x.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(downloadUrl);

        setCurrentFile(null);
        setScale(1);
      }, 'image/png');

    } catch (err) {
      console.error(err);
      setError("Failed to convert file. Please make sure it's a valid SVG.");
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <h1 className="text-2xl font-bold mb-4">SVG to PNG Converter</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-8">
        Convert SVG files to PNG format with custom scaling. Fast, free, and processed entirely in your browser.
      </p>

      <div
        {...getRootProps()}
        className={`w-full max-w-xl cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          isDragActive ? "border-blue-500 bg-blue-50/10" : "border-gray-300"
        }`}
      >
        <input {...getInputProps()} />
        {isConverting ? (
          <div className="flex flex-col items-center gap-2">
            <p>Converting...</p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
          </div>
        ) : (
          <>
            <p>Drag & drop an SVG file here, or click to select file</p>
            {currentFile && (
              <p className="mt-2 text-sm text-gray-500">
                Selected: {currentFile.file.name} ({currentFile.width}x{currentFile.height})
              </p>
            )}
          </>
        )}
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>

      {currentFile && !isConverting && (
        <div className="flex flex-col items-center gap-4 mt-8 w-full max-w-xl">
          <div className="flex items-center gap-2 w-full">
            <input
              type="text"
              value={currentFile.newName}
              onChange={(e) => handleNameChange(e.target.value)}
              className="input"
              placeholder="Enter file name"
            />
            <span className="text-gray-400">-{scale}x.png</span>
          </div>

          <div className="flex flex-wrap gap-4 items-center justify-center">
            <select
              value={scale}
              onChange={(e) => setScale(Number(e.target.value) as Scale)}
              className="input max-w-[100px]"
            >
              <option value="1">1x</option>
              <option value="2">2x</option>
              <option value="4">4x</option>
              <option value="8">8x</option>
              <option value="16">16x</option>
            </select>

            <div className="flex items-center gap-2">
              <span>Output size:</span>
              <span className="text-gray-600 dark:text-gray-300">
                {currentFile.width * scale}x{currentFile.height * scale}
              </span>
            </div>

            <button
              onClick={() => void handleConvert()}
              className="btn btn-primary"
            >
              Convert to PNG
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
