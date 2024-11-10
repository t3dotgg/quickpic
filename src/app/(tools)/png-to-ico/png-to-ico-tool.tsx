"use client";
import { usePlausible } from "next-plausible";
import React, { useState, ChangeEvent } from "react";

interface ImageMetadata {
  width: number;
  height: number;
  name: string;
}

export function useFileUploader() {
  const [imageContent, setImageContent] = useState<string>("");
  const [imageMetadata, setImageMetadata] = useState<ImageMetadata | null>(null);

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
        img.onerror = () => {
          console.error("Failed to load the image.");
          // Optionally, handle error state
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
}

function useIconConverter(props: {
  imageContent: string;
  imageMetadata: ImageMetadata;
}) {
  const convertToIco = async () => {
    const sizes = [16, 32, 48];
    
    try {
      // Create canvases for each size
      const canvases = await Promise.all(sizes.map(async (size) => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not get canvas context');

        const img = new Image();
        img.src = props.imageContent;
        await new Promise((resolve) => {
          img.onload = resolve;
        });

        // Calculate scaling to maintain aspect ratio
        const scale = Math.min(size / img.width, size / img.height);
        const x = (size - img.width * scale) / 2;
        const y = (size - img.height * scale) / 2;

        ctx.drawImage(
          img,
          x, y,
          img.width * scale,
          img.height * scale
        );

        // Convert to PNG buffer
        const pngBlob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => {
            resolve(blob!);
          }, 'image/png');
        });

        return await pngBlob.arrayBuffer();
      }));

      // Create ICO header
      const header = new ArrayBuffer(6);
      const view = new DataView(header);
      view.setUint16(0, 0, true);     // Reserved
      view.setUint16(2, 1, true);     // ICO type
      view.setUint16(4, sizes.length, true); // Number of images

      // Create directory entries
      let offset = 6 + (sizes.length * 16);
      const directories = canvases.map((buffer, index) => {
        const dir = new ArrayBuffer(16);
        const view = new DataView(dir);
        const size = buffer.byteLength;
        const width = sizes[index];

        view.setUint8(0, width);      // Width
        view.setUint8(1, width);      // Height
        view.setUint8(2, 0);          // Color palette
        view.setUint8(3, 0);          // Reserved
        view.setUint16(4, 1, true);   // Color planes
        view.setUint16(6, 32, true);  // Bits per pixel
        view.setUint32(8, size, true);// Image size
        view.setUint32(12, offset, true); // Image offset

        offset += size;
        return { dir, buffer };
      });

      // Combine all buffers
      const totalSize = offset;
      const ico = new Uint8Array(totalSize);
      let pos = 0;

      // Write header
      ico.set(new Uint8Array(header), pos);
      pos += header.byteLength;

      // Write directories
      directories.forEach(({ dir }) => {
        ico.set(new Uint8Array(dir), pos);
        pos += dir.byteLength;
      });

      // Write image data
      directories.forEach(({ buffer }) => {
        ico.set(new Uint8Array(buffer), pos);
        pos += buffer.byteLength;
      });

      // Create and download file
      const blob = new Blob([ico], { type: "image/x-icon" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const fileName = props.imageMetadata.name.replace(/\.[^/.]+$/, "");
      link.href = url;
      link.download = `${fileName}.ico`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error converting to ICO:", error);
      // Optionally, set an error state to inform the user
    }
  };

  return { convertToIco };
}

interface ImagePreviewProps {
  imageContent: string;
}

function ImagePreview({ imageContent }: ImagePreviewProps) {
  return (
    <div className="relative max-w-full max-h-full">
      <img
        src={imageContent}
        alt="Preview"
        className="relative rounded-lg"
        style={{ width: "100%", height: "auto", maxWidth: "300px" }}
      />
    </div>
  );
}

function SaveAsIcoButton({
  imageContent,
  imageMetadata,
}: {
  imageContent: string;
  imageMetadata: ImageMetadata;
}) {
  const { convertToIco } = useIconConverter({
    imageContent,
    imageMetadata,
  });

  const plausible = usePlausible();
  const [isConverting, setIsConverting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleClick = async () => {
    plausible("convert-image-to-ico");
    setIsConverting(true);
    setErrorMessage("");
    try {
      await convertToIco();
    } catch (error) {
      console.error("Error converting to ICO:", error);
      setErrorMessage("Failed to convert image to ICO format.");
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isConverting}
        aria-label="Save image as ICO format"
        className="px-4 py-2 bg-green-700 text-sm text-white font-semibold rounded-lg shadow-md hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 transition-colors duration-200"
      >
        {isConverting ? "Converting..." : "Save as ICO"}
      </button>
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
    </>
  );
}

export function PngToIcoTool() {
  const { imageContent, imageMetadata, handleFileUpload, cancel } =
    useFileUploader();

  if (!imageMetadata)
    return (
      <div className="flex flex-col p-4 gap-4">
        <p className="text-center">Convert PNG images to ICO format</p>
        <div className="flex justify-center">
          <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-colors duration-200 gap-2">
            <span>Upload PNG</span>
            <input
              type="file"
              onChange={handleFileUpload}
              accept="image/png"
              className="hidden"
            />
          </label>
        </div>
      </div>
    );

  return (
    <div className="flex flex-col p-4 gap-4 justify-center items-center text-2xl">
      <ImagePreview imageContent={imageContent} />
      <p>{imageMetadata.name}</p>
      <p>
        Original size: {imageMetadata.width}px x {imageMetadata.height}px
      </p>
      <p className="text-sm text-gray-600">
        Will generate ICO with sizes: 16px, 32px, and 48px
      </p>
      <div className="flex gap-2">
        <SaveAsIcoButton
          imageContent={imageContent}
          imageMetadata={imageMetadata}
        />
        <button
          onClick={cancel}
          className="px-3 py-1 rounded-md text-sm font-medium bg-red-700 text-white hover:bg-red-800 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}