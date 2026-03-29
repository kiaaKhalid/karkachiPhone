"use client"

import { useState, useRef, useEffect, MouseEvent, TouchEvent } from "react"
import { ChevronsRight } from "lucide-react"

interface SlideToActionProps {
  onSuccess: () => void
  label: string
  className?: string
  width?: string
}

export function SlideToAction({ onSuccess, label, className = "", width = "w-full" }: SlideToActionProps) {
  const [isSliding, setIsSliding] = useState(false)
  const [offsetX, setOffsetX] = useState(0)
  const [isSuccess, setIsSuccess] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const thumbRef = useRef<HTMLDivElement>(null)
  const startXRef = useRef(0)

  const handleStart = (clientX: number) => {
    if (isSuccess) return
    setIsSliding(true)
    startXRef.current = clientX - offsetX
  }

  const handleMove = (clientX: number) => {
    if (!isSliding || !containerRef.current || !thumbRef.current) return

    const containerWidth = containerRef.current.offsetWidth
    const thumbWidth = thumbRef.current.offsetWidth
    const maxOffset = containerWidth - thumbWidth - 8 // padding

    let newOffset = clientX - startXRef.current
    newOffset = Math.max(0, Math.min(newOffset, maxOffset))
    setOffsetX(newOffset)

    // Trigger success slightly before end for better feel
    if (newOffset >= maxOffset * 0.95 && !isSuccess) {
      setIsSuccess(true)
      setIsSliding(false)
      setOffsetX(maxOffset)
      onSuccess()
    }
  }

  const handleEnd = () => {
    if (isSuccess) return
    setIsSliding(false)
    if (offsetX < (containerRef.current ? (containerRef.current.offsetWidth - thumbRef.current!.offsetWidth) * 0.9 : 0)) {
      setOffsetX(0) // snap back
    }
  }

  // --- Touch Event Handlers ---
  const onTouchStart = (e: TouchEvent) => handleStart(e.touches[0].clientX)
  const onTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX)
  const onTouchEnd = () => handleEnd()

  // --- Mouse Event Handlers ---
  const onMouseDown = (e: MouseEvent) => handleStart(e.clientX)
  const onMouseMove = (e: MouseEvent) => handleMove(e.clientX)
  const onMouseUp = () => handleEnd()

  useEffect(() => {
    const handleGlobalMouseUp = () => handleEnd()
    const handleGlobalMouseMove = (e: globalThis.MouseEvent) => {
      if (isSliding) handleMove(e.clientX)
    }

    if (isSliding) {
      window.addEventListener("mouseup", handleGlobalMouseUp)
      window.addEventListener("mousemove", handleGlobalMouseMove)
    }

    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp)
      window.removeEventListener("mousemove", handleGlobalMouseMove)
    }
  }, [isSliding, offsetX])

  return (
    <div
      ref={containerRef}
      className={`relative h-14 bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 shadow-md shadow-orange-500/20 rounded-full flex items-center p-1 select-none overflow-hidden ${width} ${className}`}
      style={{ cursor: isSliding ? "grabbing" : "grab" }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
    >
      {/* Background Text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-white font-bold text-sm tracking-wide animate-pulse">
          {isSuccess ? "Validation..." : label}
        </span>
      </div>

      {/* Sliding Thumb Knob */}
      <div
        ref={thumbRef}
        className="h-12 w-12 bg-white rounded-full flex items-center justify-center shadow-md z-10 transition-transform duration-100 ease-out"
        style={{
          transform: `translateX(${offsetX}px)`,
          transition: isSliding ? "none" : "transform 0.2s ease-out",
        }}
      >
        <ChevronsRight className="w-5 h-5 text-orange-500" />
      </div>
    </div>
  )
}
