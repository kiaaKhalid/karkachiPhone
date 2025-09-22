"use client"

import type React from "react"

import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, X, ImageIcon, Link, AlertCircle, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface DragDropImageUploadProps {
  onImageUpload: (imageUrl: string) => void
  onImageRemove?: () => void
  currentImage?: string
  maxSizeMB?: number
  acceptedFormats?: string[]
  placeholder?: string
  className?: string
}

export default function DragDropImageUpload({
  onImageUpload,
  onImageRemove,
  currentImage,
  maxSizeMB = 10,
  acceptedFormats = ["image/jpeg", "image/png", "image/gif", "image/webp"],
  placeholder = "Glissez-déposez une image ici ou cliquez pour parcourir",
  className,
}: DragDropImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadMethod, setUploadMethod] = useState<"file" | "url">("file")
  const [imageUrl, setImageUrl] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    if (!acceptedFormats.includes(file.type)) {
      return `Format non supporté. Utilisez: ${acceptedFormats.map((f) => f.split("/")[1].toUpperCase()).join(", ")}`
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      return `Fichier trop volumineux. Taille maximale: ${maxSizeMB}MB`
    }

    return null
  }

  const handleFileUpload = useCallback(
    async (file: File) => {
      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        return
      }

      setIsUploading(true)
      setError(null)

      try {
        // Simulate file upload - in real app, upload to your storage service
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          onImageUpload(result)
          setIsUploading(false)
        }
        reader.onerror = () => {
          setError("Erreur lors de la lecture du fichier")
          setIsUploading(false)
        }
        reader.readAsDataURL(file)
      } catch (err) {
        setError("Erreur lors du téléchargement")
        setIsUploading(false)
      }
    },
    [onImageUpload],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
        handleFileUpload(files[0])
      }
    },
    [handleFileUpload],
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        handleFileUpload(files[0])
      }
    },
    [handleFileUpload],
  )

  const handleUrlUpload = useCallback(() => {
    if (!imageUrl.trim()) {
      setError("Veuillez entrer une URL d'image valide")
      return
    }

    setIsUploading(true)
    setError(null)

    // Validate URL format
    try {
      new URL(imageUrl)
    } catch {
      setError("URL invalide")
      setIsUploading(false)
      return
    }

    // Simulate URL validation - in real app, validate the image URL
    setTimeout(() => {
      onImageUpload(imageUrl)
      setImageUrl("")
      setIsUploading(false)
    }, 1000)
  }, [imageUrl, onImageUpload])

  const handleRemoveImage = useCallback(() => {
    if (onImageRemove) {
      onImageRemove()
    }
    setError(null)
  }, [onImageRemove])

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Method Toggle */}
      <div className="flex space-x-2">
        <Button
          type="button"
          variant={uploadMethod === "file" ? "default" : "outline"}
          size="sm"
          onClick={() => setUploadMethod("file")}
        >
          <Upload className="h-4 w-4 mr-2" />
          Fichier
        </Button>
        <Button
          type="button"
          variant={uploadMethod === "url" ? "default" : "outline"}
          size="sm"
          onClick={() => setUploadMethod("url")}
        >
          <Link className="h-4 w-4 mr-2" />
          URL
        </Button>
      </div>

      {/* Current Image Preview */}
      {currentImage && (
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <img
                src={currentImage || "/Placeholder.png"}
                alt="Image actuelle"
                className="w-full h-48 object-cover rounded-lg"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleRemoveImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center mt-2 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Image téléchargée avec succès
            </div>
          </CardContent>
        </Card>
      )}

      {/* File Upload */}
      {uploadMethod === "file" && !currentImage && (
        <Card>
          <CardContent className="p-0">
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
                isDragOver
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500",
                error && "border-red-500 bg-red-50 dark:bg-red-900/20",
                isUploading && "border-green-500 bg-green-50 dark:bg-green-900/20",
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={openFileDialog}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={acceptedFormats.join(",")}
                onChange={handleFileSelect}
                className="hidden"
              />

              <div className="space-y-4">
                <div className="mx-auto w-12 h-12 text-gray-400">
                  {isUploading ? (
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  ) : (
                    <ImageIcon className="w-12 h-12" />
                  )}
                </div>

                <div>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    {isUploading ? "Téléchargement en cours..." : placeholder}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Formats supportés: {acceptedFormats.map((f) => f.split("/")[1].toUpperCase()).join(", ")}
                    (Max {maxSizeMB}MB)
                  </p>
                </div>

                {!isUploading && (
                  <Button type="button" variant="outline">
                    Choisir un fichier
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* URL Upload */}
      {uploadMethod === "url" && !currentImage && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="image-url">URL de l'image</Label>
                <Input
                  id="image-url"
                  type="url"
                  placeholder="https://exemple.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button
                type="button"
                onClick={handleUrlUpload}
                disabled={!imageUrl.trim() || isUploading}
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Téléchargement...
                  </>
                ) : (
                  <>
                    <Link className="h-4 w-4 mr-2" />
                    Utiliser cette URL
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center space-x-2 text-red-600 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
