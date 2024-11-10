import Link from "next/link";

/**
 * Components
 */
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/app-layout";

/**
 * Icons
 */
import { ArrowLeftRight, Scan, SquareSquare } from 'lucide-react';


export default function Home() {
  return (
    <AppLayout pageName="">
      <div className="flex h-full flex-col justify-between font-[family-name:var(--font-geist-sans)]">
        <div className="flex flex-grow flex-col justify-center">
          <div className="md:text-5xl text-2xl text-center font-bold w-3/4 mx-auto">
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
          <div className="flex gap-3 justify-center flex-wrap">
            <Button>
              <ArrowLeftRight />
              <Link href="/svg-to-png">
                SVG to PNG converter
              </Link>
            </Button>
            <Button>
              <SquareSquare />
              <Link href="/square-image">
                Square image generator
              </Link>
            </Button>
            <Button>
              <Scan />
              <Link href="/rounded-border">
                Corner Rounder
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
