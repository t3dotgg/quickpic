import type { Metadata } from "next";
import { WebPTool } from "./webp-tool";

export const metadata: Metadata = {
  title: "WebP to JPG/PNG Converter | QuickPic",
  description:
    "Convert WebP images to JPG or PNG format instantly in your browser. Free, fast, and private.",
};

export default function WebPConverterPage() {
  return (
    <main className="mx-auto max-w-7xl p-4">
      <h1 className="mb-4 text-2xl font-bold">WebP to JPG/PNG Converter</h1>
      <p className="mb-6 text-gray-600">
        Convert your WebP images to JPG or PNG format. Fast, free, and processed
        entirely in your browser for privacy.
      </p>
      <WebPTool />
    </main>
  );
}
