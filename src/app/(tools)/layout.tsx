import Link from "next/link";

function BackButton() {
  return (
    <div className="fixed left-4 top-4 z-50 sm:left-8 sm:top-8">
      <Link
        href="/"
        className="flex items-center gap-2 rounded-lg border border-transparent px-4 py-2 text-[var(--muted)] transition-colors hover:border-[var(--muted)] hover:text-[var(--foreground)]"
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
    <div className="flex min-h-screen flex-col justify-between p-6 font-[family-name:var(--font-geist-sans)] sm:p-12">
      <BackButton />
      <main className="flex flex-grow flex-col items-center justify-center">
        {children}
      </main>
      <footer className="mt-8 text-center text-sm text-gray-500">
        <a
          href="https://github.com/t3dotgg/quickpic"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          View on GitHub
        </a>
      </footer>
    </div>
  );
}
