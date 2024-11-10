"use client";

import { useState, useCallback } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";

type Radius = 8 | 16 | 32 | 64 | 128;
type BackgroundOption = "transparent" | "white" | "black" | "custom";

interface ImageMetadata {
  width: number;
  height: number;
  name: string;
  newName: string;
}

export const RoundedTool: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageMetadata, setImageMetadata] = useState<ImageMetadata | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [radius, setRadius] = useLocalStorage<Radius>("roundedTool_radius", 32);
  const [background, setBackground] = useLocalStorage<BackgroundOption>(
    "roundedTool_bg",
    "transparent"
  );
  const [customColor, setCustomColor] = useLocalStorage(
    "roundedTool_customColor",
    "#ffffff"
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

  const roundCorners = useCallback(async () => {
    if (!imageFile || !imageMetadata) return;

    const img = new Image();
    const objectUrl = URL.createObjectURL(imageFile);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Fill background if not transparent
      if (background !== "transparent") {
        ctx.fillStyle = background === "custom" ? customColor : background;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Create rounded rectangle path
      ctx.beginPath();
      ctx.moveTo(radius, 0);
      ctx.lineTo(canvas.width - radius, 0);
      ctx.quadraticCurveTo(canvas.width, 0, canvas.width, radius);
      ctx.lineTo(canvas.width, canvas.height - radius);
      ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - radius, canvas.height);
      ctx.lineTo(radius, canvas.height);
      ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - radius);
      ctx.lineTo(0, radius);
      ctx.quadraticCurveTo(0, 0, radius, 0);
      ctx.closePath();

      // Clip and draw image
      ctx.clip();
      ctx.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${imageMetadata.newName}-rounded.png`;
        a.click();
        URL.revokeObjectURL(url);
      }, "image/png");

      URL.revokeObjectURL(objectUrl);
    };

    img.src = objectUrl;
  }, [imageFile, radius, background, customColor, imageMetadata]);

  if (!imageMetadata) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <p className="text-center">Round the corners of any image. Fast and free.</p>
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
    <div className="flex flex-col items-center justify-center gap-4 p-4">
      {previewUrl && <img src={previewUrl} alt="Preview" className="mb-4 max-w-xl" />}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={imageMetadata.newName}
          onChange={(e) => handleNameChange(e.target.value)}
          className="rounded border border-gray-600 bg-transparent p-2 text-foreground"
          placeholder="Enter file name"
        />
        <span className="text-gray-400">-rounded.png</span>
      </div>
      <div className="flex gap-2">
        {([8, 16, 32, 64, 128] as Radius[]).map((r) => (
          <button
            key={r}
            onClick={() => setRadius(r)}
            className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
              radius === r
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            {r}px
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        {(["transparent", "white", "black", "custom"] as BackgroundOption[]).map(
          (bg) => (
            <button
              key={bg}
              onClick={() => setBackground(bg)}
              className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
                background === bg
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              {bg}
            </button>
          )
        )}
      </div>
      {background === "custom" && (
        <input
          type="color"
          value={customColor}
          onChange={(e) => setCustomColor(e.target.value)}
          className="h-8 w-16 cursor-pointer rounded border-0 bg-transparent p-0"
        />
      )}
      <button
        onClick={() => void roundCorners()}
        className="rounded bg-blue-600 px-4 py-2 text-base font-medium text-white transition-colors hover:bg-blue-700"
      >
        Round Corners
      </button>
    </div>
  );
};
