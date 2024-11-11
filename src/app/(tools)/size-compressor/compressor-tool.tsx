"use client";

import { useState, type ChangeEvent, useEffect } from "react";
import type { Options } from "browser-image-compression";
import imageCompression from "browser-image-compression";

export default function ImageSizeCompressor() {
  const [images, setImages] = useState<File[]>([]);
  const [quality, setQuality] = useState(0.8);
  const [previews, setPreviews] = useState<string[]>([]);
  const [compressedPreview, setCompressedPreview] = useState<string | null>(
    null,
  );
  const [originalSize, setOriginalSize] = useState<string>("");
  const [compressedSize, setCompressedSize] = useState<string>("");
  const [isCompressing, setIsCompressing] = useState(false);

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  function handleImageUpload(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;

    const newFiles = Array.from(e.target.files);
    setImages((prev) => [...prev, ...newFiles]);

    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    if (newFiles[0]) {
      setOriginalSize(formatFileSize(newFiles[0].size));
    }
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    if (index === 0) {
      setCompressedPreview(null);
      setOriginalSize("");
      setCompressedSize("");
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function generateCompressedPreview() {
      if (!images[0]) {
        setCompressedPreview(null);
        setCompressedSize("");
        return;
      }

      try {
        setIsCompressing(true);
        const options: Options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          initialQuality: quality,
        };

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
        const compressedFile = await imageCompression(images[0], options);

        if (!isMounted) return;

        if (!(compressedFile instanceof File) || !compressedFile.size) {
          throw new Error("Invalid compressed file");
        }

        setCompressedSize(formatFileSize(compressedFile.size));

        const reader = new FileReader();
        reader.onloadend = () => {
          if (!isMounted) return;

          if (typeof reader.result !== "string") {
            console.error("Invalid reader result type");
            return;
          }

          setCompressedPreview(reader.result);
        };

        reader.onerror = () => {
          console.error("Error reading compressed file");
        };

        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error("Error generating preview:", error);
        if (isMounted) {
          setCompressedPreview(null);
          setCompressedSize("");
        }
      } finally {
        if (isMounted) {
          setIsCompressing(false);
        }
      }
    }

    const debounceTimeout = setTimeout(() => {
      void generateCompressedPreview();
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(debounceTimeout);
    };
  }, [quality, images]);

  async function handleCompress() {
    try {
      const options: Options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        initialQuality: quality,
      };

      const compressedFiles = await Promise.all<File>(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
        images.map((image) => imageCompression(image, options)),
      );

      compressedFiles.forEach((file, index) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(file);
        link.download = `compressed_${images[index]?.name ?? `image_${index}`}`;
        link.click();
        URL.revokeObjectURL(link.href);
      });
    } catch (error) {
      console.error("Error compressing images:", error);
    }
  }

  function onChangeQuality(e: ChangeEvent<HTMLInputElement>) {
    setQuality(parseFloat(e.target.value));
  }

  function onCancel() {
    setImages([]);
    setPreviews([]);
    setCompressedPreview(null);
    setOriginalSize("");
    setCompressedSize("");
  }

  if (images.length === 0) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <p className="text-center">Compress your images to reduce file size.</p>
        <div className="flex justify-center">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white shadow-md transition-colors duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75">
            <span>Upload Images</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageUpload}
            />
          </label>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-4 text-2xl">
      <div className="flex flex-wrap justify-center gap-4">
        {previews.map((preview, index) => (
          <div key={index} className="relative">
            <img
              src={preview}
              alt={`Preview ${index + 1}`}
              className="h-32 w-32 rounded-lg object-cover"
            />
            <button
              onClick={() => removeImage(index)}
              className="absolute -right-2 -top-2 h-8 w-8 rounded-full bg-red-700 text-white hover:bg-red-800"
            >
              X
            </button>
          </div>
        ))}
      </div>

      <div className="flex w-full max-w-md flex-col gap-2">
        <label className="text-sm">Quality: {Math.round(quality * 100)}%</label>
        <input
          type="range"
          min="0.1"
          max="1"
          step="0.1"
          value={quality}
          onChange={onChangeQuality}
          className="w-full"
        />
      </div>

      {previews[0] !== undefined && (
        <div className="flex gap-8">
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm font-medium">Original</span>
            <img
              src={previews[0]}
              alt="Original preview"
              className="h-64 w-64 rounded-lg object-cover"
            />
            <span className="text-sm text-gray-600">{originalSize}</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm font-medium">Compressed Preview</span>
            <div className="relative h-64 w-64">
              <img
                src={compressedPreview ?? previews[0]}
                alt="Compressed preview"
                className="h-64 w-64 rounded-lg object-cover"
              />
              {isCompressing && (
                <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50">
                  <div className="text-sm text-white">Compressing...</div>
                </div>
              )}
            </div>
            <span className="text-sm text-gray-600">{compressedSize}</span>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleCompress}
          className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white shadow-md transition-colors duration-200 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
        >
          Download Compressed Images
        </button>
        <button
          onClick={onCancel}
          className="rounded-md bg-red-700 px-3 py-1 text-sm font-medium text-white transition-colors hover:bg-red-800"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
