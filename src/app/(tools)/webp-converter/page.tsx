import type { Metadata } from "next";
import { WebPTool } from "./webp-tool";

export const metadata: Metadata = {
  title: "WebP to JPG/PNG Converter | Quick Convert",
  description:
    "Convert WebP images to JPG or PNG format instantly in your browser. Free, fast, and private.",
};

export default function WebPConverterPage() {
  return <WebPTool />;
}
