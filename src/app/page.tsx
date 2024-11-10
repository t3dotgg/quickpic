import LinkCard from "@/app/components/LinkCard";
import Image from "next/image";
import githubLogo from "@/app/assets/image/github-logo.png";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col justify-between bg-gradient-to-b from-gray-900 via-[#300171] to-slate-900 p-8 font-[family-name:var(--font-geist-sans)] sm:p-20">
      <main className="flex flex-grow flex-col items-center justify-center gap-10">
        <h1 className="text-center text-4xl font-bold tracking-tight text-white sm:text-6xl sm:tracking-tight lg:text-[4rem] xl:text-[6rem] xl:tracking-tight 2xl:text-[6.5rem]">
          <span className="text-[hsl(200,100%,60%)]">Quick,</span>{" "}
          <span className="text-[hsl(240,100%,70%)]">Free,</span> and{" "}
          <span className="text-[hsl(280,100%,60%)]">No BS,</span> Image Tools
        </h1>
        <div>
          Hi. I&apos;m{" "}
          <a
            href="https://twitter.com/t3dotgg"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-500 hover:underline"
          >
            Theo
          </a>
          . I built these tools because I was annoyed they did not exist.
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <LinkCard
            href="/svg-to-png"
            title="SVG to PNG converter"
            description="Convert your SVGs to PNGs."
          />
          <LinkCard
            href="/square-image"
            title="Square image generator"
            description="Make your images square."
          />
          <LinkCard
            href="/rounded-border"
            title="Corner Rounder"
            description="Round the corners of your images."
          />
        </div>
      </main>
      <footer className="mt-8 flex justify-center">
        <a
          href="https://github.com/t3dotgg/quickpic"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 rounded-full bg-white px-4 py-2 text-sm text-gray-500 hover:underline"
        >
          <Image src={githubLogo} alt="Github Logo" width={32} height={32} />
          View on GitHub
        </a>
      </footer>
    </div>
  );
}
