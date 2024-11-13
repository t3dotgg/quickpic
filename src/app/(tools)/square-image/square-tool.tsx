"use client";

import { usePlausible } from "next-plausible";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { UploadBox } from "@/components/shared/upload-box";
import { OptionSelector } from "@/components/shared/option-selector";
import { FileDropzone } from "@/components/shared/file-dropzone";
import {
  type FileUploaderResult,
  useFileUploader,
} from "@/hooks/use-file-uploader";
import { useEffect, useState } from "react";

const calculateAccentColor = (imgSrc: string): Promise<string> => {
  const accentColorSet: Map<string, string> = new Map(); // caching the accent color
  return new Promise((resolve) => {
    if (accentColorSet.has(imgSrc)) {
      const color = accentColorSet.get(imgSrc);
      if (color) {
        resolve(color);
        return;
      }
    }
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
          canvas.height
        ).data;
        const colorMap = new Map<string, number>();

        // Sample every 4th pixel to improve performance
        for (let i = 0; i < imageData.length; i += 16) {
          const r = imageData[i];
          const g = imageData[i + 1];
          const b = imageData[i + 2];

          // Skip white and near-white colors
          if (r > 240 && g > 240 && b > 240) continue;

          const color = `rgb(${r},${g},${b})`;
          colorMap.set(color, (colorMap.get(color) || 0) + 1);
        }

        let maxCount = 0;
        let dominantColor = "white"; // Default to white if no dominant color found

        colorMap.forEach((count, color) => {
          if (count > maxCount) {
            maxCount = count;
            dominantColor = color;
          }
        });
        accentColorSet.set(imgSrc, dominantColor);
        setTimeout(()=>{
          accent
        },60*1000)
        resolve(dominantColor);
      } else {
        resolve("white");
      }
    };
    img.src = imgSrc;
  });
};

function SquareToolCore(props: { fileUploaderProps: FileUploaderResult }) {
  const { imageContent, imageMetadata, handleFileUploadEvent, cancel } =
    props.fileUploaderProps;

  const [backgroundColor, setBackgroundColor] = useLocalStorage<
    "black" | "white" | "accent"
  >("squareTool_backgroundColor", "white");

  const [squareImageContent, setSquareImageContent] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (imageContent && imageMetadata) {
      const canvas = document.createElement("canvas");
      const size = Math.max(imageMetadata.width, imageMetadata.height);
      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Fill background based on selected color
      if (backgroundColor === "accent") {
        calculateAccentColor(imageContent).then((dominantColor) => {
          ctx.fillStyle = dominantColor;
          ctx.fillRect(0, 0, size, size);
          drawImageOnCanvas(ctx);
        });
      } else {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, size, size);
        drawImageOnCanvas(ctx);
      }

      function drawImageOnCanvas(ctx: CanvasRenderingContext2D) {
        const img = new Image();
        img.onload = () => {
          const x = (size - imageMetadata.width) / 2;
          const y = (size - imageMetadata.height) / 2;
          ctx.drawImage(img, x, y);
          setSquareImageContent(canvas.toDataURL("image/png"));
        };
        img.src = imageContent;
      }
    }
  }, [imageContent, imageMetadata, backgroundColor]);

  const handleSaveImage = () => {
    if (squareImageContent && imageMetadata) {
      const link = document.createElement("a");
      link.href = squareImageContent;
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

  const plausible = usePlausible();

  if (!imageMetadata) {
    return (
      <UploadBox
        title="Create square images with custom backgrounds. Fast and free."
        subtitle="Allows pasting images from clipboard"
        description="Upload Image"
        accept="image/*"
        onChange={handleFileUploadEvent}
      />
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-6 p-6">
      <div className="flex w-full flex-col items-center gap-4 rounded-xl p-6">
        {squareImageContent && (
          <img src={squareImageContent} alt="Preview" className="mb-4" />
        )}
        <p className="text-lg font-medium text-white/80">
          {imageMetadata.name}
        </p>
      </div>

      <div className="flex gap-6 text-base">
        <div className="flex flex-col items-center rounded-lg bg-white/5 p-3">
          <span className="text-sm text-white/60">Original</span>
          <span className="font-medium text-white">
            {imageMetadata.width} × {imageMetadata.height}
          </span>
        </div>

        <div className="flex flex-col items-center rounded-lg bg-white/5 p-3">
          <span className="text-sm text-white/60">Square Size</span>
          <span className="font-medium text-white">
            {Math.max(imageMetadata.width, imageMetadata.height)} ×{" "}
            {Math.max(imageMetadata.width, imageMetadata.height)}
          </span>
        </div>
      </div>

      <OptionSelector
        title="Background Color"
        options={["white", "black", "accent"]}
        selected={backgroundColor}
        onChange={setBackgroundColor}
        formatOption={(option) =>
          option.charAt(0).toUpperCase() + option.slice(1)
        }
      />

      <div className="flex gap-3">
        <button
          onClick={cancel}
          className="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white/90 transition-colors hover:bg-red-800"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            plausible("create-square-image");
            handleSaveImage();
          }}
          className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white shadow-md transition-colors duration-200 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
        >
          Save Image
        </button>
      </div>
    </div>
  );
}

export function SquareTool() {
  const fileUploaderProps = useFileUploader();

  return (
    <FileDropzone
      setCurrentFile={fileUploaderProps.handleFileUpload}
      acceptedFileTypes={["image/*", ".jpg", ".jpeg", ".png", ".webp", ".svg"]}
      dropText="Drop image file"
    >
      <SquareToolCore fileUploaderProps={fileUploaderProps} />
    </FileDropzone>
  );
}
