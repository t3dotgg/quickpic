import { useState, useEffect, type ChangeEvent, type DragEvent } from 'react';

interface UseFileUploadProps {
  onFileProcess: (file: File) => void;
  acceptedTypes?: string;
}

export function useFileUpload({ onFileProcess, acceptedTypes = "image/*" }: UseFileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);

  useEffect(() => {
    function handleDragIn(e: DragEvent) {
      e.preventDefault();
      e.stopPropagation();
      setDragCounter(prev => prev + 1);
      if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
        setIsDragging(true);
      }
    }

    function handleDragOut(e: DragEvent) {
      e.preventDefault();
      e.stopPropagation();
      setDragCounter(prev => prev - 1);
      if (dragCounter - 1 === 0) {
        setIsDragging(false);
      }
    }

    function handleDragOver(e: DragEvent) {
      e.preventDefault();
      e.stopPropagation();
    }

    function handleDrop(e: DragEvent) {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      setDragCounter(0);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        if (acceptedTypes === ".svg") {
          if (file?.name.toLowerCase().endsWith(".svg")) {
            onFileProcess(file);
          } else {
            alert("Please upload an SVG file");
          }
        } else if (file?.type.match(acceptedTypes)) {
          onFileProcess(file);
        }
        e.dataTransfer.clearData();
      }
    }

    window.addEventListener('dragenter', handleDragIn as any);
    window.addEventListener('dragleave', handleDragOut as any);
    window.addEventListener('dragover', handleDragOver as any);
    window.addEventListener('drop', handleDrop as any);

    return () => {
      window.removeEventListener('dragenter', handleDragIn as any);
      window.removeEventListener('dragleave', handleDragOut as any);
      window.removeEventListener('dragover', handleDragOver as any);
      window.removeEventListener('drop', handleDrop as any);
    };
  }, [dragCounter, onFileProcess, acceptedTypes]);

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (acceptedTypes === ".svg") {
        if (file.name.toLowerCase().endsWith(".svg")) {
          onFileProcess(file);
        } else {
          alert("Please upload an SVG file");
        }
      } else if (file.type.match(acceptedTypes)) {
        onFileProcess(file);
      }
    }
  };

  return {
    isDragging,
    handleFileUpload
  };
}
