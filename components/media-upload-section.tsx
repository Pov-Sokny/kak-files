// "use client"

// import type React from "react"

// import { Upload, FileUp, Check, Copy } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Card } from "@/components/ui/card"
// import { useState, useCallback } from "react"
// import { useToast } from "@/hooks/use-toast"
// import { Progress } from "@/components/ui/progress"

// const API_BASE_URL = "https://resource.supersurvey.live/api/v1/files"

// interface MediaUploadSectionProps {
//   onUploadComplete?: () => void
// }

// interface UploadResponse {
//   name: string
//   contentType: string
//   extension: string
//   uri: string
//   size: number
// }

// export function MediaUploadSection({ onUploadComplete }: MediaUploadSectionProps) {
//   const [isDragging, setIsDragging] = useState(false)
//   const [isUploading, setIsUploading] = useState(false)
//   const [uploadProgress, setUploadProgress] = useState(0)
//   const [selectedFile, setSelectedFile] = useState<File | null>(null)
//   const [uploadedFileUrl, setUploadedFileUrl] = useState<string>("")
//   const [isCopied, setIsCopied] = useState(false)
//   const [uploadedFile, setUploadedFile] = useState<UploadResponse | null>(null)
//   const { toast } = useToast()

//   const handleDragOver = useCallback((e: React.DragEvent) => {
//     e.preventDefault()
//     setIsDragging(true)
//   }, [])

//   const handleDragLeave = useCallback((e: React.DragEvent) => {
//     e.preventDefault()
//     setIsDragging(false)
//   }, [])

//   const handleDrop = useCallback((e: React.DragEvent) => {
//     e.preventDefault()
//     setIsDragging(false)

//     const files = Array.from(e.dataTransfer.files)
//     if (files.length > 0) {
//       setSelectedFile(files[0])
//     }
//   }, [])

//   const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
//     const files = e.target.files
//     if (files && files.length > 0) {
//       setSelectedFile(files[0])
//     }
//   }, [])

//   const copyToClipboard = async () => {
//     try {
//       await navigator.clipboard.writeText(uploadedFileUrl)
//       setIsCopied(true)
//       toast({
//         title: "Copied!",
//         description: "Image URL copied to clipboard",
//       })
//       setTimeout(() => setIsCopied(false), 2000)
//     } catch (error) {
//       console.error("Failed to copy:", error)
//       toast({
//         title: "Copy failed",
//         description: "Failed to copy URL to clipboard",
//         variant: "destructive",
//       })
//     }
//   }

//   const handleUpload = async () => {
//     if (!selectedFile) {
//       toast({
//         title: "No file selected",
//         description: "Please select a file to upload",
//         variant: "destructive",
//       })
//       return
//     }

//     setIsUploading(true)
//     setUploadProgress(0)
//     setUploadedFileUrl("")
//     setUploadedFile(null)
//     setIsCopied(false)

//     try {
//       const formData = new FormData()
//       formData.append("file", selectedFile)

//       const progressInterval = setInterval(() => {
//         setUploadProgress((prev) => {
//           if (prev >= 90) {
//             clearInterval(progressInterval)
//             return prev
//           }
//           return prev + 10
//         })
//       }, 200)

//       const response = await fetch(API_BASE_URL, {
//         method: "POST",
//         body: formData,
//       })

//       clearInterval(progressInterval)
//       setUploadProgress(100)

//       if (!response.ok) {
//         throw new Error("Upload failed")
//       }

//       const data: UploadResponse = await response.json()
//       setUploadedFileUrl(data.uri)
//       setUploadedFile(data)

//       toast({
//         title: "Upload successful",
//         description: `${data.name} has been uploaded successfully`,
//       })

//       setSelectedFile(null)
//       setTimeout(() => {
//         setUploadProgress(0)
//       }, 1000)
//       onUploadComplete?.()
//     } catch (error) {
//       console.error("Upload error:", error)
//       toast({
//         title: "Upload failed",
//         description: "There was an error uploading your file. Please try again.",
//         variant: "destructive",
//       })
//       setUploadProgress(0)
//       setUploadedFileUrl("")
//       setUploadedFile(null)
//     } finally {
//       setIsUploading(false)
//     }
//   }

//   const isImage = (contentType: string) => {
//     return contentType.startsWith("image/")
//   }

//   return (
//     <Card className="p-6 lg:p-8 border-2">
//       <div className="space-y-6">
//         <div>
//           <h2 className="text-2xl font-semibold text-foreground mb-2">Upload Files</h2>
//           <p className="text-muted-foreground leading-relaxed">Drag and drop your files here, or click to browse</p>
//         </div>

//         <div
//           onDragOver={handleDragOver}
//           onDragLeave={handleDragLeave}
//           onDrop={handleDrop}
//           className={`
//             relative border-2 border-dashed rounded-lg p-8 lg:p-12 
//             transition-all duration-200 cursor-pointer
//             ${
//               isDragging
//                 ? "border-primary bg-primary/5 scale-[1.02]"
//                 : "border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50"
//             }
//           `}
//         >
//           <input
//             type="file"
//             onChange={handleFileSelect}
//             className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
//             disabled={isUploading}
//           />

//           <div className="flex flex-col items-center justify-center gap-4 text-center">
//             <div
//               className={`
//               p-4 rounded-full transition-colors
//               ${isDragging ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"}
//             `}
//             >
//               <Upload className="w-8 h-8" />
//             </div>

//             <div className="space-y-2">
//               <p className="text-lg font-medium text-foreground">
//                 {selectedFile ? selectedFile.name : "Drop your files here"}
//               </p>
//               <p className="text-sm text-muted-foreground">or click to browse from your device</p>
//             </div>

//             {selectedFile && !isUploading && (
//               <div className="flex items-center gap-2 text-sm text-muted-foreground">
//                 <FileUp className="w-4 h-4" />
//                 <span>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
//               </div>
//             )}
//           </div>
//         </div>

//         {isUploading && (
//           <div className="space-y-2">
//             <div className="flex items-center justify-between text-sm">
//               <span className="text-muted-foreground">Uploading...</span>
//               <span className="font-medium text-foreground">{uploadProgress}%</span>
//             </div>
//             <Progress value={uploadProgress} className="h-2" />
//           </div>
//         )}

//         {uploadedFileUrl && !isUploading && (
//           <Card className="p-4 bg-primary/5 border-primary/20">
//             <div className="space-y-3">
//               <div className="flex items-center gap-2 text-sm font-medium text-foreground">
//                 <Check className="w-4 h-4 text-primary" />
//                 <span>File uploaded successfully!</span>
//               </div>
//               {uploadedFile && isImage(uploadedFile.contentType) && (
//                 <div className="rounded-lg overflow-hidden border-2 border-border">
//                   <img
//                     src={uploadedFile.uri || "/placeholder.svg"}
//                     alt={uploadedFile.name}
//                     className="w-full h-auto max-h-96 object-contain bg-muted"
//                   />
//                 </div>
//               )}
//               <div className="flex items-center gap-2">
//                 <div className="flex-1 bg-background rounded-md px-3 py-2 text-sm text-muted-foreground truncate border">
//                   {uploadedFileUrl}
//                 </div>
//                 <Button
//                   onClick={copyToClipboard}
//                   size="sm"
//                   variant={isCopied ? "default" : "outline"}
//                   className="flex-shrink-0"
//                 >
//                   {isCopied ? (
//                     <>
//                       <Check className="w-4 h-4 mr-2" />
//                       Copied
//                     </>
//                   ) : (
//                     <>
//                       <Copy className="w-4 h-4 mr-2" />
//                       Copy URL
//                     </>
//                   )}
//                 </Button>
//               </div>
//             </div>
//           </Card>
//         )}

//         <div className="flex gap-3">
//           <Button
//             onClick={handleUpload}
//             disabled={!selectedFile || isUploading}
//             size="lg"
//             className="flex-1 sm:flex-none"
//           >
//             <Upload className="w-4 h-4 mr-2" />
//             Upload File
//           </Button>

//           {selectedFile && !isUploading && (
//             <Button onClick={() => setSelectedFile(null)} variant="outline" size="lg">
//               Clear
//             </Button>
//           )}
//         </div>
//       </div>
//     </Card>
//   )
// }
