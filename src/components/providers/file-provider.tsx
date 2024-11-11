"use client";

import { useState } from "react";
import { FileContext, type FileState } from "@/lib/file-context";

export function FileProvider({ children }: { children: React.ReactNode }) {
  const [currentFile, setCurrentFile] = useState<File | null>(null);

  const value: FileState = {
    currentFile,
    setCurrentFile,
  };

  return <FileContext.Provider value={value}>{children}</FileContext.Provider>;
}
