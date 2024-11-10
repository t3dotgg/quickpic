"use client";

import React, { useState, useEffect, type ChangeEvent } from "react";
import { usePlausible } from "next-plausible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button, buttonVariants } from "@/components/ui/button";
import { ChevronsUpDown, PaintBucket } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocalStorage } from "@/hooks/use-local-storage";

export const SquareTool: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [backgroundColor, setBackgroundColor] = useLocalStorage<
    "black" | "white"
  >("squareTool_backgroundColor", "white");

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
          <label
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "cursor-pointer",
            )}
          >
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

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              backgroundColor === "white"
                ? "bg-neutral-200 text-black hover:bg-neutral-100 hover:text-black"
                : "bg-neutral-700 text-white hover:bg-neutral-600 hover:text-white",
            )}
          >
            <div
              className={cn(
                "flex items-center",
                backgroundColor === "white"
                  ? "text-neutral-600"
                  : "text-neutral-400",
              )}
            >
              <PaintBucket className="mr-2 h-4 w-4" />
              Background color:
            </div>
            {backgroundColor === "white" ? "White" : "Black"}
            <ChevronsUpDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setBackgroundColor("white")}>
            White
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setBackgroundColor("black")}>
            Black
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex gap-2">
        <Button
          onClick={() => {
            plausible("create-square-image");
            handleSaveImage();
          }}
        >
          Save Image
        </Button>
        <Button
          onClick={() => {
            setImageFile(null);
            setPreviewUrl(null);
            setCanvasDataUrl(null);
            setImageMetadata(null);
          }}
          variant="destructive"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};
