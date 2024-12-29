import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col justify-between p-8 font-[family-name:var(--font-geist-sans)] sm:p-20">
      <main
        className="flex flex-grow flex-col items-center justify-center gap-4"
        role="main"
      >
        <section className="text-center" aria-labelledby="introduction">
          <h1 id="introduction">
            Hi. I&apos;m{" "}
            <a
              href="https://twitter.com/t3dotgg"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
              aria-label="Theo's Twitter profile"
            >
              Theo
            </a>
            . I built these tools because I was annoyed they did not exist.
          </h1>
        </section>

        <nav className="flex flex-col text-center" aria-label="Main navigation">
          <Link
            href="/svg-to-png"
            className="text-blue-500 hover:underline"
            aria-label="SVG to PNG converter"
          >
            SVG to PNG converter
          </Link>

          <Link
            href="/square-image"
            className="text-blue-500 hover:underline"
            aria-label="Square image generator"
          >
            Square image generator
          </Link>

          <Link
            href="/rounded-border"
            className="text-blue-500 hover:underline"
            aria-label="Corner Rounder"
          >
            Corner Rounder
          </Link>
        </nav>
      </main>

      <footer
        className="mt-8 text-center text-sm text-gray-500"
        aria-label="Footer"
      >
        <a
          href="https://github.com/t3dotgg/quickpic"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
          aria-label="View the project on GitHub"
        >
          View on GitHub
        </a>
      </footer>
    </div>
  );
}
