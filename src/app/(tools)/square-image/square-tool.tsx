"use client";

import React, { useState, useEffect, type ChangeEvent } from "react";
import { usePlausible } from "next-plausible";
import { useLocalStorage } from "@/hooks/use-local-storage";

export const SquareTool: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [backgroundColor, setBackgroundColor] = useLocalStorage<
    "black" | "white" | "accent"
  >("squareTool_backgroundColor", "white");
  const [accentColor, setAccentColor] = useState<string>("rgb(255,255,255)");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [canvasDataUrl, setCanvasDataUrl] = useState<string | null>(null);
  const [imageMetadata, setImageMetadata] = useState<{
    width: number;
    height: number;
    name: string;
  } | null>(null);
  const plausible = usePlausible();

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImageMetadata({ width: 0, height: 0, name: file.name });
    }
  };

  const handleBackgroundColorChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const color = event.target.value as "black" | "white" | "accent";
    setBackgroundColor(color);
  };

  const handleSaveImage = () => {
    if (canvasDataUrl && imageMetadata) {
      const link = document.createElement("a");
      link.href = canvasDataUrl;
      const originalFileName = imageMetadata.name;
      const fileNameWithoutExtension =
        originalFileName.substring(0, originalFileName.lastIndexOf(".")) ||
        originalFileName;
      link.download = `${fileNameWithoutExtension}-squared.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const calculateAccentColor = (imgSrc: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;

        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(
            0,
            0,
            canvas.width,
            canvas.height,
          ).data;
          const colorMap = new Map<string, number>();

          // Sample every 4th pixel to improve performance
          for (let i = 0; i < imageData.length; i += 16) {
            const r = imageData[i];
            const g = imageData[i + 1];
            const b = imageData[i + 2];

            // Skip white and near-white colors
            if (r !== undefined && g !== undefined && b !== undefined) {
              if (r > 240 && g > 240 && b > 240) continue;

              const color = `rgb(${r},${g},${b})`;
              colorMap.set(color, (colorMap.get(color) || 0) + 1);
            }
          }

          let maxCount = 0;
          let dominantColor = "white"; // Default to white if no dominant color found

          colorMap.forEach((count, color) => {
            if (count > maxCount) {
              maxCount = count;
              dominantColor = color;
            }
          });
          console.log(dominantColor);
          resolve(dominantColor);
        } else {
          resolve("white");
        }
      };
      img.src = imgSrc;
    });
  };

  useEffect(() => {
    if (imageFile) {
      const reader = new FileReader();
      reader.onload = async () => {
        const imgSrc = reader.result as string;

        // Calculate accent color first
        if (backgroundColor === "accent") {
          const dominantColor = await calculateAccentColor(imgSrc);
          setAccentColor(dominantColor);
        }

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
            // Set the background color
            if (backgroundColor === "accent") {
              ctx.fillStyle = accentColor;
            } else {
              ctx.fillStyle = backgroundColor;
            }

            ctx.fillRect(0, 0, canvas.width, canvas.height);
            const x = (maxDim - img.width) / 2;
            const y = (maxDim - img.height) / 2;
            ctx.drawImage(img, x, y);
            const dataUrl = canvas.toDataURL("image/png");
            setCanvasDataUrl(dataUrl);

            // Create preview
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
        img.src = imgSrc;
      };
      reader.readAsDataURL(imageFile);
    } else {
      setPreviewUrl(null);
      setCanvasDataUrl(null);
      setImageMetadata(null);
    }
  }, [imageFile, backgroundColor, accentColor]);

  // Rest of the component remains the same...

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
      <p>{imageMetadata.name}</p>
      <p>
        Original size: {imageMetadata.width}px x {imageMetadata.height}px
      </p>
      <p>
        Square size: {Math.max(imageMetadata.width, imageMetadata.height)}px x{" "}
        {Math.max(imageMetadata.width, imageMetadata.height)}px
      </p>

      <div className="grid grid-cols-2 gap-2">
        <label className="inline-flex items-center">
          <input
            type="radio"
            value="white"
            checked={backgroundColor === "white"}
            onChange={handleBackgroundColorChange}
            className="form-radio text-blue-600"
          />
          <span className="ml-2">White Background</span>
        </label>
        <label className="inline-flex items-center">
          <input
            type="radio"
            value="black"
            checked={backgroundColor === "black"}
            onChange={handleBackgroundColorChange}
            className="form-radio text-blue-600"
          />
          <span className="ml-2">Black Background</span>
        </label>
        <label className="inline-flex items-center">
          <input
            type="radio"
            value="accent"
            checked={backgroundColor === "accent"}
            onChange={handleBackgroundColorChange}
            className="form-radio text-blue-600"
          />
          <span className="ml-2">Accent Background</span>
        </label>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => {
            plausible("create-square-image");
            handleSaveImage();
          }}
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
