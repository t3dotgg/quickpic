"use client";

import { useEffect, useState } from "react";
import GitHubLink from "@/components/shared/Github";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Circle, Star, Wrench } from "lucide-react";
import Link from "next/link";

function Page() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  return (
    <div className="flex min-h-screen flex-col justify-between p-8 font-[family-name:var(--font-geist-sans)] sm:p-20">
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          // @ts-expect-error: Framer Motion types are not correct
          className="h-96 w-96 border-4 border-purple-500"
          animate={{
            rotate: 360,
            borderRadius: ["0%", "50%", "0%"],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
      <main className="z-50 flex flex-grow flex-col items-center justify-center">
        <motion.div
          // @ts-expect-error: Framer Motion types are not correct
          className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          animate={isLoaded ? "visible" : "hidden"}
          variants={containerVariants}
        >
          <ToolCard
            title="SVG To JPEG converter"
            description="Convert Or Scale your SVG to JPEG"
            href="/svg-to-png"
            icon={<Star className="h-6 w-6" aria-hidden="true" />}
          />
          <ToolCard
            title="Square Image Tool"
            description="Convert your image to a square"
            href="/square-image"
            icon={<Wrench className="h-6 w-6" aria-hidden="true" />}
          />
          <ToolCard
            title="Rounded Border Tool"
            description="Make rounded borders"
            href="/rounded-border"
            icon={<Circle className="h-6 w-6" aria-hidden="true" />}
          />
        </motion.div>
      </main>
      <footer className="mt-8 text-center text-sm text-gray-400">
        <GitHubLink />
      </footer>
    </div>
  );
}

function ToolCard({
  title,
  description,
  href,
  icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}) {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ scale: 1.05 }}
      // @ts-expect-error: Framer Motion types are not correct
      className="flex h-[200px] w-full min-w-[280px] flex-col items-start justify-between rounded-xl border border-gray-700 bg-gray-500/15 p-6 backdrop-blur-lg transition-colors"
    >
      <div className="flex flex-col items-start justify-center space-y-2">
        <span className="flex flex-row items-center gap-2 text-white">
          {icon}
          <h2 className="cursor-default text-2xl font-bold">{title}</h2>
        </span>
        <p className="cursor-default text-gray-300">{description}</p>
      </div>
      <Link href={href} className="w-full">
        <Button
          className="w-full border-none bg-purple-600 text-white hover:bg-purple-700"
          size="lg"
        >
          Use
        </Button>
      </Link>
    </motion.div>
  );
}

export default Page;
