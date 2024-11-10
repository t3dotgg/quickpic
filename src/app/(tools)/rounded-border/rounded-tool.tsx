"use client";
import { usePlausible } from "next-plausible";
import { useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import React from "react";
import { UploadBox } from "@/components/shared/upload-box";
import { OptionSelector } from "@/components/shared/option-selector";

type Radius = 2 | 4 | 8 | 16 | 32 | 64;

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

export const useFileUploader = () => {
  const [imageContent, setImageContent] = useState<string>("");

  const [imageMetadata, setImageMetadata] = useState<{
    width: number;
    height: number;
    name: string;
  } | null>(null);

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          setImageMetadata({
            width: img.width,
            height: img.height,
            name: file.name,
          });
          setImageContent(content);
        };
        img.src = content;
      };
      reader.readAsDataURL(file);
    }
  };

  const cancel = () => {
    setImageContent("");
    setImageMetadata(null);
  };

  return { imageContent, imageMetadata, handleFileUpload, cancel };
};

interface ImageRendererProps {
  imageContent: string;
  radius: Radius;
  background: BackgroundOption;
}

const ImageRenderer: React.FC<ImageRendererProps> = ({
  imageContent,
  radius,
  background,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (containerRef.current) {
      const imgElement = containerRef.current.querySelector("img");
      if (imgElement) {
        imgElement.style.borderRadius = `${radius}px`;
      }
    }
  }, [imageContent, radius]);

  return (
    <div ref={containerRef} className="relative max-h-full max-w-full">
      <div
        className="absolute inset-0"
        style={{ backgroundColor: background, borderRadius: 0 }}
      />
      <img
        src={imageContent}
        alt="Preview"
        className="relative rounded-lg"
        style={{ width: "100%", height: "auto" }}
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
  const [canvasRef, setCanvasRef] = React.useState<HTMLCanvasElement | null>(
    null,
  );
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
        className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white shadow-md transition-colors duration-200 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
      >
        Save as PNG
      </button>
    </div>
  );
}

export function RoundedTool() {
  const { imageContent, imageMetadata, handleFileUpload, cancel } =
    useFileUploader();

  const [radius, setRadius] = useLocalStorage<Radius>("roundedTool_radius", 2);
  const [background, setBackground] = useLocalStorage<BackgroundOption>(
    "roundedTool_background",
    "transparent",
  );

  if (!imageMetadata) {
    return (
      <UploadBox
        title="Add rounded borders to your images. Quick and easy."
        description="Upload Image"
        accept="image/*"
        onChange={handleFileUpload}
      />
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-6 p-6">
      <div className="flex w-full flex-col items-center gap-4 rounded-xl p-6">
        <ImageRenderer
          imageContent={imageContent}
          radius={radius}
          background={background}
        />
        <p className="text-lg font-medium text-white/80">{imageMetadata.name}</p>
      </div>

      <div className="flex flex-col items-center rounded-lg bg-white/5 p-3">
        <span className="text-sm text-white/60">Original Size</span>
        <span className="font-medium text-white">
          {imageMetadata.width} × {imageMetadata.height}
        </span>
      </div>

      <OptionSelector
        title="Border Radius"
        options={[2, 4, 8, 16, 32, 64]}
        selected={radius}
        onChange={setRadius}
        formatOption={(value) => `${value}px`}
      />

      <OptionSelector
        title="Background"
        options={["white", "black", "transparent"]}
        selected={background}
        onChange={setBackground}
        formatOption={(option) => option.charAt(0).toUpperCase() + option.slice(1)}
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
          background={background}
          imageMetadata={imageMetadata}
        />
      </div>
    </div>
  );
}
