import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col justify-between p-6 sm:p-12">
      <main className="flex flex-grow flex-col items-center justify-center space-y-8">
        <div className="text-center">
          <h1 className="mb-6 text-2xl font-medium">QuickPic</h1>
          <p className="text-[var(--muted)]">
            Simple tools for your images. Built by{" "}
            <a
              href="https://twitter.com/t3dotgg"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] hover:text-[var(--hover)]"
            >
              Theo
            </a>
            .
          </p>
        </div>

        <div className="flex flex-col items-center space-y-4">
          <Link
            href="/svg-to-png"
            className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-[var(--muted)] hover:bg-black/5"
          >
            <h2 className="mb-1 text-xl font-medium">SVG to PNG →</h2>
            <p className="text-sm text-[var(--muted)]">
              Convert SVG files to PNG format
            </p>
          </Link>

          <Link
            href="/square-image"
            className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-[var(--muted)] hover:bg-black/5"
          >
            <h2 className="mb-1 text-xl font-medium">Square Image →</h2>
            <p className="text-sm text-[var(--muted)]">
              Generate perfect square images
            </p>
          </Link>

          <Link
            href="/rounded-border"
            className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-[var(--muted)] hover:bg-black/5"
          >
            <h2 className="mb-1 text-xl font-medium">Corner Rounder →</h2>
            <p className="text-sm text-[var(--muted)]">
              Add rounded corners to images
            </p>
          </Link>
        </div>
      </main>

      <footer className="mt-8 text-center">
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
