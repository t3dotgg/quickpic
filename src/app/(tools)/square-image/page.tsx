import { SquareTool } from "./square-tool";
import { FileDropzone } from "@/components/shared/file-dropzone";

export const metadata = {
  title: "Square Image Generator - QuickPic",
  description:
    "Have an image you wish was square? We gotchu. Good for YouTube Community posts especially",
};

export default function SquareToolPage() {
  return (
    <FileDropzone 
      acceptedFileTypes={["image/*", ".jpg", ".jpeg", ".png", ".webp"]} 
      dropText="Drop image file"
    >
      <SquareTool />
    </FileDropzone>
  );
}