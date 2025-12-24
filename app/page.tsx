"use client"

import { MediaUploadSection } from "@/components/media-upload-section"
import { MediaGallery } from "@/components/media-gallery"
import { useState } from "react"

export default function Page() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleUploadComplete = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="mb-8 lg:mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-3 text-balance">Media Manager</h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Upload, manage, and organize your media files with ease
          </p>
        </div>

        <div className="space-y-8 lg:space-y-12">
          <MediaUploadSection onUploadComplete={handleUploadComplete} />
          <MediaGallery refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </main>
  )
}
