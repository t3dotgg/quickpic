import Link from "next/link";

function BackButton() {
  return (
    <div className="fixed top-4 left-4 z-50">
      <Link
        href="/"
        className="px-3 py-1 text-gray-400 hover:text-gray-200 text-sm font-medium rounded-md transition-colors duration-200 flex items-center gap-2"
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
    <div className="flex flex-col justify-between min-h-screen p-8 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <BackButton />
      <main className="flex-grow flex flex-col items-center justify-center">
        {children}
      </main>
      <footer className="text-center text-sm text-gray-500 mt-8">
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
