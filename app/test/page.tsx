"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import Image from "next/image"

interface FileItem {
  name: string
  uri: string
}

interface ApiResponse {
  content: FileItem[]
}

export default function AutoScrollPage() {

  const [files, setFiles] = useState<FileItem[]>([])
  const [pageNumber, setPageNumber] = useState(0)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const observer = useRef<IntersectionObserver | null>(null)

  const PAGE_SIZE = 8

  const fetchImages = async (page: number) => {

    if (loading || !hasMore) return

    setLoading(true)

    try {

      console.log("Fetching page:", page)

      const res = await fetch(
        `https://resource.supersurvey.live/api/v1/files?pageNumber=${page}&pageSize=${PAGE_SIZE}`,
        { method: "POST" }
      )

      const data: ApiResponse = await res.json()

      if (!data.content || data.content.length === 0) {
        setHasMore(false)
        return
      }

      // Deduplicate: only add files that aren't already in state
      setFiles((prev) => {
        const existingUris = new Set(prev.map(f => f.uri))
        const newFiles = data.content.filter(f => !existingUris.has(f.uri))
        console.log("[v0] Adding", newFiles.length, "new files (filtered from", data.content.length, '). Total:', prev.length + newFiles.length)
        return [...prev, ...newFiles]
      })
      setPageNumber(page + 1)

    } catch (error) {
      console.error("Fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchImages(0)
  }, [])

  const lastImageRef = useCallback(
    (node: HTMLDivElement | null) => {

      if (loading) return

      if (observer.current) observer.current.disconnect()

      observer.current = new IntersectionObserver((entries) => {

        if (entries[0].isIntersecting && hasMore) {

          console.log("Load next page:", pageNumber)

          fetchImages(pageNumber)
        }
      })

      if (node) observer.current.observe(node)

    },
    [loading, hasMore, pageNumber]
  )

  return (
    <main className="p-6 max-w-6xl mx-auto">

      <h1 className="text-2xl font-bold mb-6">
        Auto Scroll Pagination Test
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        {files.map((file, index) => {

          if (index === files.length - 1) {
            return (
              <div
                ref={lastImageRef}
                key={file.uri}
                className="relative h-60"
              >
                <Image
                  src={file.uri}
                  alt={file.name}
                  fill
                  className="object-cover rounded"
                  unoptimized
                />
              </div>
            )
          }

          return (
            <div key={file.uri} className="relative h-60">
              <Image
                src={file.uri}
                alt={file.name}
                fill
                className="object-cover rounded"
                unoptimized
              />
            </div>
          )
        })}

      </div>

      {loading && (
        <div className="text-center mt-6">
          Loading more images...
        </div>
      )}

      {!hasMore && (
        <div className="text-center mt-6">
          No more images
        </div>
      )}

    </main>
  )
}
