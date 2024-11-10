import  { type ChangeEvent, useState } from 'react'

const useFileUploader = () => {
    const [svgContent, setSvgContent] = useState<string>("");

    const [imageMetadata, setImageMetadata] = useState<{
      width: number;
      height: number;
      name: string;
    } | null>(null);
  
    const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) throw new Error("No file found");
  
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
  
        // Extract width and height from SVG content
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(content, "image/svg+xml");
        const svgElement = svgDoc.documentElement;
        const width = parseInt(svgElement.getAttribute("width") ?? "300");
        const height = parseInt(svgElement.getAttribute("height") ?? "150");
  
        setSvgContent(content);
        setImageMetadata({ width, height, name: file.name });
      };
      reader.readAsText(file);
    };
  
    const cancel = () => {
      setSvgContent("");
      setImageMetadata(null);
    };
  
    return { svgContent, imageMetadata, handleFileUpload, cancel };
}

export default useFileUploader
