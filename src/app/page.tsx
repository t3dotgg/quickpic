import Link from "next/link";

import { Footer } from "@/components/shared/footer";
import {
  ArrowUpRightIcon,
  CornerRounderIcon,
  SquareImageIcon,
  SvgToPngIcon,
} from "@/components/shared/icons";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col justify-between px-8 pb-4 font-[family-name:var(--font-geist-sans)]">
      <main className="mt-[60px] flex grow flex-col items-center justify-center text-center">
        <div>
          Hi. I&apos;m{" "}
          <a
            href="https://twitter.com/t3dotgg"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center font-medium text-gray-500 transition-colors duration-200 hover:text-white focus:text-white focus:outline-0"
          >
            Theo
            <ArrowUpRightIcon />
          </a>
          . I built these tools because I was annoyed they did not exist.
        </div>
        <div className="mt-8 flex flex-col justify-center gap-2">
          <Link
            href="/svg-to-png"
            className="inline-flex items-center justify-center gap-2 font-medium text-blue-500 transition-colors duration-200 hover:text-white focus:text-white focus:outline-0"
            tabIndex={0}
          >
            <SvgToPngIcon />
            SVG to PNG Converter
          </Link>
          <Link
            href="/square-image"
            className="inline-flex items-center justify-center gap-2 font-medium text-blue-500 transition-colors duration-200 hover:text-white focus:text-white focus:outline-0"
            tabIndex={0}
          >
            <SquareImageIcon />
            Square Image Generator
          </Link>
          <Link
            href="/rounded-border"
            className="inline-flex items-center justify-center gap-2 font-medium text-blue-500 transition-colors duration-200 hover:text-white focus:text-white focus:outline-0"
            tabIndex={0}
          >
            <CornerRounderIcon />
            Corner Rounder
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
