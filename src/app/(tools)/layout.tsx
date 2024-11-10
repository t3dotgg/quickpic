import Image from "next/image";
import Link from "next/link";
import githubLogo from "@/app/assets/image/github-logo.png";

function BackButton() {
  return (
    <div className="fixed left-4 top-4 z-50">
      <Link
        href="/"
        className="flex aspect-square items-center gap-2 rounded-md border border-white/90 px-3 py-1 text-sm font-medium text-gray-200 transition-colors duration-200 hover:border-white/70 hover:text-gray-400"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
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
    <div className="flex min-h-screen flex-col justify-between bg-gradient-to-b from-gray-900 via-[#300171] to-slate-900 p-8 font-[family-name:var(--font-geist-sans)] sm:p-20">
      <BackButton />
      <main className="flex flex-grow flex-col items-center justify-center">
        {children}
      </main>
      <footer className="mt-8 flex justify-center">
        <a
          href="https://github.com/t3dotgg/quickpic"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 rounded-full bg-white px-4 py-2 text-sm text-gray-500 hover:underline"
        >
          <Image src={githubLogo} alt="Github Logo" width={32} height={32} />
          View on GitHub
        </a>
      </footer>
    </div>
  );
}
