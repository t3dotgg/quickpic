"use client"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { ChevronsUpDown, SlidersHorizontal } from "lucide-react"
import { usePlausible } from "next-plausible"
import { useMemo, useState } from "react"

import { ChangeEvent } from "react"

type Scale = 1 | 2 | 4 | 8 | 16 | 32 | 64

function scaleSvg(svgContent: string, scale: Scale) {
  const parser = new DOMParser()
  const svgDoc = parser.parseFromString(svgContent, "image/svg+xml")
  const svgElement = svgDoc.documentElement
  const width = parseInt(svgElement.getAttribute("width") || "300")
  const height = parseInt(svgElement.getAttribute("height") || "150")

  const scaledWidth = width * scale
  const scaledHeight = height * scale

  svgElement.setAttribute("width", scaledWidth.toString())
  svgElement.setAttribute("height", scaledHeight.toString())

  return new XMLSerializer().serializeToString(svgDoc)
}

function useSvgConverter(props: {
  canvas: HTMLCanvasElement | null
  svgContent: string
  scale: Scale
  fileName?: string
  imageMetadata: { width: number; height: number; name: string }
}) {
  const { width, height, scaledSvg } = useMemo(() => {
    const scaledSvg = scaleSvg(props.svgContent, props.scale)

    return {
      width: props.imageMetadata.width * props.scale,
      height: props.imageMetadata.height * props.scale,
      scaledSvg,
    }
  }, [props.svgContent, props.scale, props.imageMetadata])

  const convertToPng = async () => {
    const ctx = props.canvas?.getContext("2d")
    if (!ctx) throw new Error("Failed to get canvas context")

    // Trigger a "save image" of the resulting canvas content
    const saveImage = () => {
      if (props.canvas) {
        const dataURL = props.canvas.toDataURL("image/png")
        const link = document.createElement("a")
        link.href = dataURL
        const svgFileName = props.imageMetadata.name ?? "svg_converted"

        // Remove the .svg extension
        link.download = `${svgFileName.replace(".svg", "")}-${props.scale}x.png`
        link.click()
      }
    }

    const img = new Image()
    // Call saveImage after the image has been drawn
    img.onload = () => {
      ctx.drawImage(img, 0, 0)
      saveImage()
    }

    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
      scaledSvg
    )}`
  }

  return {
    convertToPng,
    canvasProps: { width: width, height: height },
  }
}

export const useFileUploader = () => {
  const [svgContent, setSvgContent] = useState<string>("")

  const [imageMetadata, setImageMetadata] = useState<{
    width: number
    height: number
    name: string
  } | null>(null)

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string

        // Extract width and height from SVG content
        const parser = new DOMParser()
        const svgDoc = parser.parseFromString(content, "image/svg+xml")
        const svgElement = svgDoc.documentElement
        const width = parseInt(svgElement.getAttribute("width") || "300")
        const height = parseInt(svgElement.getAttribute("height") || "150")

        setSvgContent(content)
        setImageMetadata({ width, height, name: file.name })
      }
      reader.readAsText(file)
    }
  }

  const cancel = () => {
    setSvgContent("")
    setImageMetadata(null)
  }

  return { svgContent, imageMetadata, handleFileUpload, cancel }
}

import React from "react"

interface SVGRendererProps {
  svgContent: string
}

const SVGRenderer: React.FC<SVGRendererProps> = ({ svgContent }) => {
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = svgContent
      const svgElement = containerRef.current.querySelector("svg")
      if (svgElement) {
        svgElement.setAttribute("width", "100%")
        svgElement.setAttribute("height", "auto")
      }
    }
  }, [svgContent])

  return <div ref={containerRef} />
}

function SaveAsPngButton({
  svgContent,
  scale,
  imageMetadata,
}: {
  svgContent: string
  scale: Scale
  imageMetadata: { width: number; height: number; name: string }
}) {
  const [canvasRef, setCanvasRef] = React.useState<HTMLCanvasElement | null>(
    null
  )
  const { convertToPng, canvasProps } = useSvgConverter({
    canvas: canvasRef,
    svgContent,
    scale,
    imageMetadata,
  })

  const plausible = usePlausible()

  return (
    <div>
      <canvas ref={setCanvasRef} {...canvasProps} hidden />
      <Button
        onClick={() => {
          plausible("convert-svg-to-png")
          convertToPng()
        }}
      >
        Save as PNG
      </Button>
    </div>
  )
}

export function SVGTool() {
  const { svgContent, imageMetadata, handleFileUpload, cancel } =
    useFileUploader()

  const [scale, setScale] = useState<Scale>(1)

  if (!imageMetadata)
    return (
      <div className="flex flex-col p-4 gap-4">
        <p className="text-center">
          Make SVGs into PNGs. Also makes them bigger. (100% free btw.)
        </p>
        <div className="flex justify-center">
          <label
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "cursor-pointer"
            )}
          >
            <span>Upload SVG</span>
            <input
              type="file"
              onChange={handleFileUpload}
              accept=".svg"
              className="hidden"
            />
          </label>
        </div>
      </div>
    )

  return (
    <div className="flex flex-col p-4 gap-4 justify-center items-center text-2xl">
      <SVGRenderer svgContent={svgContent} />
      <p>{imageMetadata.name}</p>
      <p>
        Original size: {imageMetadata.width}px x {imageMetadata.height}px
      </p>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <div className="text-muted-foreground flex items-center">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Scale:
            </div>
            {scale}x
            <div className="text-muted-foreground">
              ({imageMetadata.width * scale}px x {imageMetadata.height * scale}
              px)
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {([1, 2, 4, 8, 16, 32, 64] as Scale[]).map((value) => (
            <DropdownMenuItem
              key={value}
              onClick={() => setScale(value)}
              className="flex gap-1"
            >
              <div>{value}x</div>
              <div className="text-xs text-muted-foreground">
                {imageMetadata.width * value}px x {imageMetadata.height * value}
                px
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="flex gap-2 items-center">
        <SaveAsPngButton
          svgContent={svgContent}
          scale={scale}
          imageMetadata={imageMetadata}
        />
        <Button onClick={cancel} variant="destructive">
          Cancel
        </Button>
      </div>
    </div>
  )
}
