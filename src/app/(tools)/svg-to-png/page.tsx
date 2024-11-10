import { SVGTool } from "./svg-tool";
import { FileDropzone } from "@/components/shared/file-dropzone";

export const metadata = {
  title: "SVG to PNG converter - QuickPic",
  description: "Convert SVGs to PNGs. Also makes them bigger.",
};

export default function SVGToolPage() {
  return (
    <FileDropzone
      acceptedFileTypes={["image/svg+xml", ".svg"]}
      dropText="Drop SVG file"
    >
      <SVGTool />
    </FileDropzone>
  );
}
