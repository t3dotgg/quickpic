"use client";
import { usePlausible } from "next-plausible";
import { useEffect, useMemo, useRef, useState } from "react";
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

  const imageSrc = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(scaledSvg)}`;

  const convertToPng = () => {
    return new Promise<{ dataURL: string; fileName: string }>((resolve) => {
      const ctx = props.canvas?.getContext("2d");
      if (!ctx) throw new Error("Failed to get canvas context");

      const img = new Image();

      img.onload = () => {
        ctx.drawImage(img, 0, 0);

        if (props.canvas === null) {
          throw new Error("Canvas is null");
        }

        resolve({
          dataURL: props.canvas.toDataURL("image/png"),
          fileName: `${(props.imageMetadata.name ?? "svg_converted").replace(".svg", "")}-${props.scale}x.png`,
        });
      };

      img.src = imageSrc;
    });
  };

  return {
    convertToPng,
    canvasProps: { width: width, height: height },
    imageSrc,
  };
}

const downloadFile = (dataURL: string, fileName: string) => {
  const link = document.createElement("a");
  link.href = dataURL;
  link.download = fileName;
  link.click();
};

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

type SVGRendererProps = {
  svgContent: string;
};

const SVGRenderer = ({ svgContent }: SVGRendererProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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

const ConverterCanvas = ({
  svgContent,
  scale,
  imageMetadata,
  onPngReady,
}: {
  svgContent: string;
  scale: Scale;
  imageMetadata: { width: number; height: number; name: string };
  onPngReady: (png: { dataURL: string; fileName: string }) => void;
}) => {
  const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null);

  const { convertToPng, canvasProps } = useSvgConverter({
    canvas: canvasRef,
    svgContent,
    scale,
    imageMetadata,
  });

  useEffect(() => {
    if (canvasRef !== null) {
      convertToPng()
        .then((png) => {
          onPngReady(png);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, [canvasRef, svgContent, scale, imageMetadata, convertToPng, onPngReady]);

  return <canvas ref={setCanvasRef} {...canvasProps} hidden />;
};

function SaveAsPngButton(props: {
  png: { dataURL: string; fileName: string } | undefined;
}) {
  const plausible = usePlausible();

  return (
    <div>
      <button
        disabled={props.png === undefined}
        onClick={async () => {
          if (props.png === undefined) return;

          plausible("convert-svg-to-png");
          downloadFile(props.png.dataURL, props.png.fileName);
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

  const [scale, setScale] = useLocalStorage<Scale>("svgTool_scale", 1);
  const [png, setPng] = useState<{ dataURL: string; fileName: string }>();

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
    <div className="flex max-w-sm flex-col items-center justify-center gap-4 p-4 text-2xl">
      <span className="w-full border-b-2 border-b-black p-2 text-sm font-bold">
        Uploaded SVG
      </span>
      <SVGRenderer svgContent={svgContent} />
      <p>{imageMetadata.name}</p>
      <p>
        Original size: {imageMetadata.width}px x {imageMetadata.height}px
      </p>

      <span className="w-full border-b-2 border-b-black p-2 text-sm font-bold">
        Preview PNG
      </span>
      <img src={png?.dataURL} alt="Converted PNG" className="w-full" />
      <p>{png?.fileName}</p>
      <p>
        Scaled size: {imageMetadata.width * scale}px x{" "}
        {imageMetadata.height * scale}px
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
        <SaveAsPngButton png={png} />
        <button
          onClick={cancel}
          className="rounded-md bg-red-700 px-3 py-1 text-sm font-medium text-white transition-colors hover:bg-red-800"
        >
          Cancel
        </button>
      </div>
      <ConverterCanvas
        svgContent={svgContent}
        scale={scale}
        imageMetadata={imageMetadata}
        onPngReady={setPng}
      />
    </div>
  );
}
