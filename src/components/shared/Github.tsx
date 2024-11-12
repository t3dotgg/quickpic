"use client";
import { motion } from "framer-motion";
import { Github } from "lucide-react";
import { Button } from "../ui/button";

export default function GitHubLink({}) {
  return (
    <Button
      className={`relative border-zinc-700 bg-zinc-800 text-white hover:border-zinc-600 hover:bg-zinc-800 hover:text-white`}
    >
      <a
        href={"https://github.com/t3dotgg/quickpic"}
        target="_blank"
        rel="noopener noreferrer"
        className="relative flex items-center gap-2 transition-all hover:underline"
      >
        <Github className="h-5 w-5" />
        <span className="sr-only">GitHub</span>
        View on Github
      </a>
      <div className="absolute right-0 top-0 z-10 flex h-1.5 w-1.5 items-center justify-center rounded-full bg-purple-500 p-1">
        <div className="z-10 h-2 w-2 animate-ping rounded-full bg-purple-500 p-1.5" />
      </div>
    </Button>
  );
}
