"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import JSZip from "jszip";

type OutputFormat = "jpg" | "png";

interface ConversionOptions {
  format: OutputFormat;
  quality: number;
}

interface FileWithNewName extends File {
  newName: string;
}

export function WebPTool() {
  const [files, setFiles] = useState<FileWithNewName[]>([]);
  const [converting, setConverting] = useState(false);
  const [options, setOptions] = useState<ConversionOptions>({
    format: "png",
    quality: 90,
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const webpFiles = acceptedFiles
      .filter((file) => file.type.includes("webp"))
      .map((file) => ({
        ...file,
        newName: file.name.replace(/\.webp$/i, ""),
      }));
    setFiles(webpFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/webp": [".webp"],
    },
  });

  const convertImage = async (file: FileWithNewName): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Conversion failed"));
          },
          `image/${options.format}`,
          options.quality / 100,
        );

        URL.revokeObjectURL(url);
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Failed to load image"));
      };

      img.src = url;
    });
  };

  const handleNameChange = (index: number, newName: string) => {
    setFiles((prev) =>
      prev.map((file, i) => (i === index ? { ...file, newName } : file)),
    );
  };

  const handleConvert = async () => {
    if (files.length === 0) return;
    setConverting(true);

    try {
      if (files.length === 1 && files[0]) {
        const blob = await convertImage(files[0]);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${files[0].newName}.${options.format}`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const zip = new JSZip();
        const converted = await Promise.all(
          files
            .filter((f): f is FileWithNewName => f !== undefined)
            .map(convertImage),
        );

        converted.forEach((blob, i) => {
          const file = files[i];
          if (file) {
            zip.file(`${file.newName}.${options.format}`, blob);
          }
        });

        const content = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(content);
        const a = document.createElement("a");
        a.href = url;
        a.download = "converted-images.zip";
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Conversion failed:", error);
      alert("Failed to convert image(s)");
    } finally {
      setConverting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${isDragActive ? "border-blue-500 bg-blue-50/10" : "border-gray-300"}`}
      >
        <input {...getInputProps()} />
        <p>Drag & drop WebP files here, or click to select files</p>
        {files.length > 0 && (
          <p className="mt-2 text-sm text-gray-400">
            {files.length} file(s) selected
          </p>
        )}
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={file.newName}
                onChange={(e) => handleNameChange(index, e.target.value)}
                className="rounded border border-gray-600 bg-transparent p-2 text-foreground"
                placeholder="Enter file name"
              />
              <span className="text-gray-400">.{options.format}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-4">
        <select
          value={options.format}
          onChange={(e) =>
            setOptions({ ...options, format: e.target.value as OutputFormat })
          }
          className="rounded border border-gray-600 bg-transparent p-2 text-foreground"
        >
          <option value="png">PNG</option>
          <option value="jpg">JPG</option>
        </select>

        <div className="flex items-center gap-2 text-foreground">
          <label>Quality:</label>
          <input
            type="range"
            min="1"
            max="100"
            value={options.quality}
            onChange={(e) =>
              setOptions({ ...options, quality: Number(e.target.value) })
            }
            className="w-32"
          />
          <span>{options.quality}%</span>
        </div>
      </div>

      <button
        onClick={handleConvert}
        disabled={files.length === 0 || converting}
        className={`rounded px-4 py-2 text-white ${
          files.length === 0 || converting
            ? "cursor-not-allowed bg-gray-400"
            : "bg-blue-500 hover:bg-blue-600"
        }`}
      >
        {converting ? "Converting..." : "Convert"}
      </button>
    </div>
  );
}
