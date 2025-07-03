"use client";
import { usePlausible } from "next-plausible";
import { useEffect, useState } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";

import { UploadBox } from "@/components/shared/upload-box";
import { SVGScaleSelector } from "@/components/svg-scale-selector";

export type Scale = "custom" | number;

function useSvgConverter(props: {
  canvas: HTMLCanvasElement | null;
  imageBlobUrl: string;
  scale: number;
  imageMetadata: { width: number; height: number; name: string };
}) {
  const width = props.imageMetadata.width * props.scale,
    height = props.imageMetadata.height * props.scale;

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

    // Trigger a "save image" of the resulting canvas content
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
      const svgFileName = props.imageMetadata.name;

      // Remove the .svg extension
      link.download = `${svgFileName.replace(".svg", "")}-${props.scale}x.png`;
      link.click();
    };

    const img = new Image();
    // Call saveImage after the image has been drawn
    img.onload = () => {
      ctx.clearRect(
        0,
        0,
        props.canvas?.width ?? width,
        props.canvas?.height ?? height,
      );
      ctx.drawImage(img, 0, 0, width, height);
      void saveImage();
    };

    img.src = props.imageBlobUrl;
  };

  return {
    convertToPng,
    canvasProps: { width: width, height: height },
  };
}

function SaveAsPngButton({
  imageBlobUrl,
  scale,
  imageMetadata,
}: {
  imageBlobUrl: string;
  scale: number;
  imageMetadata: { width: number; height: number; name: string };
}) {
  const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null);
  const { convertToPng, canvasProps } = useSvgConverter({
    canvas: canvasRef,
    imageBlobUrl,
    scale,
    imageMetadata,
  });

  const plausible = usePlausible();

  return (
    <div>
      <canvas ref={setCanvasRef} {...canvasProps} hidden />
      <button
        onClick={() => {
          plausible("convert-svg-to-png");
          void convertToPng();
        }}
        className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white shadow-md transition-colors duration-200 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
      >
        Save as PNG
      </button>
    </div>
  );
}

import {
  type FileUploaderResult,
  useFileUploader,
} from "@/hooks/use-file-uploader";
import { FileDropzone } from "@/components/shared/file-dropzone";

function SVGToolCore(props: { fileUploaderProps: FileUploaderResult }) {
  const { imageMetadata, imageBlobUrl, handleFileUploadEvent, cancel } =
    props.fileUploaderProps;

  const [scale, setScale] = useLocalStorage<Scale>("svgTool_scale", 1);
  const [customScale, setCustomScale] = useLocalStorage<number>(
    "svgTool_customScale",
    1,
  );

  // Get the actual numeric scale value
  const effectiveScale = scale === "custom" ? customScale : scale;

  if (!imageMetadata)
    return (
      <UploadBox
        title="Make SVGs into PNGs. Also makes them bigger. (100% free btw.)"
        description="Upload SVG"
        accept=".svg"
        onChange={handleFileUploadEvent}
      />
    );

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-6 p-6">
      {/* Preview Section */}
      <div className="flex w-full flex-col items-center gap-4 rounded-xl p-6">
        <div>
          <img
            alt=""
            src={imageBlobUrl ?? undefined}
            className="h-full w-full"
          ></img>
        </div>
        <p className="text-lg font-medium text-white/80">
          {imageMetadata.name}
        </p>
      </div>

      {/* Size Information */}
      <div className="flex gap-6 text-base">
        <div className="flex flex-col items-center rounded-lg bg-white/5 p-3">
          <span className="text-sm text-white/60">Original</span>
          <span className="font-medium text-white">
            {imageMetadata.width} × {imageMetadata.height}
          </span>
        </div>

        <div className="flex flex-col items-center rounded-lg bg-white/5 p-3">
          <span className="text-sm text-white/60">Scaled</span>
          <span className="font-medium text-white">
            {imageMetadata.width * effectiveScale} ×{" "}
            {imageMetadata.height * effectiveScale}
          </span>
        </div>
      </div>

      {/* Scale Controls */}
      <SVGScaleSelector
        title="Scale Factor"
        options={[1, 2, 4, 8, 16, 32, 64]}
        selected={scale}
        onChange={setScale}
        customValue={customScale}
        onCustomValueChange={setCustomScale}
      />

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={cancel}
          className="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white/90 transition-colors hover:bg-red-800"
        >
          Cancel
        </button>
        <SaveAsPngButton
          imageBlobUrl={imageBlobUrl ?? ""}
          scale={effectiveScale}
          imageMetadata={imageMetadata}
        />
      </div>
    </div>
  );
}

export function SVGTool() {
  const fileUploaderProps = useFileUploader();
  return (
    <FileDropzone
      setCurrentFile={fileUploaderProps.handleFileUpload}
      acceptedFileTypes={["image/svg+xml", ".svg"]}
      dropText="Drop SVG file"
    >
      <SVGToolCore fileUploaderProps={fileUploaderProps} />
    </FileDropzone>
  );
}
