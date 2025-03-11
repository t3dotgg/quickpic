"use client";

import { useEffect, useRef, useState } from "react";
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

import { useFileFetcher } from "@/hooks/use-file-fetcher";
import { useFileUploader } from "@/hooks/use-file-uploader";
import { useKeyDown } from "@/hooks/use-keydown";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { isInteractiveElementFocused } from "@/lib/dom-utils";

import { type FileFetcherResult } from "@/hooks/use-file-fetcher";
import { type FileUploaderResult } from "@/hooks/use-file-uploader";
import { type ImageMetadata } from "@/lib/file-utils";

interface ImageRendererProps {
  backgroundColor: "black" | "white" | "transparent";
  imageContainer: React.RefObject<HTMLDivElement> | null;
  imageContent: string | null;
  imageMetadata: { width: number; height: number; name: string };
  objectFit: "contain" | "cover";
  setPreviewScale: (scale: number | null) => void;
}

const ImageRenderer = ({
  backgroundColor,
  imageContainer,
  imageContent,
  imageMetadata,
  objectFit,
  setPreviewScale,
}: ImageRendererProps) => {
  const [internalScale, setInternalScale] = useState<number>(1);

  useEffect(() => {
    if (!imageContainer?.current || !imageContent) return;
    const container = imageContainer.current;

    const updatePreviewScaleFactor = () => {
      const imageContainerWidth = container.clientWidth;

      const previewScaleFactor =
        objectFit === "contain"
          ? Math.min(
              imageContainerWidth / imageMetadata.width,
              imageContainerWidth / imageMetadata.height,
              1, // Prevent upscaling
            )
          : Math.min(
              imageContainerWidth /
                Math.min(imageMetadata.width, imageMetadata.height),
              1, // Prevent upscaling
            );

      setPreviewScale(previewScaleFactor < 1 ? previewScaleFactor : null);
      setInternalScale(previewScaleFactor);
    };

    updatePreviewScaleFactor();
    const resizeObserver = new ResizeObserver(updatePreviewScaleFactor);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [imageContainer, imageContent, imageMetadata, objectFit, setPreviewScale]);

  return imageContent ? (
    <img
      src={imageContent}
      alt="Preview"
      className={`${backgroundColor === "transparent" ? "checkerboard" : ""} size-full max-h-[calc(42rem_-_1.5rem_-_1.5rem)] max-w-[calc(42rem_-_1.5rem_-_1.5rem)]`}
      style={{
        objectFit,
        width: `${
          objectFit === "contain"
            ? Math.max(imageMetadata.width, imageMetadata.height) *
              internalScale
            : Math.min(imageMetadata.width, imageMetadata.height) *
              internalScale
        }px`,
        height: `${
          objectFit === "contain"
            ? Math.max(imageMetadata.width, imageMetadata.height) *
              internalScale
            : Math.min(imageMetadata.width, imageMetadata.height) *
              internalScale
        }px`,
        transition: "width 0.2s ease-out, height 0.2s ease-out",
      }}
    />
  ) : null;
};

function SaveSquareImageButton({
  imageContent,
  imageMetadata,
}: {
  imageContent: string | null;
  imageMetadata: { width: number; height: number; name: string };
}) {
  const handleSaveImage = () => {
    if (imageContent && imageMetadata) {
      const link = document.createElement("a");
      link.href = imageContent;
      const originalFileName = imageMetadata.name;
      const fileNameWithoutExtension =
        originalFileName.substring(0, originalFileName.lastIndexOf(".")) ||
        originalFileName;
      link.download = `${fileNameWithoutExtension}-squared.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const plausible = usePlausible();

  return (
    <button
      onClick={() => {
        plausible("create-square-image");
        handleSaveImage();
      }}
      className="flex h-10 items-center gap-2 whitespace-nowrap rounded-lg bg-blue-600 px-4 py-2 text-left text-sm font-semibold text-white shadow-md transition-colors duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
    >
      <DownloadIcon strokeWidth={2.5} />
      Save Image
    </button>
  );
}

type SquareToolCoreProps = {
  fileUploaderProps: FileUploaderResult;
  fileFetcherProps: FileFetcherResult;
  error: string | null;
  onError: (error: string | null) => void;
};

function SquareToolCore({
  fileUploaderProps,
  fileFetcherProps,
  error,
  onError,
}: SquareToolCoreProps) {
  const router = useRouter();

  const [objectFit, setObjectFit] = useLocalStorage<"contain" | "cover">(
    "squareTool_objectFit",
    "contain",
  );

  const [backgroundColor, setBackgroundColor] = useLocalStorage<
    "black" | "white" | "transparent"
  >("squareTool_backgroundColor", "white");

  const [squareImageContent, setSquareImageContent] = useState<string | null>(
    null,
  );

  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [imageMetadata, setImageMetadata] = useState<ImageMetadata>(
    fileUploaderProps.imageMetadata,
  );
  const [imageContent, setImageContent] = useState<string>(
    fileUploaderProps.imageContent,
  );
  const [previewScale, setPreviewScale] = useState<number | null>(null);

  const SubtitleIcon = <ClipboardPasteIcon className="-ml-1" />;

  const cancel = () => {
    fileUploaderProps.cancel();
    fileFetcherProps.cancel();
    setImageMetadata(null);
    setImageContent("");
    setPreviewScale(null);
  };

  useEffect(() => {
    // Grab metadata and content from method of file upload
    let metadata: ImageMetadata | null = null;
    let content: string | null = null;

    if (fileUploaderProps.imageMetadata) {
      metadata = fileUploaderProps.imageMetadata;
      content = fileUploaderProps.imageContent;
    } else {
      metadata = fileFetcherProps.imageMetadata;
      content = fileFetcherProps.imageContent;
    }

    if (metadata) {
      setImageMetadata(metadata);
      setImageContent(content);
      onError(null);
    } else {
      setImageMetadata(null);
      setImageContent("");
    }
  }, [
    fileUploaderProps.imageMetadata,
    fileUploaderProps.imageContent,
    fileFetcherProps.imageMetadata,
    fileFetcherProps.imageContent,
    onError,
  ]);

  useEffect(() => {
    if (imageContent && imageMetadata) {
      const canvas = document.createElement("canvas");
      const size =
        objectFit === "contain"
          ? Math.max(imageMetadata.width, imageMetadata.height)
          : Math.min(imageMetadata.width, imageMetadata.height);
      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Fill background
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, size, size);

      // Load and center the image
      const img = new Image();

      img.onload = () => {
        const imgAspectRatio = img.width / img.height;

        let w = size;
        let h = size;
        let x = 0;
        let y = 0;

        if (objectFit === "contain") {
          // Original logic
          w = imageMetadata.width;
          h = imageMetadata.height;
          x = (size - w) / 2;
          y = (size - h) / 2;
        } else if (objectFit === "cover") {
          if (imgAspectRatio > 1) {
            // Image is wider than square, crop horizontally
            h = size;
            w = imgAspectRatio * h;
            x = (size - w) / 2;
            y = 0;
          } else {
            // Image is taller than square, crop vertically
            w = size;
            h = w / imgAspectRatio;
            y = (size - h) / 2;
            x = 0;
          }
        }

        ctx.drawImage(img, x, y, w, h);
        setSquareImageContent(canvas.toDataURL("image/png"));
      };

      img.src = imageContent;
    }
  }, [backgroundColor, imageContent, imageMetadata, objectFit]);

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

  if (!imageMetadata) {
    return (
      <div className="flex flex-col items-center gap-4">
        <UploadBox
          title="Create square images with custom backgrounds. Fast and free."
          subtitle="Allows pasting images from clipboard"
          subtitleIcon={SubtitleIcon}
          description="Upload Image"
          accept="image/*"
          onChange={fileUploaderProps.handleFileUploadEvent}
        />

        <FetchFromUrlForm
          accept="image/*"
          error={fileFetcherProps.error}
          pending={fileFetcherProps.pending}
          handleSubmit={fileFetcherProps.handleFetchFile}
        />

        {error && <ErrorMessage error={error} />}
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-6 p-6">
      {/* Preview Section */}
      <div
        ref={imageContainerRef}
        className="flex w-full flex-col items-center gap-4 rounded-xl"
      >
        <PreviewScale previewScale={previewScale} />
        <ImageRenderer
          backgroundColor={backgroundColor}
          imageContainer={imageContainerRef as React.RefObject<HTMLDivElement>}
          imageContent={squareImageContent}
          imageMetadata={imageMetadata}
          objectFit={objectFit}
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
            Original Size
          </span>
          <span className="text-center font-medium text-white">
            {imageMetadata.width} × {imageMetadata.height}
          </span>
        </div>

        <div className="flex flex-col items-center rounded-lg bg-white/5 p-3">
          <span className="whitespace-nowrap text-center text-sm text-white/60">
            Square Size
          </span>
          <span className="text-center font-medium text-white">
            {objectFit === "contain"
              ? Math.max(imageMetadata.width, imageMetadata.height)
              : Math.min(imageMetadata.width, imageMetadata.height)}
            {" × "}
            {objectFit === "contain"
              ? Math.max(imageMetadata.width, imageMetadata.height)
              : Math.min(imageMetadata.width, imageMetadata.height)}
          </span>
        </div>
      </div>

      {/* Object Fit Controls */}
      <OptionSelector
        title="Image Fit"
        options={["contain", "cover"]}
        selected={objectFit}
        onChange={setObjectFit}
        formatOption={(option) =>
          option.charAt(0).toUpperCase() + option.slice(1)
        }
        className="w-full"
      />

      {/* Background Controls */}
      <OptionSelector
        title="Background Color"
        options={["white", "black", "transparent"]}
        selected={backgroundColor}
        onChange={setBackgroundColor}
        formatOption={(option) =>
          option.charAt(0).toUpperCase() + option.slice(1)
        }
        className="w-full"
      />

      <div className="flex gap-2">
        <button
          onClick={cancel}
          className="h-10 rounded-lg bg-transparent px-4 py-2 text-sm font-medium text-white/60 transition-colors duration-200 hover:bg-white/10 hover:text-white focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/10"
        >
          Cancel
        </button>
        <SaveSquareImageButton
          imageContent={squareImageContent}
          imageMetadata={imageMetadata}
        />
      </div>
    </div>
  );
}

export function SquareTool({ title }: { title: string }) {
  const [error, setError] = useState<string | null>(null);
  const fileUploaderProps = useFileUploader({ onError: setError });
  const fileFetcherProps = useFileFetcher({ onError: setError });

  return (
    <FileDropzone
      acceptedFileTypes={["image/*", ".jpg", ".jpeg", ".png", ".webp", ".svg"]}
      dropText="Drop image file"
      setCurrentFile={fileUploaderProps.handleFileUpload}
      onError={setError}
    >
      <PageTitle title={title} />
      <SquareToolCore
        fileUploaderProps={fileUploaderProps}
        fileFetcherProps={fileFetcherProps}
        error={error}
        onError={setError}
      />
    </FileDropzone>
  );
}
