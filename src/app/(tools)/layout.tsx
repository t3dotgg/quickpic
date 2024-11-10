import Link from "next/link";

function BackButton() {
  return (
    <div className="fixed left-4 top-4 z-50">
      <Link
        href="/"
        className="flex items-center gap-2 rounded-md px-3 py-1 text-sm font-medium text-gray-400 transition-colors duration-200 hover:text-gray-200"
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
    <div className="flex flex-col min-h-screen p-8 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <BackButton />
      <main className="flex-1 h-full flex">{children}</main>
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
