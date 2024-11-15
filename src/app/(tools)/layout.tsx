import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex-center relative flex-col gap-4 bg-[url('/background.svg')]">
      <Link href="/" className="absolute left-1 top-2">
        <Button variant="secondary">
          <ArrowLeft />
          <span>Back</span>
        </Button>
      </Link>
      {children}
    </main>
  );
}
