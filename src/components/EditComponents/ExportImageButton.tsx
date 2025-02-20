import React from 'react'
import { Button } from '../ui/button'
import { Download } from 'lucide-react'

export default function ExportImageButton({ downloadImage }: { downloadImage: () => void }) {
    return (
        <Button
            onClick={downloadImage}
            variant="secondary"
            className="bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70"
        >
            <Download className="mr-2 h-4 w-4" />
            export
        </Button>
    )
}
