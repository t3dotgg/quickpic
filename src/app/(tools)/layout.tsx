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
    <div className="flex min-h-screen flex-col justify-between overflow-hidden p-8 font-[family-name:var(--font-geist-sans)] sm:p-20">
      <BackButton />
      <main className="flex flex-grow flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 left-[-10%] top-[50%] z-50 h-[300px] w-[300px] animate-scalePulse rounded-full bg-gradient-to-br from-purple-800 to-purple-600 opacity-50 blur-[250px] md:h-[500px] md:w-[500px] lg:h-[700px] lg:w-[700px]"></div>

        {children}
      </main>
      <footer className="mt-8 text-center text-sm text-gray-500">
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
