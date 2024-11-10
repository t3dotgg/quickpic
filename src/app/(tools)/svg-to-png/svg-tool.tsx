"use client";
import { usePlausible } from "next-plausible";
import { useMemo, useState } from "react";

import { ChangeEvent } from "react";

type Scale = 1 | 2 | 4 | 8 | 16 | 32 | 64;

function scaleSvg(svgContent: string, scale: Scale) {
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgContent, "image/svg+xml");
    const svgElement = svgDoc.documentElement;
    const width = parseInt(svgElement.getAttribute("width") || "300");
    const height = parseInt(svgElement.getAttribute("height") || "150");

    const scaledWidth = width * scale;
    const scaledHeight = height * scale;

    svgElement.setAttribute("width", scaledWidth.toString());
    svgElement.setAttribute("height", scaledHeight.toString());

    return new XMLSerializer().serializeToString(svgDoc);
}

function useSvgConverter(props: { canvas: HTMLCanvasElement | null; svgContent: string; scale: Scale; fileName?: string; imageMetadata: { width: number; height: number; name: string } }) {
    const { width, height, scaledSvg } = useMemo(() => {
        const scaledSvg = scaleSvg(props.svgContent, props.scale);

        return {
            width: props.imageMetadata?.width * props.scale,
            height: props.imageMetadata?.height * props.scale,
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
                const svgFileName = props.imageMetadata?.name ?? "svg_converted";

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
                const width = parseInt(svgElement.getAttribute("width") || "300");
                const height = parseInt(svgElement.getAttribute("height") || "150");

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

    return { svgContent,setSvgContent, imageMetadata,setImageMetadata, handleFileUpload, cancel };
};

import React from "react";

interface SVGRendererProps {
    svgContent: string;
}

const SVGRenderer: React.FC<SVGRendererProps> = ({ svgContent }) => {
    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (containerRef.current) {
            containerRef.current.innerHTML = svgContent;
            const svgElement = containerRef.current.querySelector("svg");
            if (svgElement) {
                svgElement.setAttribute("width", "100%");
                svgElement.setAttribute("height", "auto");
            }
        }
    }, [svgContent]);

    return <div ref={containerRef} className="bg-gray-200 dark:bg-gray-700/25 rounded-xl shadow-inner p-5 overflow-hidden" />;
};

function SaveAsPngButton({ svgContent, scale, imageMetadata }: { svgContent: string; scale: Scale; imageMetadata: { width: number; height: number; name: string } }) {
    const [canvasRef, setCanvasRef] = React.useState<HTMLCanvasElement | null>(null);
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
                    convertToPng();
                }}
                className="px-4 py-2 bg-gradient-to-tr from-green-500 to-green-700 text-sm text-white font-semibold rounded-lg shadow-md hover:from-green-600 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 transition-colors duration-200"
            >
                Save as PNG
            </button>
        </div>
    );
}

export function SVGTool() {
    const { svgContent,setSvgContent, imageMetadata,setImageMetadata, handleFileUpload, cancel } = useFileUploader();
    const [scale, setScale] = useState<Scale>(1);
    const [isDragging, setIsDragging] = useState(false);
    const dragCounter = React.useRef(0);

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);
        dragCounter.current = 0;
        const file = event.dataTransfer.files[0];
        if (file && file.type === "image/svg+xml") {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result as string;

                // Extract width and height from SVG content
                const parser = new DOMParser();
                const svgDoc = parser.parseFromString(content, "image/svg+xml");
                const svgElement = svgDoc.documentElement;
                const width = parseInt(svgElement.getAttribute("width") || "300");
                const height = parseInt(svgElement.getAttribute("height") || "150");

                setSvgContent(content);
                setImageMetadata({ width, height, name: file.name });
            };
            reader.readAsText(file);
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
            <div
                className="relative flex flex-col justify-between p-8 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-gray-100 dark:bg-gray-800"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
            >
                {isDragging && (
                    <div className="absolute w-full inset-0 flex items-center justify-center bg-white dark:bg-gray-900 bg-opacity-75 backdrop-blur-xl rounded-2xl shadow-xl z-10">
                        <p className="text-gray-800 dark:text-white text-lg">Drop your SVG file here</p>
                    </div>
                )}
                <div className="flex flex-col p-4 gap-4">
                    <p className="text-center text-gray-800 dark:text-gray-100">Make SVGs into PNGs. <br/>Also makes them bigger. (100% free btw.)</p>
                    <div className="flex justify-center">
                        <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-gradient-to-tr from-blue-500 to-blue-600 text-white font-semibold rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-colors duration-200 gap-2">
                            <span >Upload SVG</span>
                            <input type="file" onChange={handleFileUpload} accept=".svg" className="hidden" />
                        </label>
                    </div>
                </div>
            </div>
        );

    return (
        <div className="flex flex-col justify-between p-4 font-[family-name:var(--font-geist-sans)] bg-gray-100 dark:bg-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                <div className="flex flex-col items-center text-lg">
                    <SVGRenderer svgContent={svgContent} />
                    <p className="text-gray-800 dark:text-gray-100 truncate w-64 mt-3 text-center">{imageMetadata?.name}</p>
                </div>
                <div className="h-full w-1 hidden md:block absolute left-1/2 top-0 -translate-x-1/2 border-l-2 border-dashed border-gray-200 dark:border-gray-700/25" />
                <div className="flex flex-col gap-4 justify-center items-center text-lg">
                    <p className="text-gray-800 dark:text-gray-100">
                        Original size: {imageMetadata?.width}px x {imageMetadata?.height}px
                    </p>
                    <p className="text-gray-800 dark:text-gray-100">
                        Scaled size: {imageMetadata?.width * scale}px x {imageMetadata?.height * scale}px
                    </p>
                    <div className="flex gap-2">
                        {([1, 2, 4, 8, 16, 32, 64] as Scale[]).map((value) => (
                            <button key={value} onClick={() => setScale(value)} className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${scale === value ? "bg-gradient-to-tr from-blue-500 to-blue-600 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`}>
                                {value}x
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <SaveAsPngButton svgContent={svgContent} scale={scale} imageMetadata={imageMetadata} />
                        <button onClick={cancel} className="px-3 py-1 rounded-md text-sm font-medium bg-gradient-to-tr from-red-500 to-red-700 text-white hover:from-red-600 hover:to-red-800 transition-colors">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
