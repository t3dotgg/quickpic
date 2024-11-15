"use client";
import { usePlausible } from "next-plausible";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";

import { UploadBox } from "@/components/shared/upload-box";
import { SVGScaleSelector } from "@/components/svg-scale-selector";

export type Scale = "custom" | number;

function scaleSvg(svgContent: string, scale: number) {
  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(svgContent, "image/svg+xml");
  const svgElement = svgDoc.documentElement;
  const width = parseInt(svgElement.getAttribute("width") ?? "300");
  const height = parseInt(svgElement.getAttribute("height") ?? "150");

  const scaledWidth = width * scale;
  const scaledHeight = height * scale;

  svgElement.setAttribute("width", scaledWidth.toString());
  svgElement.setAttribute("height", scaledHeight.toString());

  return new XMLSerializer().serializeToString(svgDoc);
}

function useSvgConverter(props: {
  canvas: HTMLCanvasElement | null;
  svgContent: string;
  scale: number;
  fileName?: string;
  imageMetadata: { width: number; height: number; name: string };
}) {
  const { width, height, scaledSvg } = useMemo(() => {
    const scaledSvg = scaleSvg(props.svgContent, props.scale);

    return {
      width: props.imageMetadata.width * props.scale,
      height: props.imageMetadata.height * props.scale,
      scaledSvg,
    };
  }, [props.svgContent, props.scale, props.imageMetadata]);

  const convertToPng = async () => {
    const ctx = props.canvas?.getContext("2d");
    if (!ctx) throw new Error("Failed to get canvas context");

    // Trigger a "save image" of the resulting canvas content
    const saveImage = () => {
      if (props.canvas) {
        const dataURL = props.canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = dataURL;
        const svgFileName = props.imageMetadata.name ?? "svg_converted";

        // Remove the .svg extension
        link.download = `${svgFileName.replace(".svg", "")}-${props.scale}x.png`;
        link.click();
      }
    };

    const img = new Image();
    // Call saveImage after the image has been drawn
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      saveImage();
    };

    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(scaledSvg)}`;
  };

  return {
    convertToPng,
    canvasProps: { width: width, height: height },
  };
}

interface SVGRendererProps {
  svgContent: string;
}

function SVGRenderer({ svgContent }: SVGRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = svgContent;
      const svgElement = containerRef.current.querySelector("svg");
      if (svgElement) {
        svgElement.setAttribute("width", "100%");
        svgElement.setAttribute("height", "100%");
      }
    }
  }, [svgContent]);

  return <div ref={containerRef} />;
}

function SaveAsPngButton({
  svgContent,
  scale,
  imageMetadata,
}: {
  svgContent: string;
  scale: number;
  imageMetadata: { width: number; height: number; name: string };
}) {
  const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null);
  const { convertToPng, canvasProps } = useSvgConverter({
    canvas: canvasRef,
    svgContent,
    scale,
    imageMetadata,
  });

  const plausible = usePlausible();

  return (
    <div>
      <canvas ref={setCanvasRef} {...canvasProps} hidden />
      <Button
        onClick={() => {
          plausible("convert-svg-to-png");
          void convertToPng();
        }}
      >
        Save as PNG
      </Button>
    </div>
  );
}

import {
  type FileUploaderResult,
  useFileUploader,
} from "@/hooks/use-file-uploader";
import { FileDropzone } from "@/components/shared/file-dropzone";
import Paragraph from "@/components/paragraph";
import { Button } from "@/components/ui/button";

function SVGToolCore(props: { fileUploaderProps: FileUploaderResult }) {
  const { rawContent, imageMetadata, handleFileUploadEvent, cancel } =
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
        title="SVG to PNG Converter"
        subtitle="Make SVGs into PNGs. Also makes them bigger. (100% free btw.)"
        description="Upload SVG"
        accept=".svg"
        onChange={handleFileUploadEvent}
      />
    );

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-6 px-6 py-10">
      {/* Preview Section */}
      <div className="flex w-full flex-col items-center gap-4 rounded-xl p-6">
        <SVGRenderer svgContent={rawContent} />
        <Paragraph className="text-xs">{imageMetadata.name}</Paragraph>
      </div>

      {/* Size Information */}
      <div className="flex gap-6 text-xs">
        <div className="flex flex-col items-center gap-[6px] rounded-lg bg-white/10 px-4 py-3 backdrop-blur-sm">
          <span className="paragraph opacity-80">Original</span>
          <span className="font-medium text-white">
            {imageMetadata.width} × {imageMetadata.height}
          </span>
        </div>

        <div className="flex flex-col items-center gap-[6px] rounded-lg bg-white/10 px-4 py-3 backdrop-blur-sm">
          <span className="paragraph opacity-80">Scaled</span>
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
        <Button
          onClick={cancel}
          className="border-t-2 border-red-400 bg-gradient-to-t from-red-500 to-red-600 hover:border-t-red-500 hover:from-red-600 hover:to-red-700"
        >
          Cancel
        </Button>
        <SaveAsPngButton
          svgContent={rawContent}
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
