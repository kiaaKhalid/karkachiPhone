// import Image from "next/image"
// import { getOptimizedImageUrl, getPlaceholderImage } from "@/lib/image-optimization"

// interface OptimizedImageProps {
//   src: string
//   alt: string
//   width: number
//   height: number
//   className?: string
//   objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down"
//   priority?: boolean
//   quality?: number
//   placeholderQuery?: string // Optional query for placeholder.svg
// }

// export default function OptimizedImage({
//   src,
//   alt,
//   width,
//   height,
//   className,
//   objectFit = "cover",
//   priority = false,
//   quality = 75,
//   placeholderQuery,
// }: OptimizedImageProps) {
//   const imageUrl = getOptimizedImageUrl(src, width, quality)
//   const placeholder = getPlaceholderImage(width, height, placeholderQuery || alt)

//   return (
//     <Image
//       src={imageUrl || "/Placeholder.png"}
//       alt={alt}
//       width={width}
//       height={height}
//       className={className}
//       objectFit={objectFit}
//       priority={priority}
//       quality={quality}
//       placeholder="blur" // Use blur for a smooth loading effect
//       blurDataURL={placeholder} // Provide a base64 encoded blur image or a placeholder SVG
//     />
//   )
// }
