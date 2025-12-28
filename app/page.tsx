"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Upload, Copy, Check, ImageIcon, FilmIcon, X, Loader2, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

const API_URL = "https://resource.supersurvey.live/api/v1/files"

interface FileItem {
  name: string
  contentType: string
  extension: string
  uri: string
  size: number
}

export default function FileManager() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadUrl, setUploadUrl] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [inputKey, setInputKey] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchFiles()
  }, [])

  const fetchFiles = async () => {
    try {
      const res = await fetch(API_URL)
      const data = await res.json()
      setFiles(Array.isArray(data) ? data : data.files || [])
    } catch (error) {
      console.error("[v0] Error fetching files:", error)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    setPreview(URL.createObjectURL(file))
    setUploadUrl(null) // Reset URL until upload is confirmed
  }

  const handleClearSelection = () => {
    setPreview(null)
    setUploadUrl(null)
    setSelectedFile(null)
    setInputKey((prev) => prev + 1)
  }

  const handleConfirmUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    const formData = new FormData()
    formData.append("file", selectedFile)

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        body: formData,
      })
      const data = await res.json()

      const fileUrl = data.uri || data.url || (data.data && data.data.uri)
      if (fileUrl) {
        setUploadUrl(fileUrl)
        fetchFiles()
        toast({ title: "Upload Successful", description: "File has been uploaded and added to the gallery." })
      }
    } catch (error) {
      toast({ title: "Upload Failed", variant: "destructive", description: "Something went wrong during upload." })
    } finally {
      setUploading(false)
    }
  }

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = downloadUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      toast({ title: "Download Failed", variant: "destructive", description: "Could not download the file." })
    }
  }

  const copyToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
    toast({ title: "Link Copied", description: "URL has been copied to your clipboard." })
  }

  const isVideo = (contentType: string) => contentType.startsWith("video/")

  return (
    <main className="min-h-screen bg-background p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto space-y-12">
        <header className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Cloud Manager</h1>
          <p className="text-muted-foreground">Upload and manage your media assets seamlessly.</p>
        </header>

        {/* Section 1: Upload & Preview */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-primary">
            <Upload className="w-5 h-5" />
            <h2 className="text-xl font-semibold">Upload Media</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card
              className={cn(
                "border-dashed border-2 bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer",
                selectedFile && "border-primary bg-primary/5",
              )}
              onClick={() => fileInputRef.current?.click()}
            >
              <CardContent className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="p-4 bg-primary/10 rounded-full">
                  {uploading ? (
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  ) : (
                    <Upload className="w-8 h-8 text-primary" />
                  )}
                </div>
                <div className="text-center">
                  <p className="font-medium">{selectedFile ? selectedFile.name : "Click to upload or drag and drop"}</p>
                  <p className="text-sm text-muted-foreground">Images or Videos (max 50MB)</p>
                </div>
                <input
                  key={inputKey}
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="image/*,video/*"
                />
              </CardContent>
            </Card>

            <Card className={cn("overflow-hidden transition-all duration-300", !preview && "opacity-50 grayscale")}>
              <CardContent className="p-0 flex flex-col h-64">
                {preview ? (
                  <>
                    <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
                      <Button
                        size="icon"
                        variant="destructive"
                        className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={handleClearSelection}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      {selectedFile?.type.startsWith("video/") ||
                      files.find((f) => f.uri === preview)?.contentType.startsWith("video/") ? (
                        <video src={preview} className="w-full h-full object-contain" controls />
                      ) : (
                        <img
                          src={preview || "/placeholder.svg"}
                          alt="Preview"
                          className="w-full h-full object-contain"
                        />
                      )}
                    </div>
                    <div className="p-4 bg-card flex flex-col gap-3 border-t">
                      {uploadUrl ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] font-bold uppercase text-[#00a368]">Upload Successful</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 text-xs text-muted-foreground hover:text-foreground"
                              onClick={handleClearSelection}
                            >
                              Clear Preview
                            </Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input value={uploadUrl} readOnly className="font-mono text-xs bg-muted h-9" />
                            <Button
                              size="icon"
                              className="bg-[#00a368] hover:bg-[#00a368]/90 shrink-0"
                              onClick={() => copyToClipboard(uploadUrl, "upload")}
                            >
                              {copiedId === "upload" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3">
                          <Button
                            variant="outline"
                            className="w-full border-muted-foreground/20 text-muted-foreground hover:bg-muted bg-transparent"
                            onClick={handleClearSelection}
                            disabled={uploading}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Clear
                          </Button>
                          <Button
                            className="w-full bg-[#00a368] hover:bg-[#00a368]/90 text-white font-semibold"
                            onClick={handleConfirmUpload}
                            disabled={uploading}
                          >
                            {uploading ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Upload className="w-4 h-4 mr-2" />
                            )}
                            Upload
                          </Button>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm italic">
                    Select a file to see preview
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Section 2: Gallery List */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-primary">
            <ImageIcon className="w-5 h-5" />
            <h2 className="text-xl font-semibold">Media Gallery</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {files.length > 0
              ? files.map((file) => (
                  <Card
                    key={file.name}
                    className="group overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow bg-card"
                  >
                    <div className="aspect-square relative bg-muted flex items-center justify-center">
                      {!isVideo(file.contentType) ? (
                        <img
                          src={file.uri || "/placeholder.svg"}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <FilmIcon className="w-10 h-10 text-muted-foreground" />
                          <span className="text-[10px] uppercase font-bold text-muted-foreground">Video</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 px-4">
                        <Button
                          size="sm"
                          className="w-full bg-primary hover:bg-primary/90"
                          onClick={() => copyToClipboard(file.uri, file.name)}
                        >
                          {copiedId === file.name ? (
                            <Check className="w-4 h-4 mr-2" />
                          ) : (
                            <Copy className="w-4 h-4 mr-2" />
                          )}
                          {copiedId === file.name ? "Copied" : "Copy Link"}
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="w-full"
                          onClick={() => handleDownload(file.uri, file.name)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-medium truncate">{file.name}</p>
                      <p className="text-[10px] text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  </Card>
                ))
              : Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="aspect-square rounded-xl bg-muted animate-pulse" />
                ))}
          </div>
        </section>
      </div>
    </main>
  )
}
