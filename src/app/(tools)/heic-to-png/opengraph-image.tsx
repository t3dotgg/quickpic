import { GenerateImage } from "@/app/utils/og-generator";

export const runtime = "edge";

export const alt = "HEIC to PNG - QuickPic";
export const contentType = "image/png";

export const size = {
  width: 1200,
  height: 630,
};

export default async function Image() {
  return await GenerateImage({
    title: "HEIC to PNG",
    description: "Convert Apple photos easily.",
  });
}
