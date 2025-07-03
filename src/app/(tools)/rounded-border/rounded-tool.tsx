"use client";
import { usePlausible } from "next-plausible";
import { useEffect, useRef, useState } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { UploadBox } from "@/components/shared/upload-box";
import { OptionSelector } from "@/components/shared/option-selector";
import { BorderRadiusSelector } from "@/components/border-radius-selector";
import {
  useFileUploader,
  type FileUploaderResult,
} from "@/hooks/use-file-uploader";
import { FileDropzone } from "@/components/shared/file-dropzone";

type Radius = number;

type BackgroundOption = "white" | "black" | "transparent";

function useImageConverter(props: {
  canvas: HTMLCanvasElement | null;
  imageBlobUrl: string;
  radius: Radius;
  background: BackgroundOption;
  fileName?: string;
  imageMetadata: { width: number; height: number; name: string };
}) {
  const { width, height } = props.imageMetadata;

  // Store blob URL to clean it up later
  const [usedCanvasBlobUrl, setUsedCanvasBlobUrl] = useState<string | null>(
    null,
  );
  useEffect(
    () => () => {
      if (usedCanvasBlobUrl) URL.revokeObjectURL(usedCanvasBlobUrl);
    },
    [usedCanvasBlobUrl],
  );

  const convertToPng = async () => {
    const ctx = props.canvas?.getContext("2d");
    if (!ctx) throw new Error("Failed to get canvas context");

    const saveImage = async () => {
      const canvasBlob = await new Promise<Blob>((resolve, reject) => {
        if (props.canvas) {
          props.canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else reject(new Error("Canvas blob could not be created"));
          });
        } else reject(new Error("Canvas not present"));
      });
      const canvasBlobUrl = URL.createObjectURL(canvasBlob);
      setUsedCanvasBlobUrl(canvasBlobUrl);
      const link = document.createElement("a");
      link.href = canvasBlobUrl;
      const imageFileName = props.imageMetadata.name ?? "image_converted";
      link.download = `${imageFileName.replace(/\..+$/, "")}.png`;
      link.click();
    };

    const img = new Image();
    img.onload = () => {
      ctx.save();
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = props.background;
      ctx.fillRect(0, 0, width, height);
      ctx.beginPath();
      ctx.moveTo(props.radius, 0);
      ctx.lineTo(width - props.radius, 0);
      ctx.quadraticCurveTo(width, 0, width, props.radius);
      ctx.lineTo(width, height - props.radius);
      ctx.quadraticCurveTo(width, height, width - props.radius, height);
      ctx.lineTo(props.radius, height);
      ctx.quadraticCurveTo(0, height, 0, height - props.radius);
      ctx.lineTo(0, props.radius);
      ctx.quadraticCurveTo(0, 0, props.radius, 0);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, 0, 0, width, height);
      ctx.restore();
      void saveImage();
    };

    img.src = props.imageBlobUrl;
  };

  return {
    convertToPng,
    canvasProps: { width: width, height: height },
  };
}

interface ImageRendererProps {
  imageBlobUrl: string;
  radius: Radius;
  background: BackgroundOption;
}

const ImageRenderer = ({
  imageBlobUrl,
  radius,
  background,
}: ImageRendererProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="relative w-[500px]">
      <div
        className="absolute inset-0"
        style={{ backgroundColor: background, borderRadius: 0 }}
      />
      <img
        src={imageBlobUrl}
        alt="Preview"
        className="relative rounded-lg"
        style={{
          width: "100%",
          height: "auto",
          objectFit: "contain",
          borderRadius: `${radius}px`,
        }}
      />
    </div>
  );
};

function SaveAsPngButton({
  imageBlobUrl,
  radius,
  background,
  imageMetadata,
}: {
  imageBlobUrl: string;
  radius: Radius;
  background: BackgroundOption;
  imageMetadata: { width: number; height: number; name: string };
}) {
  const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null);
  const { convertToPng, canvasProps } = useImageConverter({
    canvas: canvasRef,
    imageBlobUrl,
    radius,
    background,
    imageMetadata,
  });

  const plausible = usePlausible();

  return (
    <div>
      <canvas ref={setCanvasRef} {...canvasProps} hidden />
      <button
        onClick={() => {
          plausible("convert-image-to-png");
          void convertToPng();
        }}
        className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white shadow-md transition-colors duration-200 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
      >
        Save as PNG
      </button>
    </div>
  );
}

function RoundedToolCore(props: { fileUploaderProps: FileUploaderResult }) {
  const { imageBlobUrl, imageMetadata, handleFileUploadEvent, cancel } =
    props.fileUploaderProps;
  const [radius, setRadius] = useLocalStorage<Radius>("roundedTool_radius", 2);
  const [isCustomRadius, setIsCustomRadius] = useState(false);
  const [background, setBackground] = useLocalStorage<BackgroundOption>(
    "roundedTool_background",
    "transparent",
  );

  const handleRadiusChange = (value: number | "custom") => {
    if (value === "custom") {
      setIsCustomRadius(true);
    } else {
      setRadius(value);
      setIsCustomRadius(false);
    }
  };

  if (!imageMetadata || !imageBlobUrl) {
    return (
      <UploadBox
        title="Add rounded borders to your images. Quick and easy."
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
        <ImageRenderer
          imageBlobUrl={imageBlobUrl}
          radius={radius}
          background={background}
        />
        <p className="text-lg font-medium text-white/80">
          {imageMetadata.name}
        </p>
      </div>

      <div className="flex flex-col items-center rounded-lg bg-white/5 p-3">
        <span className="text-sm text-white/60">Original Size</span>
        <span className="font-medium text-white">
          {imageMetadata.width} × {imageMetadata.height}
        </span>
      </div>

      <BorderRadiusSelector
        title="Border Radius"
        options={[2, 4, 8, 16, 32, 64]}
        selected={isCustomRadius ? "custom" : radius}
        onChange={handleRadiusChange}
        customValue={radius}
        onCustomValueChange={setRadius}
      />

      <OptionSelector
        title="Background"
        options={["white", "black", "transparent"]}
        selected={background}
        onChange={setBackground}
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
        <SaveAsPngButton
          imageBlobUrl={imageBlobUrl}
          radius={radius}
          background={background}
          imageMetadata={imageMetadata}
        />
      </div>
    </div>
  );
}

export function RoundedTool() {
  const fileUploaderProps = useFileUploader();

  return (
    <FileDropzone
      setCurrentFile={fileUploaderProps.handleFileUpload}
      acceptedFileTypes={["image/*", ".jpg", ".jpeg", ".png", ".webp", ".svg"]}
      dropText="Drop image file"
    >
      <RoundedToolCore fileUploaderProps={fileUploaderProps} />
    </FileDropzone>
  );
}
