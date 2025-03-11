import { SVGTool } from "./svg-tool";

export const metadata = {
  title: "SVG to PNG Converter - QuickPic",
  description: "Convert SVGs to PNGs. Also makes them bigger.",
};

export default function SVGToolPage() {
  return <SVGTool title={metadata.title} />;
}
