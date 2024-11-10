"use client";
import { usePlausible } from "next-plausible";
import { useMemo, useState } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";

import { type ChangeEvent } from "react";

type Scale = 
  | { type: 'preset'; value: 1 | 2 | 4 | 8 | 16 | 32 | 64 }
  | { type: 'custom'; value: number }
  | { type: 'xy'; x: number; y: number };
  
function calculateScaledDimensions(width: number, height: number, scale: Scale) {
  if (scale.type === 'preset' || scale.type === 'custom') {
    return { width: width * scale.value, height: height * scale.value };
  } else if (scale.type === "xy") {
    return { width: scale.x, height: scale.y };
  } else {
    return { width: width, height: height };
  }
}

function scaleSvg(svgContent: string, scale: Scale) {
  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(svgContent, "image/svg+xml");
  const svgElement = svgDoc.documentElement;
  const width = parseInt(svgElement.getAttribute("width") ?? "300");
  const height = parseInt(svgElement.getAttribute("height") ?? "150");


  const { width: scaledWidth, height: scaledHeight } = calculateScaledDimensions(
    width,
    height,
    scale
  );

  svgElement.setAttribute("width", scaledWidth.toString());
  svgElement.setAttribute("height", scaledHeight.toString());

  return new XMLSerializer().serializeToString(svgDoc);
}

function useSvgConverter(props: {
  canvas: HTMLCanvasElement | null;
  svgContent: string;
  scale: Scale;
  fileName?: string;
  imageMetadata: { width: number; height: number; name: string };
}) {
  const { width, height, scaledSvg } = useMemo(() => {
    const scaledSvg = scaleSvg(props.svgContent, props.scale);

    const { width: scaledWidth, height: scaledHeight } = calculateScaledDimensions(
      props.imageMetadata.width,
      props.imageMetadata.height,
      props.scale
    );
  
    return {
      width: scaledWidth,
      height: scaledHeight,
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
        if (props.scale.type === "preset" || props.scale.type === "custom") {
          link.download = `${svgFileName.replace(".svg", "")}-${props.scale.value}x.png`;
        } else if (props.scale.type === "xy") {
          link.download = `${svgFileName.replace(".svg", "")}-${props.scale.x}x${props.scale.y}.png`;
        }
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

export const useFileUploader = () => {
  const [svgContent, setSvgContent] = useState<string>("");

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

        // Extract width and height from SVG content
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(content, "image/svg+xml");
        const svgElement = svgDoc.documentElement;
        const width = parseInt(svgElement.getAttribute("width") ?? "300");
        const height = parseInt(svgElement.getAttribute("height") ?? "150");

        setSvgContent(content);
        setImageMetadata({ width, height, name: file.name });
      };
      reader.readAsText(file);
    }
  };

  const cancel = () => {
    setSvgContent("");
    setImageMetadata(null);
  };

  return { svgContent, imageMetadata, handleFileUpload, cancel };
};

import React from "react";

interface SVGRendererProps {
  svgContent: string;
}

const SVGRenderer: React.FC<SVGRendererProps> = ({ svgContent }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = svgContent;
      const svgElement = containerRef.current.querySelector("svg");
      if (svgElement) {
        svgElement.setAttribute("width", "100%");
        svgElement.setAttribute("height", "auto");
      }
    }
  }, [svgContent]);

  return <div ref={containerRef} />;
};

function SaveAsPngButton({
  svgContent,
  scale,
  imageMetadata,
}: {
  svgContent: string;
  scale: Scale;
  imageMetadata: { width: number; height: number; name: string };
}) {
  const [canvasRef, setCanvasRef] = React.useState<HTMLCanvasElement | null>(
    null,
  );
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

export function SVGTool() {
  const { svgContent, imageMetadata, handleFileUpload, cancel } =
    useFileUploader();

  const [scale, setScale] = useLocalStorage<Scale>("svgTool_scale", { type: "preset", value: 1 });
  const scaledDimensions = useMemo(() => {
    if (!imageMetadata) return { width: 0, height: 0 };
    return calculateScaledDimensions(imageMetadata.width, imageMetadata.height, scale);
  }, [imageMetadata, scale]);

  // Maximum canvas area in most browsers, exceeding will cause the image to be empty.
  // Source: https://stackoverflow.com/a/11585939
  const MAX_TOTAL_PIXELS = 268_435_456;

  if (!imageMetadata)
    return (
      <div className="flex flex-col gap-4 p-4">
        <p className="text-center">
          Make SVGs into PNGs. Also makes them bigger. (100% free btw.)
        </p>
        <div className="flex justify-center">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white shadow-md transition-colors duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75">
            <span>Upload SVG</span>
            <input
              type="file"
              onChange={handleFileUpload}
              accept=".svg"
              className="hidden"
            />
          </label>
        </div>
      </div>
    );

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-4 text-2xl">
      <SVGRenderer svgContent={svgContent} />
      <p>{imageMetadata.name}</p>
      <p>
        Original size: {imageMetadata.width}px x {imageMetadata.height}px
      </p>
      <p>
        Scaled size: {scaledDimensions.width}px x {scaledDimensions.height}px
      </p>
      {scaledDimensions.height * scaledDimensions.width > MAX_TOTAL_PIXELS ? (
        <p className="text-red-500 text-sm text-center">
          Warning: Scaled size is too large for most browsers to scale, this scaling may not work.
        </p>
      ) : null}
      <div className="flex gap-2">
        {([1, 2, 4, 8, 16, 32, 64] as const).map((value) => (
          <button
            key={value}
            onClick={() => setScale({ type: "preset", value })}
            className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
              scale.type === "preset" && scale.value === value
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            {value}x
          </button>
        ))}
        {/* Custom Scale */}
        <input
          type="number"
          min="1"
          step="0.1"
          className={`w-20 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            scale.type === "custom"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
          onChange={(e) => {
            const value = e.target.value;
            if (value === '') {
              setScale({ type: "preset", value: 1 });
            } else {
              const numValue = parseFloat(value);
              if (!isNaN(numValue)) {
                setScale({ type: "custom", value: numValue });
              }
            }
          }}
          value={scale.type === "custom" ? scale.value : ""}
          placeholder="1.0"
        />
      </div>
      <div className="flex gap-2">
        {/* Custom X/Y */}
        {scale.type === "xy" ? (
          <div className="flex gap-2">
            <input
              type="number"
              min="1"
              step="0.1"
              className="w-20 px-3 py-1 rounded-md text-sm font-medium bg-blue-600 text-white"
              onChange={(e) => {
                const value = e.target.value;
                if (value === '') {
                  setScale({ type: "xy", x: 1, y: scale.y });
                } else {
                  const numValue = parseFloat(value);
                  if (!isNaN(numValue)) {
                    setScale({ type: "xy", x: numValue, y: scale.y });
                  }
                }
              }}
              placeholder="X"
            />
            <input
              type="number"
              min="1"
              step="0.1"
              className="w-20 px-3 py-1 rounded-md text-sm font-medium bg-blue-600 text-white"
              onChange={(e) => {
                const value = e.target.value;
                if (value === '') {
                  setScale({ type: "xy", x: scale.x, y: 1 });
                } else {
                  const numValue = parseFloat(value);
                  if (!isNaN(numValue)) {
                    setScale({ type: "xy", x: scale.x, y: numValue });
                  }
                }
              }}
              placeholder="Y"
            />
          </div>
        ) : (
          <button
          onClick={() => setScale({ type: "xy", x: 1, y: 1 })}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
        >
          Custom X/Y
        </button>
        )}
      </div>
      <div className="flex gap-2">
        <SaveAsPngButton
          svgContent={svgContent}
          scale={scale}
          imageMetadata={imageMetadata}
        />
        <button
          onClick={cancel}
          className="rounded-md bg-red-700 px-3 py-1 text-sm font-medium text-white transition-colors hover:bg-red-800"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
