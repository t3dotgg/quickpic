import { GenerateImage } from "@/app/utils/og-generator";

export const runtime = "edge";

export const alt = "PNG ➡️ ICO - QuickPic";
export const contentType = "image/png";

export const size = {
  width: 1200,
  height: 630,
};

// Image generation
export default async function Image() {
  return await GenerateImage({
    title: "PNG ➡️ ICO",
    description: "Convert your PNG images to ICO format. For free.",
  });
}
