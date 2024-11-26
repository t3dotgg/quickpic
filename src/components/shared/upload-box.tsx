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
    <div className="flex flex-col items-center justify-center gap-6 p-4">
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-2xl font-medium">{title}</h1>
        {subtitle && (
          <p className="rounded-lg border border-[var(--muted)] bg-black/5 px-3 py-1 text-center text-sm text-[var(--muted)]">
            {subtitle}
          </p>
        )}
      </div>
      <div className="group flex w-80 flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-[var(--muted)] bg-black/5 p-8 transition-colors hover:border-[var(--foreground)] hover:bg-black/10">
        <svg
          className="h-8 w-8 text-[var(--muted)] transition-colors group-hover:text-[var(--foreground)]"
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
        <p className="text-sm text-[var(--muted)] transition-colors group-hover:text-[var(--foreground)]">
          Drag and Drop
        </p>
        <p className="text-sm text-[var(--muted)]">or</p>
        <label className="cursor-pointer rounded-lg border border-transparent bg-[var(--accent)] px-4 py-2 font-medium text-white transition-colors hover:bg-[var(--hover)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-opacity-50">
          <span>{description}</span>
          <input
            type="file"
            onChange={onChange}
            accept={accept}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
}
