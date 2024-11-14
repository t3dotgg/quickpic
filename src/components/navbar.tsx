"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import { navigationLinks } from "@/constant";
import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Logo from "./logo";
import Paragraph from "./paragraph";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="flex h-[60px] items-center justify-between bg-blue-ribbon-700 px-6 text-white">
      <Logo />

      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetTrigger asChild>
          <button onClick={() => setIsMenuOpen(true)}>
            <Menu />
          </button>
        </SheetTrigger>
        <SheetContent>
          <ul className="w-full">
            {navigationLinks.map((link) => {
              return (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className={`flex items-center gap-4 px-6 py-3 transition-colors ${
                      link.href === "/"
                        ? pathname === "/"
                          ? "bg-blue-ribbon-700 hover:bg-blue-ribbon-600"
                          : "hover:bg-white/10"
                        : pathname.includes(link.href)
                          ? "bg-blue-ribbon-700 hover:bg-blue-ribbon-600"
                          : "hover:bg-white/10"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.image}
                    <Paragraph className="font-bold">{link.label}</Paragraph>
                  </Link>
                </li>
              );
            })}
          </ul>
        </SheetContent>
      </Sheet>
    </nav>
  );
}
