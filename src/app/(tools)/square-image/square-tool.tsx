"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import { usePlausible } from "next-plausible";
import { ChromePicker } from "react-color";

export const SquareTool: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [backgroundColor, setBackgroundColor] = useState<
    "black" | "white" | "transparent" | "custom"
  >("white");
  const [customColor, setCustomColor] = useState<string>("#FF0000");
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
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const color = event.target.value as
      | "black"
      | "white"
      | "transparent"
      | "custom";
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
            ctx.fillStyle =
              backgroundColor === "custom" ? customColor : backgroundColor;
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
                previewSize
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
  }, [imageFile, backgroundColor, customColor]);

  if (!imageMetadata) {
    return (
      <div className="flex flex-col p-4 gap-4">
        <p className="text-center">
          Create square images with custom backgrounds. Fast and free.
        </p>
        <div className="flex justify-center">
          <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-colors duration-200 gap-2">
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

  const radioButtons = (buttons: string[]) => {
    return buttons.map((val) => {
      return (
        <label className="inline-flex items-center">
          <input
            type="radio"
            value={val}
            checked={backgroundColor === val}
            onChange={handleBackgroundColorChange}
            className="form-radio text-blue-600"
          />
          <span className="ml-2">
            {val.replace(
              /\w\S*/g,
              (text) =>
                text.charAt(0).toUpperCase() +
                text.substring(1).toLowerCase() +
                " "
            )}
            Background
          </span>
        </label>
      );
    });
  };

  return (
    <div className="flex flex-col p-4 gap-4 justify-center items-center text-2xl">
      {previewUrl && <img src={previewUrl} alt="Preview" className="mb-4" />}
      <p>{imageMetadata.name}</p>
      <p>
        Original size: {imageMetadata.width}px x {imageMetadata.height}px
      </p>
      <p>
        Square size: {Math.max(imageMetadata.width, imageMetadata.height)}px x{" "}
        {Math.max(imageMetadata.width, imageMetadata.height)}px
      </p>

      <div className="grid grid-rows-2 grid-cols-2 gap-x-4 gap-y-2">
        {radioButtons(["white", "black", "transparent", "custom"])}
      </div>

      {backgroundColor === "custom" && (
        <div className="flex gap-2">
          <label className="inline-flex items-center">
            <ChromePicker
              color={customColor}
              onChange={(color) => {
                setCustomColor(color.hex);
              }}
              disableAlpha={true}
            />
          </label>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => {
            plausible("create-square-image");
            handleSaveImage();
          }}
          className="px-3 py-2 bg-green-700 text-sm text-white font-semibold rounded-md shadow-md hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 transition-colors duration-200"
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
          className="px-3 py-2 rounded-md text-sm font-medium bg-red-700 text-white hover:bg-red-800 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
