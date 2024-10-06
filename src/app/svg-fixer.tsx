"use client";

import { useRef, useEffect } from "react";

interface SVGCanvasProps {
  width: number;
  height: number;
  svgContent: string;
}

const SVGCanvas: React.FC<SVGCanvasProps> = ({ width, height, svgContent }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
    };
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`;

    // Trigger a "save image" of the resulting canvas content
    const saveImage = () => {
      if (canvas) {
        const dataURL = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = dataURL;
        const svgFileName = svgContent.match(/<svg[^>]*\stitle="([^"]*)"/) || [
          "",
          "canvas_image",
        ];
        link.download = `${svgFileName[1]}.png`;
        link.click();
      }
    };

    // Call saveImage after the image has been drawn
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      saveImage();
    };
  }, [svgContent]);

  return <canvas ref={canvasRef} width={width} height={height} hidden />;
};

import { useState, ChangeEvent } from "react";

// Scale width and height so longer dimension is 4000px
const scaleDimensions = (width: number, height: number) => {
  const maxDimension = 2000;
  const scale = Math.max(width, height) / maxDimension;
  return {
    width: width / scale,
    height: height / scale,
  };
};

const SVGUploader: React.FC = () => {
  const [svgContent, setSvgContent] = useState<string>("");
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

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

        const scaledDimensions = scaleDimensions(width, height);

        // Set SVG content to scaled dimensions
        svgElement.setAttribute("width", scaledDimensions.width.toString());
        svgElement.setAttribute("height", scaledDimensions.height.toString());
        setDimensions(scaledDimensions);
        setSvgContent(new XMLSerializer().serializeToString(svgDoc));
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <input
        type="file"
        accept=".svg"
        onChange={handleFileUpload}
        className="border border-gray-300 p-2 rounded"
      />
      {svgContent && (
        <SVGCanvas
          width={dimensions.width}
          height={dimensions.height}
          svgContent={svgContent}
        />
      )}
    </div>
  );
};

export function SVGTool() {
  return (
    <div className="flex flex-col p-4 gap-4">
      <p className="text-center">
        This tool makes SVGs bigger. Upload an SVG below. It doesn&apos;t cost
        money because that&apos;s dumb.
      </p>
      <SVGUploader />
    </div>
  );
}
