export function getImageUrl(image: File): string {
    try {
      return URL.createObjectURL(image)
    } catch (error) {
      console.error("Error creating object URL:", error)
      return "/placeholder.svg"
    }
  }
  
  