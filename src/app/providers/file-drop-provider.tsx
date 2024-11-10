import React, { createContext, useState, ReactNode, RefObject } from "react";

interface FileDropProviderProps {
  children: ReactNode;
  inputRef: RefObject<HTMLInputElement | null>;
}

interface FileDropContextType {
  isDragging: boolean;
}

const FileDropContext = createContext<FileDropContextType>({
  isDragging: false,
});

export const FileDropProvider: React.FC<FileDropProviderProps> = ({
  children,
  inputRef,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];

      // Check if the file type matches the allowed types in the input's accept attribute
      const accept = inputRef.current?.accept;
      const allowedTypes = accept ? accept.split(",") : [];
      console.log("Current file type: ", file.type);
      console.log("Allowed types: ", allowedTypes);
      const isFileTypeAllowed = allowedTypes.some((type) => {
        type = type.trim();
        return (
          file.type === type ||
          (type === "image/*" && file.type.startsWith("image/")) ||
          (type.startsWith(".") && file.name.endsWith(type))
        );
      });

      if (isFileTypeAllowed && inputRef.current) {
        inputRef.current.files = e.dataTransfer.files;

        // Trigger the change event on the input to update the file input's state
        const event = new Event("change", { bubbles: true });
        inputRef.current.dispatchEvent(event);
        e.dataTransfer.clearData();
      } else {
        alert("File type not allowed. Please upload a valid file.");
      }
    }
  };

  return (
    <FileDropContext.Provider value={{ isDragging }}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative flex-1 flex items-center justify-center ${
          isDragging ? "opacity-50" : ""
        }`}
      >
        {children}
        {isDragging && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 select-none border border-dashed rounded-md">
            <p className="text-white text-lg font-bold">
              You can drop the file here
            </p>
          </div>
        )}
      </div>
    </FileDropContext.Provider>
  );
};
