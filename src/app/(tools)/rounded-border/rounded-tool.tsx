"use client";
import { usePlausible } from "next-plausible";
import { useMemo, useState,  ChangeEvent } from "react";
import React from "react";

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
  }, [props.imageContent, props.imageMetadata]);

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
      <div ref={containerRef} className="relative max-w-full max-h-96">
          <div className="absolute inset-0" style={{ backgroundColor: background, borderRadius: 0 }} />
          <img src={imageContent} alt="Preview" className="relative object-contain max-w-full max-h-96" style={{ width: "auto", height: "auto" }} />
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
    null
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
                  convertToPng();
              }}
              className="px-4 py-2 bg-gradient-to-tr from-green-700 to-green-500 text-sm text-white font-semibold rounded-lg shadow-md hover:from-green-800 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 transition-colors duration-200"
          >
              Save as PNG
          </button>
      </div>
  );
}

export function RoundedTool() {
  const { imageContent, imageMetadata, handleFileUpload, cancel } = useFileUploader();
  const [radius, setRadius] = useState<Radius>(2);
  const [background, setBackground] = useState<BackgroundOption>("transparent");
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = React.useRef(0);

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    dragCounter.current = 0;
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleFileUpload({ target: { files: [file] } } as unknown as ChangeEvent<HTMLInputElement>);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragCounter.current++;
    if (dragCounter.current === 1) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  if (!imageMetadata)
    return (
      <div className="relative flex flex-col justify-between p-8 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-gray-100 dark:bg-gray-800" onDrop={handleDrop} onDragOver={handleDragOver} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave}>
        {isDragging && (
          <div className="absolute w-full inset-0 flex items-center justify-center bg-white dark:bg-gray-900 bg-opacity-75 backdrop-blur-xl rounded-2xl shadow-xl z-10">
            <p className="text-gray-800 dark:text-white text-lg">Drop your image file here</p>
          </div>
        )}
        <div className="flex flex-col p-4 gap-4">
          <p className="text-center text-gray-800 dark:text-gray-100">Round the corners of any image. Fast and free.</p>
          <div className="flex justify-center">
            <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-gradient-to-tr from-blue-500 to-blue-600 text-white font-semibold rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-colors duration-200 gap-2">
              <span>Upload Image</span>
              <input type="file" onChange={handleFileUpload} accept="image/*" className="hidden" />
            </label>
          </div>
        </div>
      </div>
    );

  return (
      <div className="flex flex-col justify-between p-4 font-[family-name:var(--font-geist-sans)] bg-gray-100 dark:bg-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
              <div className="flex flex-col items-center text-lg">
                  <ImageRenderer imageContent={imageContent} radius={radius} background={background} />
                  <p className="text-gray-800 dark:text-gray-100 truncate w-64 mt-3 text-center">{imageMetadata.name}</p>
              </div>
              <div className="h-full w-1 hidden md:block absolute left-1/2 top-0 -translate-x-1/2 border-l-2 border-dashed border-gray-300 dark:border-gray-700/80" />
              <div className="flex flex-col gap-4 justify-center items-center text-lg">
                  <p className="text-gray-800 dark:text-gray-100">
                      Original size: {imageMetadata.width}px x {imageMetadata.height}px
                  </p>
                  <div className="flex gap-2">
                      {([2, 4, 8, 16, 32, 64] as Radius[]).map((value) => (
                          <button key={value} onClick={() => setRadius(value)} className={`px-3 py-1 rounded-md text-sm font-medium transition-colors bg-gradient-to-tr ${radius === value ? "bg-gradient-to-tr from-green-700 to-green-500 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`}>
                              {value}px
                          </button>
                      ))}
                  </div>
                  <div className="flex gap-2">
                      {(["white", "black", "transparent"] as BackgroundOption[]).map((option) => (
                          <button key={option} onClick={() => setBackground(option)} className={`px-3 py-1 rounded-md text-sm font-medium transition-colors bg-gradient-to-tr ${background === option ? "bg-gradient-to-tr from-purple-600 to-purple-400 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`}>
                              {option.charAt(0).toUpperCase() + option.slice(1)}
                          </button>
                      ))}
                  </div>
                  <div className="flex gap-2">
                      <SaveAsPngButton imageContent={imageContent} radius={radius} background={background} imageMetadata={imageMetadata} />
                      <button onClick={cancel} className="px-3 py-1 rounded-md text-sm font-medium bg-gradient-to-tr from-red-500 to-red-700 text-white hover:from-red-800 hover:to-red-600 transition-colors bg-gradient-to-tr">
                          Cancel
                      </button>
                  </div>
              </div>
          </div>
      </div>
  );
}
