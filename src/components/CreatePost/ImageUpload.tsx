import React, { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { ImagePlus } from 'lucide-react'

interface ImageUploadProps {
  onChange: (files: FileList | null) => void
}

export function ImageUpload({ onChange }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => onChange(e.target.files)}
        multiple
        accept="image/*"
        className="hidden"
      />
      <Button type="button" variant="outline" onClick={handleClick}>
        <ImagePlus className="mr-2 h-4 w-4" />
        Add Images
      </Button>
    </div>
  )
}

