import { RoundedTool } from "./rounded-tool";
import { FileDropzone } from "@/components/shared/file-dropzone";
import { FileProvider } from "@/components/providers/file-provider";

export const metadata = {
  title: "Corner Rounder - QuickPic",
  description: "Round corners on an image (for free because duh)",
};

export default function RoundedToolPage() {
  return (
    <FileProvider>
      <FileDropzone
        acceptedFileTypes={["image/*", ".jpg", ".jpeg", ".png", ".webp"]}
        dropText="Drop image file"
      >
        <RoundedTool />
      </FileDropzone>
    </FileProvider>
  );
}
