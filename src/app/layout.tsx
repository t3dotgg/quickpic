import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import PlausibleProvider from "next-plausible";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";

const kronaOne = localFont({
  src: "./fonts/KronaOne-Regular.ttf",
});

export const metadata: Metadata = {
  title: "QuickPic - Quick Tools For Images",
  description: "A bunch of simple tools for images. All free. No BS.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <PlausibleProvider domain="quickpic.t3.gg" />
      </head>
      <body className={`${kronaOne.className} dark antialiased`}>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
