import { motion } from "framer-motion";
import React from "react";

interface UploadBoxProps {
  title: string;
  subtitle?: string;
  description: string;
  accept: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function UploadBox({
  title,
  subtitle,
  description,
  accept,
  onChange,
}: UploadBoxProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-4">
      <div className="flex flex-col items-center gap-2">
        <p className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-4xl font-bold text-transparent">
          {title}
        </p>
        {subtitle && (
          <p className="inline-block rounded-full border border-white/30 bg-white/5 px-2 py-0.5 text-center text-sm text-white/60">
            {subtitle}
          </p>
        )}
      </div>
      <div className="backdrop-blur- flex w-72 flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-white/30 bg-gray-500/15 p-6">
        <svg
          className="h-8 w-8 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        <p className="text-sm text-gray-400">Drag and Drop</p>
        <p className="text-gray-400">or</p>
        <motion.label
          whileHover={{ scale: 1.1 }}
          // @ts-expect-error: Framer Motion types are not correct
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 font-semibold text-white shadow-md transition-colors duration-200 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75"
        >
          <span>{description}</span>
          <input
            type="file"
            onChange={onChange}
            accept={accept}
            className="hidden"
          />
        </motion.label>
      </div>
    </div>
  );
}
