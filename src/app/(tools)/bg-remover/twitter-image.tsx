import { GenerateImage } from "@/app/utils/og-generator";

export const runtime = "edge";

export const alt = "Background Remover - QuickPic";
export const contentType = "image/png";

export const size = {
  width: 1200,
  height: 630,
};

// Image generation
export default async function Image() {
  return await GenerateImage({
    title: "Background Remover",
    description: "Remove the background of an image. For free.",
  });
}
