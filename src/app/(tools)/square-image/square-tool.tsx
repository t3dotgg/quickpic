"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import { usePlausible } from "next-plausible";

export const SquareTool: React.FC = () => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [backgroundColor, setBackgroundColor] = useState<"black" | "white" | "red" | string>("white");
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [canvasDataUrl, setCanvasDataUrl] = useState<string | null>(null);
    const [imageMetadata, setImageMetadata] = useState<{ width: number; height: number; name: string } | null>(null);
    const plausible = usePlausible();
    const [isDragging, setIsDragging] = useState(false);
    const dragCounter = React.useRef(0);

    const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImageMetadata({ width: 0, height: 0, name: file.name });
        }
    };

    const handleBackgroundColorChange = (event: ChangeEvent<HTMLInputElement>) => {
        const color = event.target.value;
        setBackgroundColor(color);
    };

    const handleSaveImage = () => {
        if (canvasDataUrl && imageMetadata) {
            const link = document.createElement("a");
            link.href = canvasDataUrl;
            const originalFileName = imageMetadata.name;
            const fileNameWithoutExtension = originalFileName.substring(0, originalFileName.lastIndexOf(".")) || originalFileName;
            link.download = `${fileNameWithoutExtension}-squared.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);
        dragCounter.current = 0;
        const file = event.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) {
            setImageFile(file);
            setImageMetadata({ width: 0, height: 0, name: file.name });
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

    useEffect(() => {
        if (imageFile) {
            const reader = new FileReader();
            reader.onload = () => {
                const img = new Image();
                img.onload = () => {
                    const maxDim = Math.max(img.width, img.height);
                    setImageMetadata((prevState) => ({
                        ...prevState!,
                        width: img.width,
                        height: img.height,
                    }));

                    const canvas = document.createElement("canvas");
                    canvas.width = maxDim;
                    canvas.height = maxDim;
                    const ctx = canvas.getContext("2d");
                    if (ctx) {
                        ctx.fillStyle = backgroundColor;
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        const x = (maxDim - img.width) / 2;
                        const y = (maxDim - img.height) / 2;
                        ctx.drawImage(img, x, y);
                        const dataUrl = canvas.toDataURL("image/png");
                        setCanvasDataUrl(dataUrl);

                        // Create a smaller canvas for the preview
                        const previewCanvas = document.createElement("canvas");
                        const previewSize = 300; // Set desired preview size
                        previewCanvas.width = previewSize;
                        previewCanvas.height = previewSize;
                        const previewCtx = previewCanvas.getContext("2d");
                        if (previewCtx) {
                            previewCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, previewSize, previewSize);
                            const previewDataUrl = previewCanvas.toDataURL("image/png");
                            setPreviewUrl(previewDataUrl);
                        }
                    }
                };
                if (typeof reader.result === "string") {
                    img.src = reader.result;
                }
            };
            reader.readAsDataURL(imageFile);
        } else {
            setPreviewUrl(null);
            setCanvasDataUrl(null);
            setImageMetadata(null);
        }
    }, [imageFile, backgroundColor]);

    if (!imageMetadata)
        return (
            <div className="relative flex flex-col justify-between p-8 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-gray-100 dark:bg-gray-800" onDrop={handleDrop} onDragOver={handleDragOver} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave}>
                {isDragging && (
                    <div className="absolute w-full inset-0 flex items-center justify-center bg-white dark:bg-gray-900 bg-opacity-75 backdrop-blur-xl rounded-2xl shadow-xl z-10">
                        <p className="text-gray-800 dark:text-white text-lg">Drop your image file here</p>
                    </div>
                )}
                <div className="flex flex-col p-4 gap-4">
                    <p className="text-center text-gray-800 dark:text-gray-100">Create square images with custom backgrounds. Fast and free.</p>
                    <div className="flex justify-center">
                        <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-gradient-to-tr from-blue-500 to-blue-600 text-white font-semibold rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-colors duration-200 gap-2">
                            <span>Upload Image</span>
                            <input type="file" onChange={handleImageUpload} accept="image/*" className="hidden" />
                        </label>
                    </div>
                </div>
            </div>
        );

    return (
        <div className="flex flex-col justify-between p-4 font-[family-name:var(--font-geist-sans)] bg-gray-100 dark:bg-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                <div className="flex flex-col items-center text-lg">
                    {previewUrl && <img src={previewUrl} alt="Preview" className="mb-4 rounded-xl shadow-inner" />}
                    <p className="text-gray-800 dark:text-gray-100 truncate w-64 mt-3 text-center">{imageMetadata.name}</p>
                </div>
                <div className="h-full w-1 hidden md:block absolute left-1/2 top-0 -translate-x-1/2 border-l-2 border-dashed border-gray-300 dark:border-gray-700/80" />
                <div className="flex flex-col gap-4 justify-center items-center text-lg">
                    <p className="text-gray-800 dark:text-gray-100">
                        Original size: {imageMetadata.width}px x {imageMetadata.height}px
                    </p>
                    <p className="text-gray-800 dark:text-gray-100">
                        Square size: {Math.max(imageMetadata.width, imageMetadata.height)}px x {Math.max(imageMetadata.width, imageMetadata.height)}px
                    </p>
                    <div className="flex gap-3">
                        <p className="text-gray-800 dark:text-gray-100">Background</p>
                        <label className={`inline-flex items-center w-8 h-8 rounded-full cursor-pointer ${backgroundColor === "white" ? " outline outline-4 outline-blue-500 outline-offset-2" : "border-2 border-gray-300 dark:border-gray-300"}`} style={{ backgroundColor: "white" }}>
                            <input type="radio" value="white" checked={backgroundColor === "white"} onChange={handleBackgroundColorChange} className="hidden" />
                        </label>
                        <label className={`inline-flex items-center w-8 h-8 rounded-full cursor-pointer ${backgroundColor === "black" ? " outline outline-4 outline-blue-500 outline-offset-2" : "border-2 border-gray-300 dark:border-gray-300"}`} style={{ backgroundColor: "black" }}>
                            <input type="radio" value="black" checked={backgroundColor === "black"} onChange={handleBackgroundColorChange} className="hidden" />
                        </label>
                        {/* people want it they got it */}
                        <label className={`inline-flex items-center w-8 h-8 rounded-full cursor-pointer ${backgroundColor === "red" ? " outline outline-4 outline-blue-500 outline-offset-2" : "border-2 border-gray-300 dark:border-gray-300"}`} style={{ backgroundColor: "red" }}>
                            <input type="radio" value="red" checked={backgroundColor === "red"} onChange={handleBackgroundColorChange} className="hidden" />
                        </label>
                        <label className={`relative inline-flex items-center w-8 h-8 rounded-full cursor-pointer overflow-hidden ${!["white", "black", "red"].includes(backgroundColor) ? " outline outline-4 outline-blue-500 outline-offset-2" : "border-2 border-gray-300 dark:border-gray-300"}`} style={{ backgroundColor: backgroundColor }}>
                            <input type="color" defaultValue={"#00FF00"} onChange={handleBackgroundColorChange} className="scale-[2]" />
                        </label>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                plausible("create-square-image");
                                handleSaveImage();
                            }}
                            className="px-4 py-2 bg-gradient-to-tr from-green-500 to-green-700 text-sm text-white font-semibold rounded-lg shadow-md hover:from-green-600 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 transition-colors duration-200"
                        >
                            Save Image
                        </button>
                        <button
                            onClick={() => {
                                setImageFile(null);
                                setPreviewUrl(null);
                                setCanvasDataUrl(null);
                                setImageMetadata(null);
                            }}
                            className="px-3 py-1 rounded-md text-sm font-medium bg-gradient-to-tr from-red-500 to-red-700 text-white hover:from-red-600 hover:to-red-800 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
