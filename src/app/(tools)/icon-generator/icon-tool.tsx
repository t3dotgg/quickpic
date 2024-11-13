"use client";

import { usePlausible } from "next-plausible";
import { useCallback, useEffect, useState } from "react";
import { UploadBox } from "@/components/shared/upload-box";
import { FileDropzone } from "@/components/shared/file-dropzone";
import {
  type FileUploaderResult,
  useFileUploader,
} from "@/hooks/use-file-uploader";
import JSZip from "jszip";

const PRESET_SIZES = [16, 32, 48, 64, 128, 256, 512, 640, 800, 1024] as const;
type PresetSize = (typeof PRESET_SIZES)[number];
type IconSize = PresetSize;

interface GeneratedIcon {
  size: IconSize;
  dataUrl: string;
}

function IconToolCore(props: { fileUploaderProps: FileUploaderResult }) {
  const { imageContent, imageMetadata, handleFileUploadEvent, cancel } =
    props.fileUploaderProps;
  const [generatedIcons, setGeneratedIcons] = useState<GeneratedIcon[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<Set<IconSize>>(
    new Set(PRESET_SIZES),
  );
  const [customSize, setCustomSize] = useState<string>("");

  const generateIcons = useCallback(
    async (sizes: IconSize[]) => {
      if (!imageContent) return;

      const icons: GeneratedIcon[] = [];

      for (const size of sizes) {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;

        const img = new Image();
        await new Promise((resolve) => {
          img.onload = resolve;
          img.src = imageContent;
        });

        const scale = Math.min(size / img.width, size / img.height);
        const x = (size - img.width * scale) / 2;
        const y = (size - img.height * scale) / 2;
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

        icons.push({
          size,
          dataUrl: canvas.toDataURL("image/png"),
        });
      }

      setGeneratedIcons(icons);
    },
    [imageContent],
  );

  useEffect(() => {
    if (imageContent && imageMetadata) {
      void generateIcons(Array.from(selectedSizes));
    }
  }, [imageContent, imageMetadata, selectedSizes, generateIcons]);

  const plausible = usePlausible();

  const handleSizeToggle = (size: IconSize) => {
    const newSizes = new Set(selectedSizes);
    if (newSizes.has(size)) {
      newSizes.delete(size);
    } else {
      newSizes.add(size);
    }
    setSelectedSizes(newSizes);
  };

  const handleCustomSizeAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const size = parseInt(customSize);
    if (size > 0 && size <= 2048) {
      handleSizeToggle(size as IconSize);
      setCustomSize("");
    }
  };

  const handleSelectAll = () => {
    setSelectedSizes(new Set(PRESET_SIZES));
  };

  const handleSelectNone = () => {
    setSelectedSizes(new Set());
  };

  const handleDownloadAll = () => {
    plausible("generate-icons");

    const zip = new JSZip();
    generatedIcons.forEach((icon) => {
      const base64Data = icon.dataUrl.split(",")[1];
      if (base64Data) {
        zip.file(`icon-${icon.size}x${icon.size}.png`, base64Data, {
          base64: true,
        });
      }
    });

    void zip.generateAsync({ type: "blob" }).then((content) => {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = "favicons.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  if (!imageMetadata) {
    return (
      <UploadBox
        title="Generate favicons and other icons from any image"
        subtitle="Allows pasting images from clipboard"
        description="Upload Image"
        accept="image/*"
        onChange={handleFileUploadEvent}
      />
    );
  }

  return (
    <div className="mx-auto flex max-w-7xl gap-6 p-6">
      {/* Left Sidebar - Options */}
      <div className="w-64 flex-shrink-0 space-y-4">
        <div className="rounded-lg bg-white/5 p-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white/90">
              Size Options
            </h3>
            <div className="mt-2 flex gap-2">
              <button
                onClick={handleSelectAll}
                className="flex-1 rounded-md bg-blue-600 px-2 py-1 text-xs text-white/90 hover:bg-blue-700"
              >
                Select All
              </button>
              <button
                onClick={handleSelectNone}
                className="flex-1 rounded-md bg-gray-600 px-2 py-1 text-xs text-white/90 hover:bg-gray-700"
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {PRESET_SIZES.map((size) => (
              <label
                key={size}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-white/10"
              >
                <input
                  type="checkbox"
                  checked={selectedSizes.has(size)}
                  onChange={() => handleSizeToggle(size)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-white/80">
                  {size}x{size}
                </span>
              </label>
            ))}
          </div>

          {/* Custom Size Input */}
          <div className="mt-4 border-t border-white/10 pt-4">
            <h4 className="mb-2 text-sm font-medium text-white/90">
              Custom Size
            </h4>
            <form onSubmit={handleCustomSizeAdd} className="flex gap-2">
              <input
                type="number"
                value={customSize}
                onChange={(e) => setCustomSize(e.target.value)}
                placeholder="Enter size"
                min="1"
                max="2048"
                className="w-full rounded-md bg-white/10 px-3 py-1.5 text-sm text-white/90 placeholder:text-white/50"
              />
              <button
                type="submit"
                className="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white/90 hover:bg-blue-700"
              >
                Add
              </button>
            </form>
            <p className="mt-1 text-xs text-white/50">Max size: 2048px</p>
          </div>

          {/* Custom Sizes List */}
          {Array.from(selectedSizes).some(
            (size) => !PRESET_SIZES.includes(size),
          ) && (
            <div className="mt-4 border-t border-white/10 pt-4">
              <h4 className="mb-2 text-sm font-medium text-white/90">
                Custom Sizes
              </h4>
              <div className="space-y-2">
                {Array.from(selectedSizes)
                  .filter((size) => !PRESET_SIZES.includes(size))
                  .sort((a, b) => a - b)
                  .map((size) => (
                    <div
                      key={size}
                      className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-white/10"
                    >
                      <span className="text-sm text-white/80">
                        {size}x{size}
                      </span>
                      <button
                        onClick={() => handleSizeToggle(size)}
                        className="text-red-400 hover:text-red-300"
                      >
                        ×
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content - Preview Grid */}
      <div className="flex-1 space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {generatedIcons.map((icon) => (
            <div
              key={icon.size}
              className="flex flex-col items-center gap-2 rounded-lg bg-white/5 p-4"
            >
              <img
                src={icon.dataUrl}
                alt={`${icon.size}x${icon.size} icon`}
                className="rounded-lg"
                style={{
                  width: Math.min(64, icon.size),
                  height: Math.min(64, icon.size),
                }}
              />
              <span className="text-sm text-white/60">
                {icon.size}x{icon.size}
              </span>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-3">
          <button
            onClick={cancel}
            className="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white/90 transition-colors hover:bg-red-800"
          >
            Cancel
          </button>
          <button
            onClick={handleDownloadAll}
            disabled={selectedSizes.size === 0}
            className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white shadow-md transition-colors duration-200 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 disabled:cursor-not-allowed disabled:bg-green-900"
          >
            Download Selected Icons
          </button>
        </div>
      </div>
    </div>
  );
}

export default function IconTool() {
  const fileUploaderProps = useFileUploader();

  return (
    <FileDropzone
      setCurrentFile={fileUploaderProps.handleFileUpload}
      acceptedFileTypes={["image/*", ".jpg", ".jpeg", ".png", ".webp"]}
      dropText="Drop image file"
    >
      <IconToolCore fileUploaderProps={fileUploaderProps} />
    </FileDropzone>
  );
}
