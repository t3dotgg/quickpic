"use client";

import React, { useState, useEffect, type ChangeEvent, useRef } from "react";
import { usePlausible } from "next-plausible";
import { useLocalStorage } from "@/hooks/use-local-storage";

const ColorPicker = ({
  onChange,
  value,
}: {
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  value: string;
}) => {
  const refInput = useRef<HTMLInputElement>(null);

  return (
    <>
      {/** issue: input can't be styled */}
      {/** https://stackoverflow.com/questions/48832432/rounded-input-type-color */}
      <input
        ref={refInput}
        type="color"
        className="invisible w-0"
        value={value}
        onChange={onChange}
      />
      <button
        onClick={() => refInput.current?.click()}
        className="size-8 shrink-0 rounded-full border border-white"
        style={{ backgroundColor: value }}
      >

      </button>
    </>
  );
};
export const SquareTool: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [backgroundColor, setBackgroundColor] = useLocalStorage<string>(
    "squareTool_backgroundColor",
    "white",
  );
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
    const color = event.target.value;
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
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            const x = (maxDim - img.width) / 2;
            const y = (maxDim - img.height) / 2;
            ctx.drawImage(img, x, y);
            const dataUrl = canvas.toDataURL("image/png");
            setCanvasDataUrl(dataUrl);

            // Create a smaller canvas for the preview
            const previewCanvas = document.createElement("canvas");
            const previewSize = 200; // Set desired preview size
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
  }, [imageFile, backgroundColor]);

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

      <div className="flex gap-2">
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
          <ColorPicker
            value={backgroundColor}
            onChange={handleBackgroundColorChange}
          />

          <span className="ml-2">Custom Color Background</span>
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
