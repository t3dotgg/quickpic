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
import { motion } from "framer-motion";

function SquareToolCore(props: { fileUploaderProps: FileUploaderResult }) {
  const { imageContent, imageMetadata, handleFileUploadEvent, cancel } =
    props.fileUploaderProps;

  const [backgroundColor, setBackgroundColor] = useLocalStorage<
    "black" | "white"
  >("squareTool_backgroundColor", "white");

  const [squareImageContent, setSquareImageContent] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (imageContent && imageMetadata) {
      const canvas = document.createElement("canvas");
      const size = Math.max(imageMetadata.width, imageMetadata.height);
      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Fill background
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, size, size);

      // Load and center the image
      const img = new Image();
      img.onload = () => {
        const x = (size - imageMetadata.width) / 2;
        const y = (size - imageMetadata.height) / 2;
        ctx.drawImage(img, x, y);
        setSquareImageContent(canvas.toDataURL("image/png"));
      };
      img.src = imageContent;
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
        title="Create square images"
        subtitle="Allows pasting images from clipboard"
        description="Upload Image"
        accept="image/*"
        onChange={handleFileUploadEvent}
      />
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-6 rounded-xl border bg-gray-400/5 p-6 backdrop-blur-3xl">
      <div className="flex w-full flex-col items-center gap-4 rounded-xl p-6">
        {squareImageContent && (
          <img
            src={squareImageContent}
            alt="Preview"
            className="mb-4 max-w-[260px]"
          />
        )}
        <p className="rounded-full bg-purple-800 px-3 py-1 text-lg font-medium text-white">
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
        options={["white", "black"]}
        selected={backgroundColor}
        onChange={setBackgroundColor}
        formatOption={(option) =>
          option.charAt(0).toUpperCase() + option.slice(1)
        }
      />

      <div className="flex gap-3">
        <button
          onClick={cancel}
          className="rounded-lg border-2 border-red-600 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-600 hover:text-white"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            plausible("create-square-image");
            handleSaveImage();
          }}
          className="rounded-lg bg-purple-700 px-4 py-2 text-sm font-semibold text-white shadow-md transition-colors duration-200 hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
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
    <>
      <FileDropzone
        setCurrentFile={fileUploaderProps.handleFileUpload}
        acceptedFileTypes={[
          "image/*",
          ".jpg",
          ".jpeg",
          ".png",
          ".webp",
          ".svg",
        ]}
        dropText="Drop image file"
      >
        <SquareToolCore fileUploaderProps={fileUploaderProps} />
      </FileDropzone>
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          // @ts-expect-error: Framer Motion types are not correct
          className="absolute inset-0 left-[-10%] top-[50%] w-1/2 rounded-full bg-gradient-to-br from-purple-800 to-purple-600 opacity-50 blur-[250px]"
          animate={{
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
    </>
  );
}
