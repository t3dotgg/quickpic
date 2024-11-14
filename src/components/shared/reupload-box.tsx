import React from "react";

interface ReuploadBoxProps {
  accept: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ReuploadBox({ accept, onChange }: ReuploadBoxProps) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-white shadow-sm transition-colors focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 hover:bg-blue-700">
      <span className="text-sm font-medium">Reupload</span>
      <input
        type="file"
        onChange={onChange}
        accept={accept}
        className="hidden"
      />
    </label>
  );
}
