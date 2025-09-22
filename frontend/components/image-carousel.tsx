"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ImageCarouselProps {
  images: string[]
}

export default function ImageCarousel({ images }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0
    const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1
    setCurrentIndex(newIndex)
  }

  const goToNext = () => {
    const isLastSlide = currentIndex === images.length - 1
    const newIndex = isLastSlide ? 0 : currentIndex + 1
    setCurrentIndex(newIndex)
  }

  return (
    <div className="relative w-full h-[400px] md:h-[500px] rounded-lg overflow-hidden shadow-lg bg-gray-100 dark:bg-gray-900">
      <Image
        src={images[currentIndex] || "/Placeholder.png"}
        alt={`Product image ${currentIndex + 1}`}
        layout="fill"
        objectFit="contain"
        className="transition-opacity duration-500 ease-in-out"
      />

      {/* Navigation Buttons */}
      {images.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-700"
            onClick={goToPrevious}
          >
            <ChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-700"
            onClick={goToNext}
          >
            <ChevronRight className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </Button>
        </>
      )}

      {/* Dots Indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "w-3 h-3 rounded-full bg-gray-400 transition-colors duration-300",
                index === currentIndex ? "bg-gray-800 dark:bg-gray-200" : "hover:bg-gray-600 dark:hover:bg-gray-400",
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
