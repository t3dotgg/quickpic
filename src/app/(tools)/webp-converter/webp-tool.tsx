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
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">WebP Converter</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-8">
        Convert WebP images to PNG or JPG format. Fast, free, and processed entirely in your browser.
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
            <p>Drag & drop WebP files here, or click to select files</p>
            {files.length > 0 && (
              <p className="mt-2 text-sm text-gray-500">
                {files.length} file(s) selected
              </p>
            )}
          </>
        )}
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>

      {files.length > 0 && !isConverting && (
        <div className="flex flex-col items-center gap-4 mt-8 w-full max-w-xl">
          <div className="space-y-2 w-full">
            {files.map((file, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={file.newName}
                  onChange={(e) => handleNameChange(index, e.target.value)}
                  className="input"
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
              className="input max-w-[100px]"
            >
              <option value="png">PNG</option>
              <option value="jpg">JPG</option>
            </select>

            <div className="flex items-center gap-2">
              <label>Quality:</label>
              <input
                type="range"
                min="1"
                max="100"
                value={options.quality}
                onChange={(e) => setOptions({ ...options, quality: Number(e.target.value) })}
                className="w-32"
              />
              <span>{options.quality}%</span>
            </div>

            <button
              onClick={() => void handleConvert()}
              className="btn btn-primary"
            >
              Convert Files
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
