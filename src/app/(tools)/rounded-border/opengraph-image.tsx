import { GenerateImage } from "@/app/utils/og-generator";

export const runtime = "edge";

export const alt = "Square ➡️ Rounded Square - QuickPic";
export const contentType = "image/png";

export const size = {
  width: 1200,
  height: 630,
};

// Image generation
export default async function Image() {
  return await GenerateImage({
    title: "Square ➡️ Rounded Square",
    description: "The only simple way to convert a square image to a rounded square.",
  });
}
