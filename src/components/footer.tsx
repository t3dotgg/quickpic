import { Github, Twitter, Youtube } from "lucide-react";
import Link from "next/link";
import Logo from "./logo";
import Paragraph from "./paragraph";

export default function Footer() {
  return (
    <footer className="flex flex-col items-center gap-3 bg-blue-ribbon-700 px-6 py-4">
      <div className="flex w-full justify-between">
        <Logo />

        <div className="flex gap-3">
          <Link href="https://github.com/t3dotgg/quickpic" target="_blank">
            <Github />
          </Link>
          <Link href="https://x.com/theo" target="_blank">
            <Twitter />
          </Link>
          <Link href="https://www.youtube.com/@t3dotgg" target="_blank">
            <Youtube />
          </Link>
        </div>
      </div>

      <div className="h-[2px] w-full bg-white/25"></div>

      <Paragraph className="text-center">
        &copy; QuickPic {new Date().getFullYear()}. All rights reserved.
      </Paragraph>
    </footer>
  );
}
