"use client";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import convert from "heic-convert";

export const HeicTool = () => {
  const [currentFile, setCurrentFile] = useState<{
    file: File;
    newName: string;
  } | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    
    // Set current file with initial name (removing .heic extension)
    setCurrentFile({
      file,
      newName: file.name.replace(/\.heic$/i, ''),
    });
    setError(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/heic': ['.heic', '.HEIC'],
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
    if (!currentFile) return;
    setIsConverting(true);
    setError(null);

    try {
      // Convert file to buffer
      const buffer = await currentFile.file.arrayBuffer();
      
      // Convert HEIC to PNG
      const pngBuffer = await convert({
        buffer: Buffer.from(buffer),
        format: 'PNG',
        quality: 1
      });

      // Create blob and download
      const blob = new Blob([pngBuffer], { type: 'image/png' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${currentFile.newName}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Reset state
      setCurrentFile(null);
    } catch (err) {
      console.error(err);
      setError("Failed to convert file. Please make sure it's a valid HEIC image.");
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">HEIC to PNG Converter</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-8">
        Convert Apple HEIC photos to PNG format. Fast, free, and processed entirely in your browser.
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
            <p>Drag & drop a HEIC file here, or click to select file</p>
            {currentFile && (
              <p className="mt-2 text-sm text-gray-500">
                Selected: {currentFile.file.name}
              </p>
            )}
          </>
        )}
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>

      {currentFile && !isConverting && (
        <div className="flex flex-col items-center gap-4 mt-8">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={currentFile.newName}
              onChange={(e) => handleNameChange(e.target.value)}
              className="input"
              placeholder="Enter file name"
            />
            <span className="text-gray-400">.png</span>
          </div>
          
          <button
            onClick={() => void handleConvert()}
            className="btn btn-primary"
          >
            Convert to PNG
          </button>
        </div>
      )}
    </div>
  );
};
