"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ImageUploader } from "@/components/convert/ImageUploader";
import { ConversionOptions } from "@/components/convert/ConversionOptions";

export default function ConvertPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);

  const handleConvert = async () => {
    if (!selectedFile) return;
    setIsConverting(true);
    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      
      const response = await fetch("/api/convert", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) throw new Error("Conversion failed");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Create download link
      const a = document.createElement("a");
      a.href = url;
      a.download = "favicon.ico";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error converting image:", error);
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">PNG to ICO Converter</h1>
      <Card className="p-6">
        <ImageUploader 
          selectedFile={selectedFile} 
          onFileSelect={setSelectedFile} 
        />
        <ConversionOptions />
        <Button 
          onClick={handleConvert} 
          disabled={!selectedFile || isConverting}
          className="mt-4"
        >
          {isConverting ? "Converting..." : "Convert to ICO"}
        </Button>
      </Card>
    </div>
  );
}