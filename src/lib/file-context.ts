import { createContext, useContext } from "react";

export interface FileState {
  currentFile: File | null;
  setCurrentFile: (file: File | null) => void;
}

export const FileContext = createContext<FileState | null>(null);

export function useFileState() {
  const context = useContext(FileContext);
  if (!context) {
    throw new Error("useFileState must be used within a FileProvider");
  }
  return context;
}
