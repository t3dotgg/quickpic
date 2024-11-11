"use client";
import { useState } from "react";
import { useDropzone } from "react-dropzone";

export function WebPTool() {
  const [files, setFiles] = useState<Array<{ file: File; newName: string }>>([]); 
  const [options, setOptions] = useState({
    format: "png" as "png" | "jpg",
    quality: 90
  });
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = async (acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      newName: file.name.replace(/\.webp$/i, ''),
    }));
    setFiles(newFiles);
    setError(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/webp': ['.webp', '.WEBP'],
    },
  });

  const handleNameChange = (index: number, newName: string) => {
    const newFiles = [...files];
    newFiles[index].newName = newName;
    setFiles(newFiles);
  };

  const handleConvert = async () => {
    if (files.length === 0) return;
    setIsConverting(true);
    setError(null);

    try {
      for (const fileData of files) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not get canvas context');

        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = URL.createObjectURL(fileData.file);
        });

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob(
            (blob) => resolve(blob!),
            `image/${options.format}`,
            options.quality / 100
          );
        });

        // Download the converted file
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${fileData.newName}.${options.format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

      // Reset state
      setFiles([]);
    } catch (err) {
      console.error(err);
      setError("Failed to convert file(s). Please try again.");
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-400">
          WebP Converter
        </h1>
        <p className="text-gray-300">
          Convert WebP images to PNG or JPG format. Fast, free, and processed entirely in your browser.
        </p>
      </div>

      <div
        {...getRootProps()}
        className={`w-full cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300 bg-gray-900/50 ${
          isDragActive ? "border-primary/50 bg-primary/5" : "border-gray-700 hover:border-gray-600"
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
              <div className="h-12 w-12 rounded-xl bg-gray-800 flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <p className="text-gray-300">Drag & drop WebP files here, or click to select files</p>
            </div>
            {files.length > 0 && (
              <p className="mt-2 text-sm text-gray-400">
                {files.length} file(s) selected
              </p>
            )}
          </>
        )}
        {error && <p className="mt-4 text-red-400">{error}</p>}
      </div>

      {files.length > 0 && !isConverting && (
        <div className="w-full space-y-4">
          <div className="space-y-2 w-full">
            {files.map((file, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={file.newName}
                  onChange={(e) => handleNameChange(index, e.target.value)}
                  className="input bg-gray-900 border-gray-700 text-gray-200 focus:border-gray-600"
                  placeholder="Enter file name"
                />
                <span className="text-gray-400">.{options.format}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 items-center justify-center">
            <select
              value={options.format}
              onChange={(e) => setOptions({ ...options, format: e.target.value as "png" | "jpg" })}
              className="input bg-gray-900 border-gray-700 text-gray-200 focus:border-gray-600 max-w-[100px]"
            >
              <option value="png">PNG</option>
              <option value="jpg">JPG</option>
            </select>

            <div className="flex items-center gap-2">
              <label className="text-gray-300">Quality:</label>
              <input
                type="range"
                min="1"
                max="100"
                value={options.quality}
                onChange={(e) => setOptions({ ...options, quality: Number(e.target.value) })}
                className="w-32"
              />
              <span className="text-gray-400">{options.quality}%</span>
            </div>

            <button
              onClick={() => void handleConvert()}
              className="btn btn-primary w-full"
            >
              Convert Files
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
