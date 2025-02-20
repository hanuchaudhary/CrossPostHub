import React from 'react'
import { Button } from '../ui/button'
import { Upload } from 'lucide-react'

export default function UploadImage({ handleImageUpload }: { handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
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
  )
}
