"use client";
import { usePlausible } from "next-plausible";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { UploadBox } from "@/components/shared/upload-box";
import { OptionSelector } from "@/components/shared/option-selector";
import { BorderRadiusSelector } from "@/components/border-radius-selector";
import {
  useFileUploader,
  type FileUploaderResult,
} from "@/hooks/use-file-uploader";
import { FileDropzone } from "@/components/shared/file-dropzone";
import { motion } from "framer-motion";

type Radius = number;

type BackgroundOption = "white" | "black" | "transparent";

function useImageConverter(props: {
  canvas: HTMLCanvasElement | null;
  imageContent: string;
  radius: Radius;
  background: BackgroundOption;
  fileName?: string;
  imageMetadata: { width: number; height: number; name: string };
}) {
  const { width, height } = useMemo(() => {
    return {
      width: props.imageMetadata.width,
      height: props.imageMetadata.height,
    };
  }, [props.imageMetadata]);

  const convertToPng = async () => {
    const ctx = props.canvas?.getContext("2d");
    if (!ctx) throw new Error("Failed to get canvas context");

    const saveImage = () => {
      if (props.canvas) {
        const dataURL = props.canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = dataURL;
        const imageFileName = props.imageMetadata.name ?? "image_converted";
        link.download = `${imageFileName.replace(/\..+$/, "")}.png`;
        link.click();
      }
    };

    const img = new Image();
    img.onload = () => {
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
      saveImage();
    };

    img.src = props.imageContent;
  };

  return {
    convertToPng,
    canvasProps: { width: width, height: height },
  };
}

interface ImageRendererProps {
  imageContent: string;
  radius: Radius;
  background: BackgroundOption;
}

const ImageRenderer = ({
  imageContent,
  radius,
  background,
}: ImageRendererProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const imgElement = containerRef.current.querySelector("img");
      if (imgElement) {
        imgElement.style.borderRadius = `${radius}px`;
      }
    }
  }, [imageContent, radius]);

  return (
    <div
      ref={containerRef}
      className="relative flex w-[500px] items-center justify-center"
    >
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ backgroundColor: background, borderRadius: radius }}
      />
      <img
        src={imageContent}
        alt="Preview"
        className="relative max-w-[260px] rounded-lg"
        style={{ width: "100%", height: "auto", objectFit: "contain" }}
      />
    </div>
  );
};

function SaveAsPngButton({
  imageContent,
  radius,
  background,
  imageMetadata,
}: {
  imageContent: string;
  radius: Radius;
  background: BackgroundOption;
  imageMetadata: { width: number; height: number; name: string };
}) {
  const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null);
  const { convertToPng, canvasProps } = useImageConverter({
    canvas: canvasRef,
    imageContent,
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
        className="rounded-lg bg-purple-700 px-4 py-2 text-sm font-semibold text-white shadow-md transition-colors duration-200 hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
      >
        Save as PNG
      </button>
    </div>
  );
}

function RoundedToolCore(props: { fileUploaderProps: FileUploaderResult }) {
  const { imageContent, imageMetadata, handleFileUploadEvent, cancel } =
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

  if (!imageMetadata) {
    return (
      <UploadBox
        title="round your Image's border"
        subtitle="Allows pasting images from clipboard"
        description="Upload Image"
        accept="image/*"
        onChange={handleFileUploadEvent}
      />
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-3 rounded-xl border bg-gray-400/5 p-3 backdrop-blur-3xl">
      <div className="flex w-full flex-col items-center gap-4 rounded-xl p-6">
        <ImageRenderer
          imageContent={imageContent}
          radius={radius}
          background={background}
        />
        <p className="rounded-full bg-purple-800 px-3 py-1 text-lg font-medium text-white">
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
          className="rounded-lg border-2 border-red-600 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-600 hover:text-white"
        >
          Cancel
        </button>
        <SaveAsPngButton
          imageContent={imageContent}
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
        <RoundedToolCore fileUploaderProps={fileUploaderProps} />
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
