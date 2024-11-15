import Heading from "@/components/heading";
import Paragraph from "@/components/paragraph";
import { Button } from "@/components/ui/button";
import { heroLinks } from "@/constant";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-center relative flex-col gap-4 bg-[url('/background.svg')]">
      <Heading>QuickPic</Heading>
      <Paragraph className="w-[282px] text-center">
        Hi. I&apos;m{" "}
        <Link
          href="https://twitter.com/t3dotgg"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-ribbon-400 underline-offset-4 hover:underline"
        >
          Theo
        </Link>
        . I built these tools because I was annoyed they did not exist.
      </Paragraph>

      <div className="flex w-[272px] flex-col gap-2">
        {heroLinks.map((link) => (
          <Link key={link.label} href={link.href}>
            <Button className="w-full">
              {link.image}
              <span>{link.label}</span>
            </Button>
          </Link>
        ))}
      </div>
    </main>
  );
}
