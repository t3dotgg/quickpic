import { SVGTool } from "./svg-tool";
import AppLayout from "@/components/app-layout";

export const metadata = {
  title: "SVG to PNG converter - QuickPic",
  description: "Convert SVGs to PNGs. Also makes them bigger.",
};

export default function SVGToolPage() {
  return (
    <AppLayout pageName="SVG to PNG converter">
      <SVGTool />
    </AppLayout>
  );
}
