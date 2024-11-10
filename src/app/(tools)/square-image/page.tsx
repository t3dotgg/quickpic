import { SquareTool } from "./square-tool";
import AppLayout from "@/components/app-layout";

export const metadata = {
  title: "Square Image Generator - QuickPic",
  description:
    "Have an image you wish was square? We gotchu. Good for YouTube Community posts especially",
};

export default function SquareToolPage() {
  return (
    <AppLayout pageName="Square Image Generator">
      <SquareTool />
    </AppLayout>
  );
}
