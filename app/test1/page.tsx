"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

interface FileItem {
  name: string
  uri: string
}

export default function TestAllImages() {

  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAllImages = async () => {

    try {

      const res = await fetch("/api/files", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          page: 0,
          size: 1000
        }),
      })

      const data = await res.json()

      setFiles(data.content ?? [])

    } catch (err) {
      console.error("Error loading images:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllImages()
  }, [])

  return (
    <main className="p-6">

      <h1 className="text-xl font-bold mb-4">
        Load All Images Test
      </h1>

      {loading && <p>Loading...</p>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        {files.map((file, i) => (
          <div key={file.name + i} className="relative h-60">

            <Image
              src={file.uri}
              alt={file.name}
              fill
              className="object-cover rounded"
              unoptimized
            />

          </div>
        ))}

      </div>

    </main>
  )
}