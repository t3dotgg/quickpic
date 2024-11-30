import Link from "next/link";

function BackButton() {
  return (
    <div className="fixed left-4 top-4 z-50">
      <Link
        href="/"
        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-300 backdrop-blur-md transition-colors duration-200 hover:text-gray-200 bg-neutral-300/10 hover:bg-neutral-300/20 border border-neutral-300/30 hover:border-neutral-300/50"
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
    <div className="flex min-h-screen flex-col justify-between font-[family-name:var(--font-geist-sans)] sm:p-20">
      <BackButton />
      <main className="flex w-full h-full items-center justify-center">
        {children}
      </main>
      <footer className="mt-10 mb-10 text-center text-sm text-gray-500 w-full">
        <a
          href="https://github.com/t3dotgg/quickpic"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          View on GitHub
        </a>
      </footer>
    </div>
  );
}
