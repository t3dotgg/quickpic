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
import { Button } from "@/components/ui/button";
import Paragraph from "@/components/paragraph";

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
        title="Square Image Creator"
        subtitle={`Create square images with custom backgrounds. Fast and free.
          Allows pasting images from clipboard`}
        description="Upload Image"
        accept="image/*"
        onChange={handleFileUploadEvent}
      />
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-6 px-6 py-10">
      <div className="flex w-full flex-col items-center gap-4 rounded-xl p-6">
        {squareImageContent && (
          <img src={squareImageContent} alt="Preview" className="mb-4" />
        )}
        <Paragraph className="text-xs">{imageMetadata.name}</Paragraph>
      </div>

      <div className="flex gap-6 text-xs">
        <div className="flex flex-col items-center gap-[6px] rounded-lg bg-white/10 px-4 py-3 backdrop-blur-sm">
          <span className="paragraph opacity-80">Original</span>
          <span className="font-medium text-white">
            {imageMetadata.width} × {imageMetadata.height}
          </span>
        </div>

        <div className="flex flex-col items-center gap-[6px] rounded-lg bg-white/10 px-4 py-3 backdrop-blur-sm">
          <span className="paragraph opacity-80">Square Size</span>
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
        <Button
          onClick={cancel}
          className="border-t-2 border-red-400 bg-gradient-to-t from-red-500 to-red-600 hover:border-t-red-500 hover:from-red-600 hover:to-red-700"
        >
          Cancel
        </Button>
        <Button
          onClick={() => {
            plausible("create-square-image");
            handleSaveImage();
          }}
        >
          Save Image
        </Button>
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
