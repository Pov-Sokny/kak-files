// "use client"

// import { Card } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Download, Trash2, Eye, ImageIcon, FileText, Film, Music, File, Copy, Check } from "lucide-react"
// import { useEffect, useState } from "react"
// import { useToast } from "@/hooks/use-toast"
// import { Badge } from "@/components/ui/badge"

// const API_BASE_URL = "https://resource.supersurvey.live/api/v1/files"

// interface FileItem {
//   name: string
//   contentType?: string
//   extension: string
//   uri: string
//   size?: number
// }

// interface MediaGalleryProps {
//   refreshTrigger?: number
// }

// export function MediaGallery({ refreshTrigger }: MediaGalleryProps) {
//   const [files, setFiles] = useState<FileItem[]>([])
//   const [isLoading, setIsLoading] = useState(true)
//   const [copiedFileUri, setCopiedFileUri] = useState<string>("")
//   const { toast } = useToast()

//   const loadFiles = async () => {
//     try {
//       setIsLoading(true)
//       const response = await fetch(API_BASE_URL)

//       if (!response.ok) {
//         throw new Error("Failed to load files")
//       }

//       const data = await response.json()
//       setFiles(data)
//     } catch (error) {
//       console.error("Error loading files:", error)
//       toast({
//         title: "Error loading files",
//         description: "Failed to load your media files. Please try again.",
//         variant: "destructive",
//       })
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   useEffect(() => {
//     loadFiles()
//   }, [refreshTrigger])

//   const handleDelete = async (fileName: string) => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/${fileName}`, {
//         method: "DELETE",
//       })

//       if (!response.ok) {
//         throw new Error("Delete failed")
//       }

//       toast({
//         title: "File deleted",
//         description: `${fileName} has been deleted successfully`,
//       })

//       loadFiles()
//     } catch (error) {
//       console.error("Delete error:", error)
//       toast({
//         title: "Delete failed",
//         description: "Failed to delete the file. Please try again.",
//         variant: "destructive",
//       })
//     }
//   }

//   const handleDownload = (fileName: string) => {
//     window.open(`${API_BASE_URL}/${fileName}/download`, "_blank")
//   }

//   const handleView = (fileName: string) => {
//     window.open(`${API_BASE_URL}/view/${fileName}`, "_blank")
//   }

//   const handleCopyUrl = async (uri: string) => {
//     try {
//       await navigator.clipboard.writeText(uri)
//       setCopiedFileUri(uri)
//       toast({
//         title: "Copied!",
//         description: "File URL copied to clipboard",
//       })
//       setTimeout(() => setCopiedFileUri(""), 2000)
//     } catch (error) {
//       console.error("Failed to copy:", error)
//       toast({
//         title: "Copy failed",
//         description: "Failed to copy URL to clipboard",
//         variant: "destructive",
//       })
//     }
//   }

//   const getFileIcon = (extension: string) => {
//     const ext = extension.toLowerCase()

//     if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) {
//       return <ImageIcon className="w-5 h-5" />
//     }
//     if (["mp4", "mov", "avi", "mkv"].includes(ext)) {
//       return <Film className="w-5 h-5" />
//     }
//     if (["mp3", "wav", "ogg", "flac"].includes(ext)) {
//       return <Music className="w-5 h-5" />
//     }
//     if (["pdf", "doc", "docx", "txt"].includes(ext)) {
//       return <FileText className="w-5 h-5" />
//     }

//     return <File className="w-5 h-5" />
//   }

//   const formatFileSize = (bytes?: number) => {
//     if (!bytes) return "Unknown"

//     if (bytes < 1024) return `${bytes} B`
//     if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
//     return `${(bytes / 1024 / 1024).toFixed(1)} MB`
//   }

//   const isImage = (extension: string) => {
//     const ext = extension.toLowerCase()
//     return ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(ext)
//   }

//   if (isLoading) {
//     return (
//       <Card className="p-6 lg:p-8">
//         <div className="flex items-center justify-center py-12">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
//         </div>
//       </Card>
//     )
//   }

//   if (files.length === 0) {
//     return (
//       <Card className="p-6 lg:p-8 border-2">
//         <div className="text-center py-12">
//           <div className="inline-flex p-4 rounded-full bg-muted mb-4">
//             <ImageIcon className="w-8 h-8 text-muted-foreground" />
//           </div>
//           <h3 className="text-lg font-semibold text-foreground mb-2">No files yet</h3>
//           <p className="text-muted-foreground">Upload your first file to get started</p>
//         </div>
//       </Card>
//     )
//   }

//   return (
//     <Card className="p-6 lg:p-8 border-2">
//       <div className="mb-6">
//         <h2 className="text-2xl font-semibold text-foreground mb-2">Your Media Files</h2>
//         <p className="text-muted-foreground leading-relaxed">
//           {files.length} {files.length === 1 ? "file" : "files"} in your library
//         </p>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//         {files.map((file) => (
//           <Card key={file.name} className="overflow-hidden group hover:shadow-lg transition-shadow">
//             {isImage(file.extension) && (
//               <div className="aspect-video bg-muted relative overflow-hidden">
//                 <img
//                   src={file.uri || "/placeholder.svg"}
//                   alt={file.name}
//                   className="w-full h-full object-cover"
//                   loading="lazy"
//                 />
//               </div>
//             )}

//             <div className="p-4 space-y-4">
//               <div className="flex items-start justify-between gap-2">
//                 <div className="flex items-start gap-3 flex-1 min-w-0">
//                   <div className="p-2 rounded-lg bg-accent text-accent-foreground flex-shrink-0">
//                     {getFileIcon(file.extension)}
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <h3 className="font-medium text-foreground truncate text-sm">{file.name}</h3>
//                     <div className="flex items-center gap-2 mt-1">
//                       <Badge variant="secondary" className="text-xs">
//                         {file.extension.toUpperCase()}
//                       </Badge>
//                       <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="flex flex-col gap-2">
//                 <div className="flex items-center gap-2">
//                   <Button size="sm" variant="outline" onClick={() => handleView(file.name)} className="flex-1">
//                     <Eye className="w-3.5 h-3.5 mr-1.5" />
//                     View
//                   </Button>
//                   <Button size="sm" variant="outline" onClick={() => handleDownload(file.name)} className="flex-1">
//                     <Download className="w-3.5 h-3.5 mr-1.5" />
//                     Download
//                   </Button>
//                   <Button
//                     size="sm"
//                     variant="outline"
//                     onClick={() => handleDelete(file.name)}
//                     className="hover:bg-destructive hover:text-destructive-foreground"
//                   >
//                     <Trash2 className="w-3.5 h-3.5" />
//                   </Button>
//                 </div>
//                 <Button
//                   size="sm"
//                   variant={copiedFileUri === file.uri ? "default" : "outline"}
//                   onClick={() => handleCopyUrl(file.uri)}
//                   className="w-full"
//                 >
//                   {copiedFileUri === file.uri ? (
//                     <>
//                       <Check className="w-3.5 h-3.5 mr-1.5" />
//                       Copied URL
//                     </>
//                   ) : (
//                     <>
//                       <Copy className="w-3.5 h-3.5 mr-1.5" />
//                       Copy URL
//                     </>
//                   )}
//                 </Button>
//               </div>
//             </div>
//           </Card>
//         ))}
//       </div>
//     </Card>
//   )
// }
