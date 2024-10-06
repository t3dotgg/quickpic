"use client";
import { useMemo, useState } from "react";

import { ChangeEvent } from "react";

type Scale = 1 | 2 | 4 | 8 | 16 | 32 | 64;

function scaleSvg(svgContent: string, scale: Scale) {
  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(svgContent, "image/svg+xml");
  const svgElement = svgDoc.documentElement;
  const width = parseInt(svgElement.getAttribute("width") || "300");
  const height = parseInt(svgElement.getAttribute("height") || "150");

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

  console.log("Is scaling working?", width, height);

  const convertToPng = async () => {
    console.log("CANVAS?", props.canvas);
    const ctx = props.canvas?.getContext("2d");
    if (!ctx) throw new Error("Failed to get canvas context");

    // Trigger a "save image" of the resulting canvas content
    const saveImage = () => {
      if (props.canvas) {
        const dataURL = props.canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = dataURL;
        const svgFileName = props.imageMetadata.name ?? "svg_converted";
        link.download = `${svgFileName}.png`;
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
        const width = parseInt(svgElement.getAttribute("width") || "300");
        const height = parseInt(svgElement.getAttribute("height") || "150");

        setSvgContent(content);
        setImageMetadata({ width, height, name: file.name });
      };
      reader.readAsText(file);
    }
  };

  return { svgContent, imageMetadata, handleFileUpload };
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
    null
  );
  const { convertToPng, canvasProps } = useSvgConverter({
    canvas: canvasRef,
    svgContent,
    scale,
    imageMetadata,
  });

  return (
    <div>
      <canvas ref={setCanvasRef} {...canvasProps} hidden />
      <button onClick={convertToPng}>Save as PNG</button>
    </div>
  );
}

export function SVGTool() {
  const { svgContent, imageMetadata, handleFileUpload } = useFileUploader();

  if (!imageMetadata)
    return (
      <div className="flex flex-col p-4 gap-4">
        <p className="text-center">
          This tool makes SVGs bigger. Upload an SVG below. It doesn&apos;t cost
          money because that&apos;s dumb.
        </p>
        <input type="file" onChange={handleFileUpload} accept=".svg" />
      </div>
    );

  return (
    <div className="flex flex-col p-4 gap-4 justify-center items-center text-2xl">
      <SVGRenderer svgContent={svgContent} />
      <p>{imageMetadata.name}</p>
      <p>
        {imageMetadata.width}px x {imageMetadata.height}px
      </p>
      <SaveAsPngButton
        svgContent={svgContent}
        scale={64}
        imageMetadata={imageMetadata}
      />
    </div>
  );
}
