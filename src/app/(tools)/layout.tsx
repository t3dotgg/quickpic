import Link from "next/link";

function BackButton() {
  return (
    <div className="fixed left-4 top-4 z-50">
      <Link
        href="/"
        className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-gray-400 transition-all duration-200 hover:bg-gray-800/50 hover:text-gray-200"
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
    <div className="flex min-h-screen flex-col bg-gray-950 text-gray-50">
      <BackButton />
      <main className="flex flex-grow flex-col items-center justify-center p-6 sm:p-20">
        <div className="w-full max-w-3xl">
          {children}
        </div>
      </main>
      <footer className="p-8 text-center text-sm text-gray-500">
        <a
          href="https://github.com/t3dotgg/quickpic"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-300 transition-colors"
        >
          View on GitHub
        </a>
      </footer>
    </div>
  );
}
