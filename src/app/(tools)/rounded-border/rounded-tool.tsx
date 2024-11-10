"use client"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { ChevronsUpDown, PaintBucket, Scan } from "lucide-react"
import { usePlausible } from "next-plausible"
import { useMemo, useState } from "react"
import { ChangeEvent } from "react"
import React from "react"

type Radius = 2 | 4 | 8 | 16 | 32 | 64

type BackgroundOption = "white" | "black" | "transparent"

function useImageConverter(props: {
  canvas: HTMLCanvasElement | null
  imageContent: string
  radius: Radius
  background: BackgroundOption
  fileName?: string
  imageMetadata: { width: number; height: number; name: string }
}) {
  const { width, height } = useMemo(() => {
    return {
      width: props.imageMetadata.width,
      height: props.imageMetadata.height,
    }
  }, [props.imageContent, props.imageMetadata])

  const convertToPng = async () => {
    const ctx = props.canvas?.getContext("2d")
    if (!ctx) throw new Error("Failed to get canvas context")

    const saveImage = () => {
      if (props.canvas) {
        const dataURL = props.canvas.toDataURL("image/png")
        const link = document.createElement("a")
        link.href = dataURL
        const imageFileName = props.imageMetadata.name ?? "image_converted"
        link.download = `${imageFileName.replace(/\..+$/, "")}.png`
        link.click()
      }
    }

    const img = new Image()
    img.onload = () => {
      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = props.background
      ctx.fillRect(0, 0, width, height)
      ctx.beginPath()
      ctx.moveTo(props.radius, 0)
      ctx.lineTo(width - props.radius, 0)
      ctx.quadraticCurveTo(width, 0, width, props.radius)
      ctx.lineTo(width, height - props.radius)
      ctx.quadraticCurveTo(width, height, width - props.radius, height)
      ctx.lineTo(props.radius, height)
      ctx.quadraticCurveTo(0, height, 0, height - props.radius)
      ctx.lineTo(0, props.radius)
      ctx.quadraticCurveTo(0, 0, props.radius, 0)
      ctx.closePath()
      ctx.clip()
      ctx.drawImage(img, 0, 0, width, height)
      saveImage()
    }

    img.src = props.imageContent
  }

  return {
    convertToPng,
    canvasProps: { width: width, height: height },
  }
}

export const useFileUploader = () => {
  const [imageContent, setImageContent] = useState<string>("")

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
        const img = new Image()
        img.onload = () => {
          setImageMetadata({
            width: img.width,
            height: img.height,
            name: file.name,
          })
          setImageContent(content)
        }
        img.src = content
      }
      reader.readAsDataURL(file)
    }
  }

  const cancel = () => {
    setImageContent("")
    setImageMetadata(null)
  }

  return { imageContent, imageMetadata, handleFileUpload, cancel }
}

interface ImageRendererProps {
  imageContent: string
  radius: Radius
  background: BackgroundOption
}

const ImageRenderer: React.FC<ImageRendererProps> = ({
  imageContent,
  radius,
  background,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (containerRef.current) {
      const imgElement = containerRef.current.querySelector("img")
      if (imgElement) {
        imgElement.style.borderRadius = `${radius}px`
      }
    }
  }, [imageContent, radius])

  return (
    <div ref={containerRef} className="relative max-w-full max-h-full">
      <div
        className="absolute inset-0"
        style={{ backgroundColor: background, borderRadius: 0 }}
      />
      <img
        src={imageContent}
        alt="Preview"
        className="relative rounded-lg"
        style={{ width: "100%", height: "auto" }}
      />
    </div>
  )
}

function SaveAsPngButton({
  imageContent,
  radius,
  background,
  imageMetadata,
}: {
  imageContent: string
  radius: Radius
  background: BackgroundOption
  imageMetadata: { width: number; height: number; name: string }
}) {
  const [canvasRef, setCanvasRef] = React.useState<HTMLCanvasElement | null>(
    null
  )
  const { convertToPng, canvasProps } = useImageConverter({
    canvas: canvasRef,
    imageContent,
    radius,
    background,
    imageMetadata,
  })

  const plausible = usePlausible()

  return (
    <div>
      <canvas ref={setCanvasRef} {...canvasProps} hidden />
      <Button
        onClick={() => {
          plausible("convert-image-to-png")
          convertToPng()
        }}
      >
        Save as PNG
      </Button>
    </div>
  )
}

export function RoundedTool() {
  const { imageContent, imageMetadata, handleFileUpload, cancel } =
    useFileUploader()

  const [radius, setRadius] = useState<Radius>(2)
  const [background, setBackground] = useState<BackgroundOption>("transparent")

  if (!imageMetadata)
    return (
      <div className="flex flex-col p-4 gap-4">
        <p className="text-center">Round the corners of any image</p>
        <div className="flex justify-center">
          <label
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "cursor-pointer"
            )}
          >
            <span>Upload Image</span>
            <input
              type="file"
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
          </label>
        </div>
      </div>
    )

  return (
    <div className="flex flex-col p-4 gap-4 justify-center items-center text-2xl">
      <ImageRenderer
        imageContent={imageContent}
        radius={radius}
        background={background}
      />
      <p>{imageMetadata.name}</p>
      <p>
        Original size: {imageMetadata.width}px x {imageMetadata.height}px
      </p>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <div className="text-muted-foreground flex items-center">
              <Scan className="mr-2 h-4 w-4" />
              Border radius:
            </div>
            {radius}px
            <ChevronsUpDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {([2, 4, 8, 16, 32, 64] as Radius[]).map((value) => (
            <DropdownMenuItem key={value} onClick={() => setRadius(value)}>
              {value}px
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              background === "white"
                ? "text-black hover:text-black bg-neutral-200 hover:bg-neutral-100"
                : background === "black" &&
                    "text-white hover:text-white bg-neutral-700 hover:bg-neutral-600"
            )}
          >
            <div
              className={cn(
                "flex items-center",
                background === "white"
                  ? "text-neutral-600"
                  : background === "black" && "text-neutral-400"
              )}
            >
              <PaintBucket className="mr-2 h-4 w-4" />
              Background color:
            </div>
            {background === "white"
              ? "White"
              : background === "black"
              ? "Black"
              : "Transparent"}
            <ChevronsUpDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setBackground("white")}>
            White
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setBackground("black")}>
            Black
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setBackground("transparent")}>
            Transparent
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="flex gap-2">
        <SaveAsPngButton
          imageContent={imageContent}
          radius={radius}
          background={background}
          imageMetadata={imageMetadata}
        />
        <Button
          onClick={cancel}
          variant="destructive"
        >
          Cancel
        </Button>
      </div>
    </div>
  )
}
