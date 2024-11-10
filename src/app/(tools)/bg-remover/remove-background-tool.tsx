"use client";
import { useState, useEffect } from "react";

export const RemoveBackgroundTool: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [canvasDataUrl, setCanvasDataUrl] = useState<string | null>(null);
  const [imageMetadata, setImageMetadata] = useState<{
    width: number;
    height: number;
    name: string;
  } | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImageMetadata({ width: 0, height: 0, name: file.name });
    }
  };

  const handleSaveImage = () => {
    if (canvasDataUrl && imageMetadata) {
      const link = document.createElement("a");
      link.href = canvasDataUrl;
      const originalFileName = imageMetadata.name;
      const fileNameWithoutExtension =
        originalFileName.substring(0, originalFileName.lastIndexOf(".")) ||
        originalFileName;
      link.download = `${fileNameWithoutExtension}-background-removed.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  useEffect(() => {
    if (imageFile) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const maxDim = Math.max(img.width, img.height);
          setImageMetadata((prevState) => ({
            ...prevState!,
            width: img.width,
            height: img.height,
          }));

          const canvas = document.createElement("canvas");
          canvas.width = maxDim;
          canvas.height = maxDim;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const x = (maxDim - img.width) / 2;
            const y = (maxDim - img.height) / 2;
            ctx.drawImage(img, x, y);

            // Simple background removal by making near-white pixels transparent
            const imageData = ctx.getImageData(
              0,
              0,
              canvas.width,
              canvas.height,
            );
            const data = imageData.data;
            for (let i = 0; i < data.length; i += 4) {
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];

              // Check to ensure r, g and b are defined
              if (r !== undefined && g !== undefined && b !== undefined) {
                if (r > 200 && g > 200 && b > 200) {
                  data[i + 3] = 0; // Set alpha to 0 (transparent)
                }
              }
            }
            ctx.putImageData(imageData, 0, 0);

            const dataUrl = canvas.toDataURL("image/png");
            setCanvasDataUrl(dataUrl);

            // Create a smaller preview
            const previewCanvas = document.createElement("canvas");
            const previewSize = 200;
            previewCanvas.width = previewSize;
            previewCanvas.height = previewSize;
            const previewCtx = previewCanvas.getContext("2d");
            if (previewCtx) {
              previewCtx.drawImage(
                canvas,
                0,
                0,
                canvas.width,
                canvas.height,
                0,
                0,
                previewSize,
                previewSize,
              );
              const previewDataUrl = previewCanvas.toDataURL("image/png");
              setPreviewUrl(previewDataUrl);
            }
          }
        };
        if (typeof reader.result === "string") {
          img.src = reader.result;
        }
      };
      reader.readAsDataURL(imageFile);
    } else {
      setPreviewUrl(null);
      setCanvasDataUrl(null);
      setImageMetadata(null);
    }
  }, [imageFile]);

  if (!imageMetadata) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <p className="text-center">
          Remove image backgrounds easily. Fast and free.
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
      <p>{imageMetadata.name}</p>
      <p>
        Original size: {imageMetadata.width}px x {imageMetadata.height}px
      </p>

      <div className="flex gap-2">
        <button
          onClick={handleSaveImage}
          className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white shadow-md transition-colors duration-200 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
        >
          Save Image
        </button>
        <button
          onClick={() => {
            setImageFile(null);
            setPreviewUrl(null);
            setCanvasDataUrl(null);
            setImageMetadata(null);
          }}
          className="rounded-md bg-red-700 px-3 py-1 text-sm font-medium text-white transition-colors hover:bg-red-800"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
