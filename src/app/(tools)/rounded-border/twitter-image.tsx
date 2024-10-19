import { GenerateImage } from "@/app/utils/og-generator";

export const runtime = "edge";

export const alt = "Corner Rounder - QuickPic";
export const contentType = "image/png";

export const size = {
  width: 1200,
  height: 630,
};

// Image generation
export default async function Image() {
  return await GenerateImage({
    title: "Corner Rounder",
    description: "Round the corners of an image. For free.",
  });
}
