"use client";
import { useState, useRef, useCallback } from "react";
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
    throw new Error(
      "Resulting image would be too large. Please try a smaller scale.",
    );
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

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
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
        newName: file.name.replace(/\.svg$/i, ""),
        width,
        height,
      });
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to read SVG file");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: useCallback(
      (acceptedFiles: File[]) => {
        void onDrop(acceptedFiles);
      },
      [onDrop],
    ),
    accept: {
      "image/svg+xml": [".svg"],
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

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get canvas context");

      const img = new Image();
      const blob = new Blob([scaledSvg], { type: "image/svg+xml" });
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
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = `${currentFile.newName}-${scale}x.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(downloadUrl);

        setCurrentFile(null);
        setScale(1);
      }, "image/png");
    } catch (err) {
      console.error(err);
      setError("Failed to convert file. Please make sure it's a valid SVG.");
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center justify-center space-y-8">
      <canvas ref={canvasRef} style={{ display: "none" }} />
      <div className="space-y-4 text-center">
        <h1 className="bg-gradient-to-r from-gray-100 to-gray-400 bg-clip-text text-3xl font-bold text-transparent">
          SVG to PNG Converter
        </h1>
        <p className="text-gray-300">
          Convert SVG files to PNG format with custom scaling. Fast, free, and
          processed entirely in your browser.
        </p>
      </div>

      <div
        {...getRootProps()}
        className={`w-full cursor-pointer rounded-2xl border-2 border-dashed bg-gray-900/50 p-8 text-center transition-all duration-300 ${
          isDragActive
            ? "border-primary/50 bg-primary/5"
            : "border-gray-700 hover:border-gray-600"
        }`}
      >
        <input {...getInputProps()} />
        {isConverting ? (
          <div className="flex flex-col items-center gap-3">
            <div className="loading-spinner" />
            <p className="text-gray-300">Converting...</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-800">
                <svg
                  className="h-6 w-6 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
              </div>
              <p className="text-gray-300">
                Drag & drop an SVG file here, or click to select file
              </p>
            </div>
            {currentFile && (
              <p className="mt-2 text-sm text-gray-400">
                Selected: {currentFile.file.name} ({currentFile.width}x
                {currentFile.height})
              </p>
            )}
          </>
        )}
        {error && <p className="mt-4 text-red-400">{error}</p>}
      </div>

      {currentFile && !isConverting && (
        <div className="w-full space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={currentFile.newName}
              onChange={(e) => handleNameChange(e.target.value)}
              className="input border-gray-700 bg-gray-900 text-gray-200 focus:border-gray-600"
              placeholder="Enter file name"
            />
            <span className="text-gray-400">-{scale}x.png</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <select
              value={scale}
              onChange={(e) => setScale(Number(e.target.value) as Scale)}
              className="input max-w-[100px] border-gray-700 bg-gray-900 text-gray-200 focus:border-gray-600"
            >
              <option value="1">1x</option>
              <option value="2">2x</option>
              <option value="4">4x</option>
              <option value="8">8x</option>
              <option value="16">16x</option>
            </select>

            <div className="flex items-center gap-2">
              <span className="text-gray-300">Output size:</span>
              <span className="text-gray-400">
                {currentFile.width * scale}x{currentFile.height * scale}
              </span>
            </div>

            <button
              onClick={() => void handleConvert()}
              className="btn btn-primary w-full"
            >
              Convert to PNG
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
