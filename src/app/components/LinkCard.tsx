"use client";

import Link from "next/link";

export default function LinkCard({
  href = "#",
  title = "Colorful Link Card",
  description = "Hover to see the magic!",
}) {
  return (
    <Link
      href={href}
      className="flex flex-col overflow-hidden rounded-md border bg-white/5"
    >
      <h2 className="bg-white/10 p-2 text-center text-lg font-semibold hover:bg-white/20">
        {title}
      </h2>
      <p className="m-6 h-full text-center text-sm subpixel-antialiased md:text-base">
        {description}
      </p>
    </Link>
  );
}
