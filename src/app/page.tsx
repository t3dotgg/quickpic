import Link from "next/link";

/**
 * Components
 */
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/app-layout";

/**
 * Icons
 */
import { ArrowLeftRight, Scan, SquareSquare } from "lucide-react";

export default function Home() {
  return (
    <AppLayout pageName="">
      <div className="flex h-full flex-col justify-between font-[family-name:var(--font-geist-sans)]">
        <div className="flex flex-grow flex-col justify-center">
          <div className="mx-auto w-3/4 text-center text-2xl font-bold md:text-5xl">
            Hi. I&apos;m{" "}
            <a
              href="https://twitter.com/t3dotgg"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Theo
            </a>
            . I built these tools because I was annoyed they did not exist.
          </div>
          <div className="mt-4"></div>
          <div className="flex flex-wrap justify-center gap-3">
            <Button>
              <ArrowLeftRight />
              <Link href="/svg-to-png">SVG to PNG converter</Link>
            </Button>
            <Button>
              <SquareSquare />
              <Link href="/square-image">Square image generator</Link>
            </Button>
            <Button>
              <Scan />
              <Link href="/rounded-border">Corner Rounder</Link>
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
