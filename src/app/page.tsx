import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col justify-between min-h-screen p-8 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex-grow flex flex-col items-center justify-center">
        <div>
          Hi. I&apos;m{" "}
          <a
            href="https://twitter.com/t3dotgg"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            Theo
          </a>
          . I built these tools because I was annoyed they did not exist.
        </div>
        <div className="mt-4"></div>
        <Link href="/svg-to-png" className="text-blue-500 hover:underline">
          SVG to PNG converter
        </Link>
        <Link href="/square-image" className="text-blue-500 hover:underline">
          Square image generator
        </Link>
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
