import { SVGTool } from "./svg-fixer";

export default function Home() {
  return (
    <div className="flex flex-col justify-between min-h-screen p-8 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex-grow flex flex-col items-center justify-center">
        <SVGTool />
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
