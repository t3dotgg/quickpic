import React, { useRef } from "react";

import { UploadIcon } from "@/components/shared/icons";

import { useKeyDown } from "@/hooks/use-keydown";

interface UploadBoxProps {
  title: string;
  subtitle?: string;
  subtitleIcon?: React.ReactElement;
  description: string;
  accept: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function UploadBox({
  title,
  subtitle,
  subtitleIcon,
  description,
  accept,
  onChange,
}: UploadBoxProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputLabelRef = useRef<HTMLLabelElement>(null);

  useKeyDown(["Enter", "Space"], () => {
    if (
      fileInputRef.current &&
      document.activeElement === fileInputLabelRef.current
    ) {
      fileInputRef.current.click();
    }
  });

  return (
    <div className="flex w-full flex-col items-center justify-center gap-4">
      <div className="flex flex-col items-center gap-2">
        <p id="upload-box-title" className="text-center text-white">
          {title}
        </p>
        {subtitle && (
          <p
            id="upload-box-subtitle"
            className="flex items-center gap-1 rounded-full border border-white/30 bg-white/5 px-3 py-0.5 text-center text-sm text-white/60"
          >
            {subtitleIcon}
            {subtitle}
          </p>
        )}
      </div>
      <div
        role="group"
        aria-labelledby="upload-box-title"
        aria-describedby="upload-box-instructions"
        className="flex w-full max-w-container flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-white/30 bg-white/5 p-6 backdrop-blur-sm sm:w-container"
      >
        <UploadIcon className="size-8 text-gray-500" />
        <p className="text-sm font-medium text-gray-500">Drag and Drop</p>
        <p className="text-sm font-medium text-gray-500">or</p>
        <label
          ref={fileInputLabelRef}
          role="button"
          tabIndex={0}
          className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-colors duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
        >
          <span>{description}</span>
          <input
            ref={fileInputRef}
            type="file"
            onChange={onChange}
            accept={accept}
            className="hidden"
            aria-labelledby="upload-box-title"
            aria-describedby="upload-box-instructions"
            aria-hidden="true"
          />
        </label>
      </div>
    </div>
  );
}
