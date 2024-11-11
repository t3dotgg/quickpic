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
    <div className="flex flex-col items-center justify-center max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-400">
          HEIC to PNG Converter
        </h1>
        <p className="text-gray-300">
          Convert Apple HEIC photos to PNG format. Fast, free, and processed entirely in your browser.
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
              <p className="text-gray-300">Drag & drop a HEIC file here, or click to select file</p>
            </div>
            {currentFile && (
              <p className="mt-2 text-sm text-gray-400">
                Selected: {currentFile.file.name}
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
              className="input bg-gray-900 border-gray-700 text-gray-200 focus:border-gray-600"
              placeholder="Enter file name"
            />
            <span className="text-gray-400">.png</span>
          </div>
          
          <button
            onClick={() => void handleConvert()}
            className="btn btn-primary w-full"
          >
            Convert to PNG
          </button>
        </div>
      )}
    </div>
  );
};
