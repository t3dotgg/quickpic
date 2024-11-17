import { CloudUpload, Upload } from "lucide-react";
import React from "react";
import Heading from "../heading";
import Paragraph from "../paragraph";

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
    <div className="flex-center flex-col gap-4 p-4">
      <div className="flex flex-col items-center gap-4">
        <Heading>{title}</Heading>
        <div className="flex flex-col items-center gap-2">
          {subtitle?.split("\n").map((line, i) => (
            <Paragraph className="w-full" key={i}>
              {line}
              {i !== subtitle.split("\n").length - 1 && <br />}
            </Paragraph>
          ))}
        </div>
      </div>
      <div className="flex-center w-72 flex-col gap-4 rounded-xl border-2 border-dashed border-white/30 bg-white/10 p-6 backdrop-blur-sm">
        <CloudUpload className="size-8" />
        <Paragraph>Drag and Drop</Paragraph>
        <Paragraph className="text-gray-400">or</Paragraph>
        <label htmlFor="upload-file-input" className="label-button">
          <Upload />
          <span>{description}</span>
        </label>
        <input
          id="upload-file-input"
          type="file"
          onChange={onChange}
          accept={accept}
          className="hidden"
        />
      </div>
    </div>
  );
}
