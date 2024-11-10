import { RoundedTool } from "./rounded-tool";
import { FileDropzone } from "@/components/shared/file-dropzone";

export const metadata = {
  title: "Corner Rounder - QuickPic",
  description: "Round corners on an image (for free because duh)",
};

export default function RoundedToolPage() {
  return (
    <FileDropzone
      acceptedFileTypes={["image/*", ".jpg", ".jpeg", ".png", ".webp"]}
      dropText="Drop image file"
    >
      <RoundedTool />
    </FileDropzone>
  );
}
