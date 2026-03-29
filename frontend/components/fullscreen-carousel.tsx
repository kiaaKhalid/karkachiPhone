"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"

interface FullscreenCarouselProps {
  children: React.ReactNode[]
}

export default function FullscreenCarousel({ children }: FullscreenCarouselProps) {
  return (
    <div className="flex overflow-x-auto snap-x snap-mandatory gap-2 pb-6 -mx-4 px-6 md:hidden scrollbar-none items-center">
      {children.map((child, index) => (
        <CarouselItem key={index}>{child}</CarouselItem>
      ))}
    </div>
  )
}

function CarouselItem({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.9)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Compute scale multiplier based on full center intersection ratio
          // entry.intersectionRatio is between 0 and 1
          const ratio = entry.intersectionRatio
          setScale(0.9 + ratio * 0.1) // 0.9 min, 1.0 max
        })
      },
      {
        threshold: Array.from({ length: 21 }, (_, i) => i / 20),
        rootMargin: "0px -5% 0px -5%", // marginally bounded viewport centers
      }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className="snap-center w-[85vw] flex-shrink-0 transition-transform duration-100 ease-out origin-center"
      style={{ transform: `scale(${scale})` }}
    >
      {children}
    </div>
  )
}
