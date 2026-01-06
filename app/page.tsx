"use client"

import type React from "react"
import Image from "next/image"
import { useState, useEffect, useRef } from "react"
import { Upload, Copy, Check, ImageIcon, FilmIcon, Loader2, Download, Trash2, FileIcon, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const API_URL = "/api/files"

interface FileItem {
  name: string
  contentType: string
  extension: string
  uri: string
  size: number
  type?: "LOGIN" | "REGISTER" | "OTP" | "PROFILE" | "SURVEY" | "QR" | "FRGPWD" | "DEFAULT" | "BGLOGIN" | "BGREGISTER" | "BGOTP" | "BGPROFILE" | "BGSURVEY" | "BGQR" | "BGFRGPWD" | "BGDEFAULT" 
  blurDataURL?: string
}

const FILE_TYPES = ["LOGIN", "REGISTER", "OTP", "PROFILE", "SURVEY", "QR", "FRGPWD", "DEFAULT", "BGLOGIN", "BGREGISTER", "BGOTP", "BGPROFILE", "BGSURVEY", "BGQR", "BGFRGPWD", "BGDEFAULT"] as const
type FileType = (typeof FILE_TYPES)[number]

// Utility function to generate blur data URLs from image URIs
const generateBlurDataURL = (imageUrl: string): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas")
    canvas.width = 10
    canvas.height = 10
    const ctx = canvas.getContext("2d")

    const img = new window.Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      ctx?.drawImage(img, 0, 0, 10, 10)
      resolve(canvas.toDataURL())
    }
    img.onerror = () => {
      resolve(
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'%3E%3Crect fill='%23e5e5e5' width='400' height='400'/%3E%3C/svg%3E",
      )
    }
    img.src = imageUrl
  })
}

const SkeletonLoader = () => (
  <div className="w-full h-full space-y-3 p-4">
    <div className="skeleton h-4 w-3/4 rounded-full" />
    <div className="skeleton h-4 w-full rounded-full" />
    <div className="skeleton h-4 w-5/6 rounded-full" />
    <div className="skeleton h-4 w-4/5 rounded-full" />
    <div className="skeleton h-4 w-full rounded-full" />
    <div className="skeleton h-4 w-3/4 rounded-full" />
  </div>
)

export default function FileManager() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [uploading, setUploading] = useState(false)
  const [shouldCompress, setShouldCompress] = useState(false)
  const [compressionLevel, setCompressionLevel] = useState("HIGH")
  const [preview, setPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadUrl, setUploadUrl] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [inputKey, setInputKey] = useState(0)
  const [selectedType, setSelectedType] = useState<FileType>("DEFAULT")
  const [previewLoading, setPreviewLoading] = useState(false)
  const [galleryLoading, setGalleryLoading] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchFiles()
  }, [])

  const fetchFiles = async () => {
    try {
      setGalleryLoading(true)
      const res = await fetch(API_URL, { cache: "no-store" })
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)

      const data = await res.json()
      const fileList = Array.isArray(data) ? data : data.files || data.data || []

      const filesWithBlur = await Promise.all(
        fileList.map(async (file: FileItem) => {
          if (!file.contentType.startsWith("video/")) {
            const blurDataURL = await generateBlurDataURL(file.uri)
            return { ...file, blurDataURL }
          }
          return file
        }),
      )

      setFiles(filesWithBlur)
    } catch (error: any) {
      console.error("[v0] Error fetching files:", error.message)
      toast({ title: "Fetch Failed", variant: "destructive", description: "Could not load files." })
    } finally {
      setGalleryLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    setPreviewLoading(true)
    setPreview(URL.createObjectURL(file))
    setUploadUrl(null)
    if (file.type.startsWith("image/")) {
      setShouldCompress(true)
    }
  }

  const handleClearSelection = () => {
    setPreview(null)
    setUploadUrl(null)
    setSelectedFile(null)
    setShouldCompress(false)
    setCompressionLevel("HIGH")
    setSelectedType("DEFAULT")
    setInputKey((prev) => prev + 1)
  }

  const handleConfirmUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    const formData = new FormData()
    formData.append("file", selectedFile)

    try {
      const uploadUrl = new URL(API_URL, window.location.origin)
      uploadUrl.searchParams.append("type", selectedType)

      if (shouldCompress && selectedFile.type.startsWith("image/")) {
        uploadUrl.searchParams.append("compress", "true")
        uploadUrl.searchParams.append("level", compressionLevel)
      }

      const res = await fetch(uploadUrl.toString(), {
        method: "POST",
        body: formData,
      })

      if (!res.ok) throw new Error("Upload failed")

      const data = await res.json()
      const fileUrl = data.uri || data.url || (data.data && data.data.uri)

      if (fileUrl) {
        setUploadUrl(fileUrl)
        fetchFiles()
        toast({
          title: "Success",
          description: shouldCompress ? "Image compressed and uploaded." : "File uploaded successfully.",
        })
      }
    } catch (error) {
      toast({ title: "Upload Failed", variant: "destructive", description: "Check your connection and try again." })
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

  const handleFileDelete = async (fileName: string) => {
    if (!confirm(`Are you sure you want to delete ${fileName}?`)) return

    try {
      const res = await fetch(`${API_URL}/${fileName}`, {
        method: "DELETE",
      })

      if (res.ok) {
        toast({ title: "Deleted", description: "File has been removed successfully." })
        fetchFiles()
      } else {
        throw new Error("Failed to delete")
      }
    } catch (error) {
      toast({ title: "Delete Failed", variant: "destructive", description: "Could not remove the file." })
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
    <main className="min-h-screen bg-background p-4 md:p-8 lg:p-12 font-sans selection:bg-primary/20">
      <div className="max-w-7xl mx-auto space-y-12">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-8">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-2 rounded-lg">
                <FileIcon className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Cloud Manager</h1>
            </div>
            <p className="text-muted-foreground">High-performance media storage and management.</p>
          </div>
          <Badge variant="outline" className="w-fit border-primary/20 text-primary bg-primary/5 px-3 py-1">
            Active Session
          </Badge>
        </header>

        {/* Section 1: Upload & Preview */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          <section className="lg:col-span-5 space-y-6">
            <Card className="border-2 border-dashed border-muted-foreground/20 bg-muted/5 transition-all hover:border-primary/50 group relative">
              <CardContent
                className="flex flex-col items-center justify-center min-h-[300px] cursor-pointer p-8"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="mb-4 rounded-full bg-primary/10 p-4 transition-transform group-hover:scale-110">
                  <Plus className="h-8 w-8 text-primary" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold">{selectedFile ? selectedFile.name : "Select Media"}</h3>
                  <p className="text-sm text-muted-foreground max-w-[240px] mx-auto">
                    Drag assets here or click to browse. Supports images and videos up to 50MB.
                  </p>
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
          </section>

          <section className="lg:col-span-7">
            <Card className="min-h-[300px] flex flex-col overflow-hidden border-none shadow-xl ring-1 ring-muted-foreground/10 bg-card/50 backdrop-blur-sm">
              <CardContent className="flex-1 p-0 flex flex-col">
                {preview ? (
                  <div className="flex flex-col h-full">
                    <div className="relative flex-1 bg-zinc-950 flex items-center justify-center overflow-hidden min-h-[320px]">
                      {selectedFile?.type.startsWith("video/") ? (
                        <video src={preview} className="max-h-full w-full object-contain" controls />
                      ) : (
                        <>
                          {previewLoading && <SkeletonLoader />}
                          {!previewLoading && (
                            <Image
                              src={preview || "/placeholder.svg"}
                              alt="Preview"
                              fill
                              priority
                              placeholder="blur"
                              blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10'%3E%3Crect fill='%23e5e5e5' width='10' height='10'/%3E%3C/svg%3E"
                              style={{ objectFit: "contain" }}
                              className="animate-in fade-in zoom-in-95 duration-700"
                              onLoadingComplete={() => setPreviewLoading(false)}
                            />
                          )}
                        </>
                      )}

                      {/* Floating reset button for a cleaner look */}
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleClearSelection}
                        className="absolute top-4 right-4 h-8 px-3 text-xs bg-black/40 hover:bg-black/60 text-white border-white/10 backdrop-blur-md rounded-full"
                      >
                        Change File
                      </Button>
                    </div>

                    <div className="p-6 space-y-4">
                      {uploadUrl ? (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                          <div className="flex items-center justify-between">
                            <Badge className="bg-[#00a368] hover:bg-[#00a368]">Ready to share</Badge>
                            <Button variant="ghost" size="sm" onClick={handleClearSelection} className="text-xs h-7">
                              New Upload
                            </Button>
                          </div>
                          <div className="flex gap-2">
                            <Input
                              value={uploadUrl}
                              readOnly
                              className="font-mono text-xs bg-muted border-none ring-offset-background focus-visible:ring-0"
                            />
                            <Button
                              size="icon"
                              className="bg-[#00a368] hover:bg-[#00a368]/90"
                              onClick={() => copyToClipboard(uploadUrl, "upload")}
                            >
                              {copiedId === "upload" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col space-y-4">
                          <div className="flex flex-col sm:flex-row items-center gap-4 bg-muted/30 p-4 rounded-lg border border-primary/10">
                            <div className="flex items-center space-x-3 whitespace-nowrap">
                              <Checkbox
                                id="compress"
                                checked={shouldCompress}
                                onCheckedChange={(checked) => setShouldCompress(checked === true)}
                              />
                              <Label htmlFor="compress" className="text-sm font-semibold cursor-pointer select-none">
                                Compress Image
                              </Label>
                            </div>

                            <div className="flex items-center gap-2 w-full">
                              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                Level:
                              </Label>
                              <Select
                                value={compressionLevel}
                                onValueChange={setCompressionLevel}
                                disabled={!shouldCompress}
                              >
                                <SelectTrigger className="h-9 bg-background">
                                  <SelectValue placeholder="Select level" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="LOW">LOW</SelectItem>
                                  <SelectItem value="MEDIUM">MEDIUM</SelectItem>
                                  <SelectItem value="HIGH">HIGH</SelectItem>
                                  <SelectItem value="EXTREME">EXTREME</SelectItem>
                                  <SelectItem value="ULTRA">ULTRA</SelectItem>
                                  <SelectItem value="NONE">NONE</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                              File Category:
                            </Label>
                            <Select value={selectedType} onValueChange={(value) => setSelectedType(value as FileType)}>
                              <SelectTrigger className="h-10 bg-background border-primary/20">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                {FILE_TYPES.map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {type}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex gap-3 w-full sm:w-auto self-end">
                            <Button
                              variant="outline"
                              onClick={handleClearSelection}
                              disabled={uploading}
                              className="flex-1 sm:flex-none bg-transparent"
                            >
                              Clear
                            </Button>
                            <Button
                              onClick={handleConfirmUpload}
                              disabled={uploading}
                              className="bg-[#00a368] hover:bg-[#00a368]/90 text-white min-w-[120px] flex-1 sm:flex-none"
                            >
                              {uploading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Upload className="h-4 w-4 mr-2" />
                              )}
                              Upload
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-12 space-y-4">
                    <div className="p-4 rounded-full bg-muted/50 border">
                      <ImageIcon className="h-8 w-8 opacity-20" />
                    </div>
                    <p className="text-sm font-medium opacity-50">Nothing to preview yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Section 2: Gallery List */}
        <section className="space-y-8">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-semibold">Media Gallery</h2>
              <Badge variant="secondary" className="rounded-full">
                {files.length}
              </Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={fetchFiles} className="text-muted-foreground">
              Refresh
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {galleryLoading ? (
              [...Array(8)].map((_, i) => (
                <Card key={i} className="overflow-hidden border-none shadow-sm ring-1 ring-muted-foreground/10">
                  <div className="aspect-video bg-muted/50">
                    <SkeletonLoader />
                  </div>
                </Card>
              ))
            ) : (
              <TooltipProvider>
                {files.map((file) => (
                  <Card
                    key={file.name}
                    className="group overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 ring-1 ring-muted-foreground/10 hover:ring-primary/30"
                  >
                    <div className="aspect-video relative bg-zinc-900 flex items-center justify-center group-hover:scale-[1.02] transition-transform duration-500">
                      {!isVideo(file.contentType) ? (
                        <>
                          <Image
                            src={file.uri || "/placeholder.svg"}
                            alt={file.name}
                            fill
                            placeholder={file.blurDataURL ? "blur" : "empty"}
                            blurDataURL={
                              file.blurDataURL ||
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10'%3E%3Crect fill='%23e5e5e5' width='10' height='10'/%3E%3C/svg%3E"
                            }
                            style={{ objectFit: "cover" }}
                            className="opacity-90 group-hover:opacity-100 transition-opacity duration-300 animate-in fade-in duration-500"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          />
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-3">
                          <div className="p-3 bg-white/10 rounded-full backdrop-blur-sm">
                            <FilmIcon className="h-8 w-8 text-white" />
                          </div>
                          <span className="text-[10px] uppercase font-black tracking-widest text-white/60">
                            MP4 Media
                          </span>
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4">
                        <div className="flex items-center justify-center gap-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10"
                                onClick={() => copyToClipboard(file.uri, file.name)}
                              >
                                {copiedId === file.name ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Copy URL</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10"
                                onClick={() => handleDownload(file.uri, file.name)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Download</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                variant="destructive"
                                className="bg-red-500/20 hover:bg-red-500/40 backdrop-blur-md border border-red-500/20"
                                onClick={() => handleFileDelete(file.name)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete</TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 space-y-1 bg-card">
                      <h4 className="text-sm font-semibold truncate flex-1">{file.name}</h4>
                      {file.type && (
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-primary/30 text-primary">
                          {file.type}
                        </Badge>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">
                          {file.extension || "media"}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {(file.size / (1024 * 1024)).toFixed(1)}MB
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </TooltipProvider>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
