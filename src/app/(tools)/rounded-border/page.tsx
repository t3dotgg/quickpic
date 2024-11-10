import { RoundedTool } from "./rounded-tool";
import AppLayout from "@/components/app-layout";

export const metadata = {
  title: "Corner Rounder - QuickPic",
  description: "Round corners on an image (for free because duh)",
};

export default function RoundedToolPage() {
  return (
    <AppLayout pageName="Corner Rounder">
      <RoundedTool />
    </AppLayout>
  );
}
