"use client";
import { usePlausible } from "next-plausible";
import { useMemo, useState, useRef, useCallback } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";

import { type ChangeEvent } from "react";

type Scale = 1 | 2 | 4 | 8 | 16 | 32 | 64;

function scaleSvg(svgContent: string, scale: Scale) {
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
  scale: Scale;
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

export const useFileUploader = () => {
  const [svgContent, setSvgContent] = useState<string>("");
  const [imageMetadata, setImageMetadata] = useState<{
    width: number;
    height: number;
    name: string;
    newName?: string;
  } | null>(null);

  const handleFileUpload = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const content = await file.text();
      setSvgContent(content);

      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(content, "image/svg+xml");
      const svgElement = svgDoc.documentElement;

      const width = parseInt(svgElement.getAttribute("width") ?? "300");
      const height = parseInt(svgElement.getAttribute("height") ?? "150");

      setImageMetadata({
        width,
        height,
        name: file.name,
        newName: file.name.replace(/\.svg$/i, ""),
      });
    },
    [],
  );

  const cancel = useCallback(() => {
    setSvgContent("");
    setImageMetadata(null);
  }, []);

  return {
    svgContent,
    imageMetadata,
    handleFileUpload,
    cancel,
    updateFileName: (newName: string) => {
      setImageMetadata((prev) => prev ? { ...prev, newName } : null);
    },
  };
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
  imageMetadata: { width: number; height: number; name: string; newName?: string };
}) {
  const [fileName, setFileName] = useState(
    imageMetadata.newName ?? imageMetadata.name.replace(/\.svg$/i, "")
  );
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const plausible = usePlausible();

  const { convertToPng, canvasProps } = useSvgConverter({
    canvas: canvasRef.current,
    svgContent,
    scale,
    fileName,
    imageMetadata,
  });

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          className="rounded border border-gray-600 bg-transparent p-2 text-foreground"
          placeholder="Enter file name"
        />
        <span className="text-gray-400">-{scale}x.png</span>
      </div>
      
      <button
        onClick={() => {
          plausible("convert-svg");
          void convertToPng();
        }}
        className="rounded-md bg-blue-600 px-3 py-1 text-sm font-medium text-white transition-colors hover:bg-blue-700"
      >
        Save as PNG
      </button>
      <canvas ref={canvasRef} {...canvasProps} className="hidden" />
    </div>
  );
}

export function SVGTool() {
  const { svgContent, imageMetadata, handleFileUpload, cancel, updateFileName } =
    useFileUploader();
  const [scale, setScale] = useLocalStorage<Scale>("svgTool_scale", 1);

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
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={imageMetadata?.newName ?? imageMetadata?.name ?? ""}
          onChange={(e) => updateFileName(e.target.value)}
          className="rounded border border-gray-600 bg-transparent p-2 text-foreground"
          placeholder="Enter file name"
        />
        <span className="text-gray-400">.svg</span>
      </div>
      <p>
        Original size: {imageMetadata?.width}px x {imageMetadata?.height}px
      </p>
      <p>
        Scaled size: {imageMetadata?.width && imageMetadata.width * scale}px x{" "}
        {imageMetadata?.height && imageMetadata.height * scale}px
      </p>
      <div className="flex gap-2">
        {([1, 2, 4, 8, 16, 32, 64] as Scale[]).map((value) => (
          <button
            key={value}
            onClick={() => setScale(value)}
            className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
              scale === value
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            {value}x
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <SaveAsPngButton
          svgContent={svgContent}
          scale={scale}
          imageMetadata={imageMetadata!}
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
