"use client";

import { useState, useCallback } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";

interface ImageMetadata {
  width: number;
  height: number;
  name: string;
  newName: string;
}

export const SquareTool: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageMetadata, setImageMetadata] = useState<ImageMetadata | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [backgroundColor, setBackgroundColor] = useLocalStorage(
    "squareTool_bgColor",
    "#000000"
  );

  const handleImageUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        setImageMetadata({
          width: img.width,
          height: img.height,
          name: file.name,
          newName: file.name.replace(/\.[^/.]+$/, "")
        });
        setPreviewUrl(objectUrl);
        setImageFile(file);
      };

      img.src = objectUrl;
    },
    []
  );

  const handleNameChange = (newName: string) => {
    setImageMetadata(prev => prev ? { ...prev, newName } : null);
  };

  const convertToSquare = useCallback(async () => {
    if (!imageFile || !imageMetadata) return;

    const img = new Image();
    const objectUrl = URL.createObjectURL(imageFile);

    img.onload = () => {
      const size = Math.max(img.width, img.height);
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Fill background
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, size, size);

      // Center the image
      const x = (size - img.width) / 2;
      const y = (size - img.height) / 2;
      ctx.drawImage(img, x, y);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${imageMetadata.newName}-square.png`;
        a.click();
        URL.revokeObjectURL(url);
      }, "image/png");

      URL.revokeObjectURL(objectUrl);
    };

    img.src = objectUrl;
  }, [imageFile, backgroundColor, imageMetadata]);

  if (!imageMetadata) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <p className="text-center">
          Create square images with custom backgrounds. Fast and free.
        </p>
        <div className="flex justify-center">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white shadow-md transition-colors duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75">
            <span>Upload Image</span>
            <input
              type="file"
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
          </label>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-4 text-2xl">
      {previewUrl && <img src={previewUrl} alt="Preview" className="mb-4" />}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={imageMetadata.newName}
          onChange={(e) => handleNameChange(e.target.value)}
          className="rounded border border-gray-600 bg-transparent p-2 text-foreground"
          placeholder="Enter file name"
        />
        <span className="text-gray-400">-square.png</span>
      </div>
      <p>
        Original size: {imageMetadata.width}px x {imageMetadata.height}px
      </p>
      <p>
        Square size: {Math.max(imageMetadata.width, imageMetadata.height)}px x{" "}
        {Math.max(imageMetadata.width, imageMetadata.height)}px
      </p>
      <div className="flex items-center gap-2">
        <label className="text-base">Background:</label>
        <input
          type="color"
          value={backgroundColor}
          onChange={(e) => setBackgroundColor(e.target.value)}
          className="h-8 w-16 cursor-pointer rounded border-0 bg-transparent p-0"
        />
      </div>
      <button
        onClick={() => void convertToSquare()}
        className="rounded bg-blue-600 px-4 py-2 text-base font-medium text-white transition-colors hover:bg-blue-700"
      >
        Convert to Square
      </button>
    </div>
  );
};
