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

type Radius = number;

type BackgroundOption = "white" | "black" | "transparent";
type ShapeOption = "rounded" | "circle";

function useImageConverter(props: {
  canvas: HTMLCanvasElement | null;
  imageContent: string;
  radius: Radius;
  shapeOption: ShapeOption;
  background: BackgroundOption;
  fileName?: string;
  imageMetadata: { width: number; height: number; name: string };
}) {
  const { width, height, offsetX, offsetY } = useMemo(() => {
    if (props.shapeOption === "circle") {
      const size = Math.min(
        props.imageMetadata.width,
        props.imageMetadata.height,
      );
      const offsetX = (props.imageMetadata.width - size) / 2;
      const offsetY = (props.imageMetadata.height - size) / 2;
      return { width: size, height: size, offsetX, offsetY };
    } else {
      return {
        width: props.imageMetadata.width,
        height: props.imageMetadata.height,
        offsetX: 0,
        offsetY: 0,
      };
    }
  }, [props.imageMetadata, props.shapeOption]);

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
      props.canvas!.width = width;
      props.canvas!.height = height;

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = props.background;
      ctx.fillRect(0, 0, width, height);

      if (props.shapeOption === "circle") {
        ctx.save();
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, width / 2, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.clip();

        ctx.drawImage(
          img,
          offsetX,
          offsetY,
          width,
          height,
          0,
          0,
          width,
          height,
        );
        ctx.restore();
      } else {
        const radius = props.radius;
        ctx.beginPath();
        ctx.moveTo(radius, 0);
        ctx.lineTo(width - radius, 0);
        ctx.quadraticCurveTo(width, 0, width, radius);
        ctx.lineTo(width, height - radius);
        ctx.quadraticCurveTo(width, height, width - radius, height);
        ctx.lineTo(radius, height);
        ctx.quadraticCurveTo(0, height, 0, height - radius);
        ctx.lineTo(0, radius);
        ctx.quadraticCurveTo(0, 0, radius, 0);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, 0, 0, width, height);
      }
      saveImage();
    };

    img.src = props.imageContent;
  };

  return {
    convertToPng,
    canvasProps: { width, height },
  };
}

interface ImageRendererProps {
  imageContent: string;
  radius: Radius;
  shapeOption: ShapeOption;
  background: BackgroundOption;
}

const ImageRenderer = ({
  imageContent,
  radius,
  shapeOption,
  background,
}: ImageRendererProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const imgElement = containerRef.current.querySelector("img");
      if (imgElement) {
        if (shapeOption === "circle") {
          imgElement.style.borderRadius = "50%";
          imgElement.style.objectFit = "cover";
          imgElement.style.width = "100%";
          imgElement.style.height = "100%";
        } else {
          imgElement.style.borderRadius = `${radius}px`;
          imgElement.style.objectFit = "contain";
          imgElement.style.width = "100%";
          imgElement.style.height = "auto";
        }
      }
    }
  }, [imageContent, radius, shapeOption]);

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{
        width: shapeOption === "circle" ? "280px" : "500px",
        height: shapeOption === "circle" ? "280px" : "auto",
        backgroundColor: background !== "transparent" ? background : undefined,
      }}
    >
      <img
        src={imageContent}
        alt="Preview"
        className="relative"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};

function SaveAsPngButton({
  imageContent,
  radius,
  shapeOption,
  background,
  imageMetadata,
}: {
  imageContent: string;
  radius: Radius;
  shapeOption: ShapeOption;
  background: BackgroundOption;
  imageMetadata: { width: number; height: number; name: string };
}) {
  const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null);
  const { convertToPng, canvasProps } = useImageConverter({
    canvas: canvasRef,
    imageContent,
    radius,
    shapeOption,
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
  const { imageContent, imageMetadata, handleFileUploadEvent, cancel } =
    props.fileUploaderProps;
  const [radius, setRadius] = useLocalStorage<Radius>("roundedTool_radius", 2);
  const [isCustomRadius, setIsCustomRadius] = useState(false);
  const [background, setBackground] = useLocalStorage<BackgroundOption>(
    "roundedTool_background",
    "transparent",
  );
  const [shapeOption, setShapeOption] = useState<ShapeOption>("rounded");

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
        title="Add rounded borders to your images. Quick and easy."
        subtitle="Allows pasting images from clipboard"
        description="Upload Image"
        accept="image/*"
        onChange={handleFileUploadEvent}
      />
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-4 p-4">
      <div className="flex w-full flex-col items-center gap-4 rounded-xl p-4">
        <ImageRenderer
          imageContent={imageContent}
          radius={radius}
          shapeOption={shapeOption}
          background={background}
        />
        <p className="text-lg font-medium text-white/80">
          {imageMetadata.name}
        </p>
      </div>

      <div className="flex flex-col items-center rounded-lg bg-white/5 p-3">
        <span className="text-sm text-white/60">
          {shapeOption === "circle" ? "Cropped Size" : "Original Size"}
        </span>
        <span className="font-medium text-white">
          {shapeOption === "circle"
            ? `${Math.min(imageMetadata.width, imageMetadata.height)} × ${Math.min(
                imageMetadata.width,
                imageMetadata.height,
              )}`
            : `${imageMetadata.width} × ${imageMetadata.height}`}
        </span>
      </div>

      <OptionSelector
        title="Pick Your Shape"
        options={["Rounded Edges", "Circle"]}
        selected={shapeOption === "circle" ? "Circle" : "Rounded Edges"}
        onChange={(option) =>
          setShapeOption(option === "Circle" ? "circle" : "rounded")
        }
        formatOption={(option) => option}
      />
      {shapeOption === "rounded" && (
        <BorderRadiusSelector
          title="Border Radius"
          options={[2, 4, 8, 16, 32, 64]}
          selected={isCustomRadius ? "custom" : radius}
          onChange={handleRadiusChange}
          customValue={radius}
          onCustomValueChange={setRadius}
        />
      )}

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
          imageContent={imageContent}
          radius={radius}
          shapeOption={shapeOption}
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
