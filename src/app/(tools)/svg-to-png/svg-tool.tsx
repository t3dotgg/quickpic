"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { usePlausible } from "next-plausible";

import { ErrorMessage } from "@/components/shared/error-message";
import { FetchFromUrlForm } from "@/components/shared/fetch-from-url-form";
import { FileDropzone } from "@/components/shared/file-dropzone";
import { ClipboardPasteIcon, DownloadIcon } from "@/components/shared/icons";
import { OptionSelector } from "@/components/shared/option-selector";
import { PageTitle } from "@/components/shared/page-title";
import { PreviewScale } from "@/components/shared/preview-scale";
import { UploadBox } from "@/components/shared/upload-box";
import { SVGScaleSelector } from "@/components/svg-scale-selector";

import { useFileFetcher } from "@/hooks/use-file-fetcher";
import { useFileUploader } from "@/hooks/use-file-uploader";
import { useKeyDown } from "@/hooks/use-keydown";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { isInteractiveElementFocused } from "@/lib/dom-utils";
import { formatNumber } from "@/lib/math-utils";

import { type FileFetcherResult } from "@/hooks/use-file-fetcher";
import { type FileUploaderResult } from "@/hooks/use-file-uploader";
import { type ImageMetadata } from "@/lib/file-utils";

export type Scale = "custom" | number;

function scaleSvg(svgContent: string, scale: number) {
  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(svgContent, "image/svg+xml");
  const svgElement = svgDoc.documentElement;
  const viewBox = svgElement.getAttribute("viewBox");
  let width = parseInt(svgElement.getAttribute("width") ?? "");
  let height = parseInt(svgElement.getAttribute("height") ?? "");

  // If width and height are not expliclitly defined, extract them from the viewBox attribute
  if ((!width || !height) && viewBox) {
    const viewBoxValues = viewBox.split(" ").map(parseFloat);
    if (viewBoxValues.length === 4) {
      width = viewBoxValues[2]!;
      height = viewBoxValues[3]!;
    }
  }

  const scaledWidth = width * scale;
  const scaledHeight = height * scale;

  svgElement.setAttribute("width", scaledWidth.toString());
  svgElement.setAttribute("height", scaledHeight.toString());

  return new XMLSerializer().serializeToString(svgDoc);
}

function useSvgConverter(props: {
  canvas: HTMLCanvasElement | null;
  fileName?: string;
  imageMetadata: { width: number; height: number; name: string };
  scale: number;
  svgContent: string;
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
  backgroundColor: "dark" | "light";
  imageContainer: React.RefObject<HTMLDivElement> | null;
  imageContent: string;
  imageMetadata: { width: number; height: number; name: string };
  setPreviewScale: (scale: number | null) => void;
}

function SVGRenderer({
  backgroundColor,
  imageContainer,
  imageContent,
  imageMetadata,
  setPreviewScale,
}: SVGRendererProps) {
  const [internalScale, setInternalScale] = useState<number>(1);

  useEffect(() => {
    if (!imageContainer?.current || !imageContent) return;
    const container = imageContainer.current;

    const updatePreviewScaleFactor = () => {
      const imageContainerWidth = container.clientWidth;

      const previewScaleFactor = Math.min(
        imageContainerWidth / imageMetadata.width,
        imageContainerWidth / imageMetadata.height,
        1, // Prevent upscaling
      );

      setPreviewScale(previewScaleFactor < 1 ? previewScaleFactor : null);
      setInternalScale(previewScaleFactor);
    };

    updatePreviewScaleFactor();
    const resizeObserver = new ResizeObserver(updatePreviewScaleFactor);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [imageContent, imageMetadata, imageContainer, setPreviewScale]);

  return imageContent ? (
    <img
      src={imageContent}
      alt="Preview"
      width={imageMetadata.width * internalScale}
      height={imageMetadata.height * internalScale}
      style={{
        backgroundColor:
          backgroundColor === "light" ? "var(--foreground)" : "transparent",
        objectFit: "contain",
      }}
    />
  ) : null;
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
        className="flex h-10 items-center gap-2 whitespace-nowrap rounded-lg bg-blue-600 px-4 py-2 text-left text-sm font-semibold text-white shadow-md transition-colors duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
      >
        <DownloadIcon strokeWidth={2.5} />
        Save as PNG
      </button>
    </div>
  );
}

type SVGToolCoreProps = {
  fileUploaderProps: FileUploaderResult;
  fileFetcherProps: FileFetcherResult;
  error: string | null;
  onError: (error: string | null) => void;
};

function SVGToolCore({
  fileUploaderProps,
  fileFetcherProps,
  error,
  onError,
}: SVGToolCoreProps) {
  const router = useRouter();
  const [scale, setScale] = useLocalStorage<Scale>("svgTool_scale", 1);

  const [customScale, setCustomScale] = useLocalStorage<number | null>(
    "svgTool_customScale",
    1,
  );

  const [previewBackgroundColor, setPreviewBackgroundColor] = useLocalStorage<
    "dark" | "light"
  >("svgTool_previewBackgroundColor", "dark");

  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [imageMetadata, setImageMetadata] = useState<ImageMetadata>(
    fileUploaderProps.imageMetadata,
  );
  const [imageContent, setImageContent] = useState<string>(
    fileUploaderProps.imageContent,
  );
  const [rawContent, setRawContent] = useState<string>(
    fileUploaderProps.rawContent,
  );
  const [previewScale, setPreviewScale] = useState<number | null>(null);

  // Get the actual numeric scale value
  const effectiveScale = scale === "custom" ? (customScale ?? 1) : scale;

  const SubtitleIcon = <ClipboardPasteIcon className="-ml-1" />;

  const cancel = () => {
    fileUploaderProps.cancel();
    fileFetcherProps.cancel();
    setImageMetadata(null);
    setImageContent("");
    setRawContent("");
    setPreviewScale(null);
  };

  useEffect(() => {
    // Grab metadata and content from method of file upload
    // Make sure SVG metadata is normalized in case width/height are not explicitly defined
    let metadata: ImageMetadata | null = null;
    let content: string | null = null;
    let raw: string | null = null;

    if (fileUploaderProps.imageMetadata) {
      metadata = fileUploaderProps.imageMetadata;
      content = fileUploaderProps.imageContent;
      raw = fileUploaderProps.rawContent;
    } else {
      metadata = fileFetcherProps.imageMetadata;
      content = fileFetcherProps.imageContent;
      raw = fileFetcherProps.rawContent;
    }

    if (metadata) {
      setImageMetadata(metadata);
      setImageContent(content);
      setRawContent(raw);
      onError(null);
    } else {
      setImageMetadata(null);
      setImageContent("");
      setRawContent("");
    }
  }, [
    fileUploaderProps.imageMetadata,
    fileUploaderProps.imageContent,
    fileUploaderProps.rawContent,
    fileFetcherProps.imageMetadata,
    fileFetcherProps.imageContent,
    fileFetcherProps.rawContent,
    onError,
  ]);

  // Run the cancel function when the user presses the Escape key on the preview screen,
  // and navigate back to the home screen when the user presses Escape on the initial tool screen
  useKeyDown("Escape", () => {
    if (imageMetadata && imageContent) {
      // Preview screen
      if (isInteractiveElementFocused("ALL", ["option", "select"])) {
        // if any option selector buttons are focused, blur them instead of going back to initial tool screen
        (document.activeElement as HTMLButtonElement).blur();
      } else {
        // otherwise, cancel/go back to initial tool screen
        cancel();
      }
    } else {
      // Initial tool screen
      if (isInteractiveElementFocused("INPUT")) return; // ignore if input is focused
      router.push("/"); // otherwise, return to home screen
    }
  });

  if (!imageMetadata || !imageContent)
    return (
      <div className="flex flex-col items-center gap-4">
        <UploadBox
          title="Make SVGs into PNGs. Also makes them bigger. (100% free btw.)"
          subtitle="Allows pasting images from clipboard"
          subtitleIcon={SubtitleIcon}
          description="Upload SVG"
          accept=".svg"
          onChange={fileUploaderProps.handleFileUploadEvent}
        />

        <FetchFromUrlForm
          accept=".svg"
          error={fileFetcherProps.error}
          pending={fileFetcherProps.pending}
          handleSubmit={fileFetcherProps.handleFetchFile}
        />

        {error && <ErrorMessage error={error} />}
      </div>
    );

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-6 p-6">
      {/* Preview Section */}
      <div
        ref={imageContainerRef}
        className="flex w-full flex-col items-center gap-4 rounded-xl"
      >
        <PreviewScale previewScale={previewScale} />
        <SVGRenderer
          backgroundColor={previewBackgroundColor}
          imageContainer={imageContainerRef as React.RefObject<HTMLDivElement>}
          imageContent={imageContent}
          imageMetadata={imageMetadata}
          setPreviewScale={setPreviewScale}
        />
        <p className="break-all text-lg font-medium text-white/80">
          {imageMetadata.name}
        </p>
      </div>

      {/* Size Information */}
      <div className="flex gap-6 text-base">
        <div className="flex flex-col items-center rounded-lg bg-white/5 p-3">
          <span className="whitespace-nowrap text-center text-sm text-white/60">
            Original
          </span>
          <span className="text-center font-medium text-white">
            {imageMetadata.width} × {imageMetadata.height}
          </span>
        </div>

        <div className="flex flex-col items-center rounded-lg bg-white/5 p-3">
          <span className="whitespace-nowrap text-center text-sm text-white/60">
            {`Scaled (${formatNumber(effectiveScale)}×)`}
          </span>
          <span className="text-center font-medium text-white">
            {Math.floor(imageMetadata.width * effectiveScale)}
            {" × "}
            {Math.floor(imageMetadata.height * effectiveScale)}
          </span>
        </div>
      </div>

      {/* Scale Controls */}
      <SVGScaleSelector
        title="Scale Factor"
        options={[0.5, 1, 2, 4, 8, 16, 32, 64]}
        selected={scale}
        onChange={setScale}
        customValue={customScale}
        onCustomValueChange={setCustomScale}
      />

      {/* Preview Background Color Controls */}
      <OptionSelector
        title="Background (Preview Only)"
        options={["dark", "light"]}
        selected={previewBackgroundColor}
        onChange={setPreviewBackgroundColor}
        formatOption={(option: "dark" | "light") =>
          option.charAt(0).toUpperCase() + option.slice(1)
        }
        className="w-full"
      />

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={cancel}
          className="h-10 rounded-lg bg-transparent px-4 py-2 text-sm font-medium text-white/60 transition-colors duration-200 hover:bg-white/10 hover:text-white focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/10"
        >
          Cancel
        </button>
        <SaveAsPngButton
          svgContent={rawContent}
          scale={effectiveScale}
          imageMetadata={imageMetadata}
        />
      </div>
    </div>
  );
}

export function SVGTool({ title }: { title: string }) {
  const [error, setError] = useState<string | null>(null);
  const fileUploaderProps = useFileUploader({
    accept: [".svg", "image/svg+xml"],
    onError: setError,
  });
  const fileFetcherProps = useFileFetcher({ onError: setError });

  return (
    <FileDropzone
      setCurrentFile={fileUploaderProps.handleFileUpload}
      acceptedFileTypes={["image/svg+xml", ".svg"]}
      dropText="Drop SVG file"
      onError={setError}
    >
      <PageTitle title={title} />
      <SVGToolCore
        fileUploaderProps={fileUploaderProps}
        fileFetcherProps={fileFetcherProps}
        error={error}
        onError={setError}
      />
    </FileDropzone>
  );
}
