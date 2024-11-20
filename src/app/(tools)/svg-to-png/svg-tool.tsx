"use client";
import { usePlausible } from "next-plausible";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";

import { UploadBox } from "@/components/shared/upload-box";
import { SVGScaleSelector } from "@/components/svg-scale-selector";
import { OptionSelector } from "@/components/option-selector";

export type Scale = "custom" | number;

type ResolutionMode = "scale" | "dimensions";

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
  const { rawContent, imageMetadata, handleFileUploadEvent, cancel } =
    props.fileUploaderProps;

  const [resolutionMode, setResolutionMode] = useLocalStorage<ResolutionMode>(
    "svgTool_resolutionMode",
    "scale"
  );
  const [scale, setScale] = useLocalStorage<Scale>("svgTool_scale", 1);
  const [customScale, setCustomScale] = useLocalStorage<number>(
    "svgTool_customScale",
    1
  );
  const [customWidth, setCustomWidth] = useLocalStorage<number>(
    "svgTool_customWidth",
    imageMetadata?.width ?? 0
  );
  const [customHeight, setCustomHeight] = useLocalStorage<number>(
    "svgTool_customHeight",
    imageMetadata?.height ?? 0
  );

  // Get the actual numeric scale value
  const effectiveScale = scale === "custom" ? customScale : scale;

  // Calculate dimensions based on mode
  const finalDimensions = useMemo(() => {
    if (!imageMetadata) return { width: 0, height: 0 };

    if (resolutionMode === "scale") {
      return {
        width: imageMetadata.width * effectiveScale,
        height: imageMetadata.height * effectiveScale,
      };
    } else {
      return {
        width: customWidth,
        height: customHeight,
      };
    }
  }, [imageMetadata, resolutionMode, effectiveScale, customWidth, customHeight]);

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
        <SVGRenderer svgContent={rawContent} />
        <p className="text-lg font-medium text-white/80">{imageMetadata.name}</p>
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
          <span className="text-sm text-white/60">Output</span>
          <span className="font-medium text-white">
            {Math.round(finalDimensions.width)} × {Math.round(finalDimensions.height)}
          </span>
        </div>
      </div>

      {/* Resolution Mode Selector */}
      <OptionSelector
        title="Resolution Mode"
        options={["scale", "dimensions"]}
        selected={resolutionMode}
        onChange={setResolutionMode}
        formatOption={(option: ResolutionMode) =>
          option === "scale" ? "Scale Factor" : "Custom Dimensions"
        }
      />

      {/* Scale Controls */}
      {resolutionMode === "scale" ? (
        <SVGScaleSelector
          title="Scale Factor"
          options={[1, 2, 4, 8, 16, 32, 64]}
          selected={scale}
          onChange={setScale}
          customValue={customScale}
          onCustomValueChange={setCustomScale}
        />
      ) : (
        <div className="flex flex-col items-center gap-4">
          <span className="text-sm text-white/60">Dimensions (px)</span>
          <div className="flex gap-4">
            <input
              type="number"
              value={customWidth}
              onChange={(e) => setCustomWidth(Math.max(1, parseInt(e.target.value) || 0))}
              className="w-24 rounded-lg bg-white/5 px-3 py-1.5 text-sm text-white"
              placeholder="Width"
            />
            <span className="text-white/60">×</span>
            <input
              type="number"
              value={customHeight}
              onChange={(e) => setCustomHeight(Math.max(1, parseInt(e.target.value) || 0))}
              className="w-24 rounded-lg bg-white/5 px-3 py-1.5 text-sm text-white"
              placeholder="Height"
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={cancel}
          className="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white/90 transition-colors hover:bg-red-800"
        >
          Cancel
        </button>
        <SaveAsPngButton
          svgContent={rawContent}
          scale={resolutionMode === "scale" ? effectiveScale : Math.max(customWidth / imageMetadata.width, customHeight / imageMetadata.height)}
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
