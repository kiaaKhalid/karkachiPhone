"use client"

import Link from "next/link"
import Image from "next/image"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export default function Logo({ 
  className = "", 
  lightSrc = "/logo.png", 
  darkSrc = "/logo.png",
  useFilter = true 
}: { 
  className?: string;
  lightSrc?: string;
  darkSrc?: string;
  useFilter?: boolean;
}) {
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className={`flex items-center gap-2.5 shrink-0 ${className}`}>
        <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
          <span className="text-white font-bold text-lg">K</span>
        </div>
        <div className="hidden sm:block">
          <span className="font-bold text-base md:text-lg text-foreground leading-none">
            KARKACHI
          </span>
          <span className="block text-[8px] md:text-[10px] text-muted-foreground tracking-[0.2em] uppercase -mt-0.5">
            Phone
          </span>
        </div>
      </div>
    )
  }

  const isDark = resolvedTheme === "dark"
  const logoSrc = isDark ? darkSrc : lightSrc

  return (
    <Link href="/" className={`flex items-center gap-2.5 shrink-0 animate-fade-in ${className}`}>
      {/* Dynamic Logo implementation */}
      <div className="relative group">
        <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center transition-transform group-hover:scale-105 duration-300 overflow-hidden">
          {/* Main Logo Image */}
          <div className="relative w-full h-full p-1.5 flex items-center justify-center">
            <Image
              src={logoSrc}
              alt="Karkachi Phone"
              width={40}
              height={40}
              className={`w-full h-full object-contain transition-all duration-300 ${
                isDark && useFilter ? "brightness-0 invert" : ""
              }`}
              priority
            />
          </div>
        </div>
        {/* Subtle glow in dark mode */}
        {isDark && (
          <div className="absolute inset-0 bg-accent/20 blur-xl rounded-full -z-10 animate-pulse" />
        )}
      </div>
      
      <div className="flex flex-col">
        <span className={`font-black text-lg md:text-xl tracking-tight leading-none transition-colors ${
          isDark ? "text-white" : "text-slate-900"
        }`}>
          KARKACHI
        </span>
        <span className="text-[9px] md:text-[11px] font-bold text-accent tracking-[.3em] uppercase mt-0.5">
          Phone
        </span>
      </div>
    </Link>
  )
}
