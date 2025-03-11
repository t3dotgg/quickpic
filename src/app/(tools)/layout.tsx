import Link from "next/link";

import { Footer } from "@/components/shared/footer";
import { ArrowLeftIcon } from "@/components/shared/icons";

function BackButton() {
  return (
    <div className="fixed left-4 top-4 z-50">
      <Link
        href="/"
        className="flex items-center gap-2 px-3 py-1 text-sm font-medium text-gray-500 transition-colors duration-200 hover:text-gray-200"
      >
        <ArrowLeftIcon strokeWidth={2.5} />
        Back
      </Link>
    </div>
  );
}

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col justify-between px-8 pb-4 font-[family-name:var(--font-geist-sans)]">
      <BackButton />
      <main className="mt-[60px] flex grow flex-col items-center justify-center">
        {children}
      </main>
      <Footer />
    </div>
  );
}
