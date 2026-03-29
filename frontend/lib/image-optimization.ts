// This is a client-side utility for image optimization.
// In a real Next.js application, you would primarily rely on `next/image` for automatic optimization.
// This file provides a mock or supplementary functions if needed for specific use cases (e.g., client-side resizing before upload).

interface ImageOptimizationOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number // 0-1
  format?: "image/jpeg" | "image/png" | "image/webp"
}

/**
 * Simulates client-side image optimization (resizing and quality adjustment).
 * In a real scenario, this would involve Canvas API or a dedicated library.
 * @param file The image file to optimize.
 * @param options Optimization options.
 * @returns A Promise that resolves with the optimized image as a Blob.
 */
export async function optimizeImage(file: File, options: ImageOptimizationOptions = {}): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        let width = img.width
        let height = img.height

        // Calculate new dimensions while maintaining aspect ratio
        if (options.maxWidth && width > options.maxWidth) {
          height = (options.maxWidth / width) * height
          width = options.maxWidth
        }
        if (options.maxHeight && height > options.maxHeight) {
          width = (options.maxHeight / height) * width
          height = options.maxHeight
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext("2d")
        if (!ctx) {
          return reject(new Error("Could not get 2D context from canvas."))
        }
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error("Canvas toBlob failed."))
            }
          },
          options.format || file.type,
          options.quality || 0.8,
        )
      }
      img.onerror = (error) => reject(error)
      img.src = event.target?.result as string
    }
    reader.onerror = (error) => reject(error)
    reader.readAsDataURL(file)
  })
}

/**
 * Converts a Blob to a File object.
 * Useful if you need to treat an optimized Blob as a File for upload.
 * @param blob The Blob to convert.
 * @param fileName The desired file name.
 * @param fileType The desired file type (e.g., 'image/jpeg').
 * @returns A new File object.
 */
export function blobToFile(blob: Blob, fileName: string, fileType: string): File {
  return new File([blob], fileName, { type: fileType, lastModified: Date.now() })
}

/**
 * Generates a placeholder image URL.
 * In a real application, this might point to a service like Lorem Picsum or a local placeholder.
 * @param width Desired width.
 * @param height Desired height.
 * @param query Optional query parameters.
 * @returns A placeholder image URL.
 */
export function getPlaceholderImage(width: number, height: number, query?: string): string {
  return `/Placeholder.png?width=${width}&height=${height}${query ? `&query=${encodeURIComponent(query)}` : ""}`
}

/**
 * Generates an optimized image URL.
 * In a real application, this might interact with an image optimization service
 * or a custom image loader for Next.js Image component.
 * @param src Original image source URL.
 * @param width Desired width.
 * @param quality Desired quality (0-100).
 * @returns An optimized image URL.
 */
export function getOptimizedImageUrl(src: string, width: number, quality = 75): string {
  return `${src}?w=${width}&q=${quality}`
}
