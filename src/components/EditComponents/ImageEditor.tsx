"use client"

import type React from "react"
import { useRef, useState, useEffect, useCallback } from "react"
import {
  Upload,
  Download,
  RotateCw,
  Move,
  Maximize,
  Box,
  Monitor,
  Smartphone,
  Twitter,
  Layout,
  Palette,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { ControlPopover } from "@/components/EditComponents/ControlPopover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Transform {
  x: number
  y: number
  scale: number
  rotation: number
  skewX: number
  skewY: number
}

interface Template {
  id: string
  name: string
  icon: React.ReactNode
  frame: string
  contentPosition: {
    x: number
    y: number
    width: number
    height: number
  }
}

const backgrounds = [
  "https://images.unsplash.com/photo-1557683316-973673baf926?w=800&q=80",
  "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=800&q=80",
  "https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?w=800&q=80",
  "linear-gradient(to right, hsl(var(--primary)), hsl(var(--secondary)))",
  "linear-gradient(to right, hsl(var(--destructive)), hsl(var(--secondary)))",
]

const templates: Template[] = [
  {
    id: "none",
    name: "No Frame",
    icon: <Box className="h-4 w-4" />,
    frame: "",
    contentPosition: { x: 0, y: 0, width: 800, height: 600 },
  },
  {
    id: "iphone",
    name: "iPhone",
    icon: <Smartphone className="h-4 w-4" />,
    frame: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80",
    contentPosition: { x: 100, y: 80, width: 600, height: 440 },
  },
  {
    id: "macbook",
    name: "MacBook",
    icon: <Monitor className="h-4 w-4" />,
    frame: "https://images.unsplash.com/photo-1517336714731-489689fd1ca4?w=800&q=80",
    contentPosition: { x: 120, y: 60, width: 560, height: 380 },
  },
  {
    id: "twitter",
    name: "Twitter Post",
    icon: <Twitter className="h-4 w-4" />,
    frame: "https://images.unsplash.com/photo-1611162618758-2a29ed739446?w=800&q=80",
    contentPosition: { x: 80, y: 120, width: 640, height: 360 },
  },
]

const presetPositions = [
  { name: "Center", x: 400, y: 300 },
  { name: "Top Left", x: 200, y: 150 },
  { name: "Top Right", x: 600, y: 150 },
  { name: "Bottom Left", x: 200, y: 450 },
  { name: "Bottom Right", x: 600, y: 450 },
]

const presetScales = [
  { name: "100%", scale: 1 },
  { name: "75%", scale: 0.75 },
  { name: "50%", scale: 0.5 },
  { name: "125%", scale: 1.25 },
  { name: "150%", scale: 1.5 },
]

export default function ImageEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const bgImageRef = useRef<HTMLImageElement | null>(null)
  const frameImageRef = useRef<HTMLImageElement | null>(null)
  const rafRef = useRef<number>(0)

  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null)
  const [selectedBg, setSelectedBg] = useState<string>(backgrounds[0])
  const [selectedTemplate, setSelectedTemplate] = useState<Template>(templates[0])
  const [transform, setTransform] = useState<Transform>({
    x: 400,
    y: 300,
    scale: 1,
    rotation: 0,
    skewX: 0,
    skewY: 0,
  })

  const applyPresetPosition = (preset: (typeof presetPositions)[0]) => {
    setTransform((prev) => ({
      ...prev,
      x: preset.x,
      y: preset.y,
    }))
  }

  const applyPresetScale = (preset: (typeof presetScales)[0]) => {
    setTransform((prev) => ({
      ...prev,
      scale: preset.scale,
    }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.src = event.target?.result as string
        img.onload = () => setSelectedImage(img)
      }
      reader.readAsDataURL(file)
    }
  }

  const loadImage = useCallback((url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => resolve(img)
      img.src = url
    })
  }, [])

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (selectedBg.startsWith("linear-gradient")) {
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      const colors = selectedBg.match(/hsl$$[^)]+$$/g) || []
      colors.forEach((color, index) => {
        gradient.addColorStop(index / (colors.length - 1), color)
      })
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    } else if (bgImageRef.current) {
      ctx.drawImage(bgImageRef.current, 0, 0, canvas.width, canvas.height)
    }

    if (selectedImage) {
      const { contentPosition } = selectedTemplate

      ctx.save()

      ctx.beginPath()
      ctx.rect(contentPosition.x, contentPosition.y, contentPosition.width, contentPosition.height)
      ctx.clip()

      ctx.translate(transform.x, transform.y)
      ctx.rotate((transform.rotation * Math.PI) / 180)
      ctx.scale(transform.scale, transform.scale)
      ctx.transform(1, transform.skewY, transform.skewX, 1, 0, 0)

      ctx.drawImage(
        selectedImage,
        -selectedImage.width / 2,
        -selectedImage.height / 2,
        selectedImage.width,
        selectedImage.height,
      )

      ctx.restore()
    }

    if (frameImageRef.current && selectedTemplate.frame) {
      ctx.drawImage(frameImageRef.current, 0, 0, canvas.width, canvas.height)
    }
  }, [selectedImage, selectedBg, transform, selectedTemplate])

  const requestDraw = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
    }
    rafRef.current = requestAnimationFrame(drawCanvas)
  }, [drawCanvas])

  useEffect(() => {
    if (!selectedBg.startsWith("linear-gradient")) {
      loadImage(selectedBg).then((img) => {
        bgImageRef.current = img
        requestDraw()
      })
    } else {
      bgImageRef.current = null
      requestDraw()
    }

    if (selectedTemplate.frame) {
      loadImage(selectedTemplate.frame).then((img) => {
        frameImageRef.current = img
        requestDraw()
      })
    } else {
      frameImageRef.current = null
      requestDraw()
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [selectedBg, selectedTemplate, requestDraw, loadImage])

  useEffect(() => {
    requestDraw()
  }, [requestDraw])

  const downloadImage = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    try {
      const link = document.createElement("a")
      link.download = "edited-image.png"
      link.href = canvas.toDataURL("image/png")
      link.click()
    } catch (error) {
      console.error("Failed to download image:", error)
      alert(
        "Unable to download the image. This might happen if you're using external images. Try uploading your own image instead.",
      )
    }
  }

  return (
    <div className="relative">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <div className="flex gap-4">
                <Button
                  asChild
                  variant="default"
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                >
                  <label>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Image
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                </Button>
                <Button
                  onClick={downloadImage}
                  variant="secondary"
                  className="bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="w-full">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={400}
                  className="w-full rounded-lg border border-border shadow-lg"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fixed Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 h-20 bg-background/80 backdrop-blur-lg border-t">
        <div className="max-w-3xl mx-auto h-full flex items-center justify-center gap-2">
          <ControlPopover icon={<Move className="h-5 w-5" />} title="Position">
            <div className="space-y-4">
              <div>
                <h5 className="text-sm font-medium mb-2">Presets</h5>
                <Select
                  onValueChange={(value: any) => {
                    const preset = presetPositions.find((p) => p.name === value)
                    if (preset) applyPresetPosition(preset)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose position" />
                  </SelectTrigger>
                  <SelectContent>
                    {presetPositions.map((preset) => (
                      <SelectItem key={preset.name} value={preset.name}>
                        {preset.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Position X</label>
                  <Slider
                    value={[transform.x]}
                    min={0}
                    max={800}
                    step={1}
                    onValueChange={([x]) => setTransform({ ...transform, x })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Position Y</label>
                  <Slider
                    value={[transform.y]}
                    min={0}
                    max={600}
                    step={1}
                    onValueChange={([y]) => setTransform({ ...transform, y })}
                  />
                </div>
              </div>
            </div>
          </ControlPopover>

          <ControlPopover icon={<Maximize className="h-5 w-5" />} title="Scale">
            <div className="space-y-4">
              <div>
                <h5 className="text-sm font-medium mb-2">Presets</h5>
                <Select
                  onValueChange={(value:any) => {
                    const preset = presetScales.find((p) => p.name === value)
                    if (preset) applyPresetScale(preset)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose scale" />
                  </SelectTrigger>
                  <SelectContent>
                    {presetScales.map((preset) => (
                      <SelectItem key={preset.name} value={preset.name}>
                        {preset.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Scale</label>
                <Slider
                  value={[transform.scale]}
                  min={0.1}
                  max={2}
                  step={0.1}
                  onValueChange={([scale]) => setTransform({ ...transform, scale })}
                />
              </div>
            </div>
          </ControlPopover>

          <ControlPopover icon={<RotateCw className="h-5 w-5" />} title="Rotation">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Angle</label>
                <Slider
                  value={[transform.rotation]}
                  min={0}
                  max={360}
                  step={1}
                  onValueChange={([rotation]) => setTransform({ ...transform, rotation })}
                />
              </div>
              <div className="flex gap-2">
                {[0, 90, 180, 270].map((angle) => (
                  <Button
                    key={angle}
                    variant="outline"
                    size="sm"
                    onClick={() => setTransform({ ...transform, rotation: angle })}
                  >
                    {angle}°
                  </Button>
                ))}
              </div>
            </div>
          </ControlPopover>

          <Separator orientation="vertical" className="h-8" />

          <ControlPopover icon={<Box className="h-5 w-5" />} title="Skew">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Skew X</label>
                <Slider
                  value={[transform.skewX]}
                  min={-1}
                  max={1}
                  step={0.1}
                  onValueChange={([skewX]) => setTransform({ ...transform, skewX })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Skew Y</label>
                <Slider
                  value={[transform.skewY]}
                  min={-1}
                  max={1}
                  step={0.1}
                  onValueChange={([skewY]) => setTransform({ ...transform, skewY })}
                />
              </div>
            </div>
          </ControlPopover>

          <Separator orientation="vertical" className="h-8" />

          <ControlPopover icon={<Layout className="h-5 w-5" />} title="Template">
            <div className="grid grid-cols-2 gap-2">
              {templates.map((template) => (
                <Button
                  key={template.id}
                  variant={selectedTemplate.id === template.id ? "default" : "outline"}
                  className="w-full"
                  onClick={() => setSelectedTemplate(template)}
                >
                  {template.icon}
                  <span className="ml-2">{template.name}</span>
                </Button>
              ))}
            </div>
          </ControlPopover>

          <ControlPopover icon={<Palette className="h-5 w-5" />} title="Background">
            <div className="grid grid-cols-2 gap-2">
              {backgrounds.map((bg, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className={`w-full h-16 p-0 overflow-hidden ${
                    selectedBg === bg ? "ring-2 ring-primary ring-offset-2" : ""
                  }`}
                  onClick={() => setSelectedBg(bg)}
                >
                  <div
                    className="w-full h-full"
                    style={{
                      background: bg,
                      backgroundSize: "cover",
                    }}
                  />
                </Button>
              ))}
            </div>
          </ControlPopover>
        </div>
      </div>
    </div>
  )
}

