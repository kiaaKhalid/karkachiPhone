"use client"

import type React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SearchIcon, Mic, Camera } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get("q") || "")
  const [isListening, setIsListening] = useState(false)

  useEffect(() => {
    setQuery(searchParams.get("q") || "")
  }, [searchParams])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?query=${encodeURIComponent(query.trim())}`)
    } else {
      router.push("/search")
    }
  }

  const handleVoiceSearch = () => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
      const recognition = new SpeechRecognition()

      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = "en-US"

      recognition.onstart = () => {
        setIsListening(true)
      }

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setQuery(transcript)
        setIsListening(false)
        router.push(`/search?query=${encodeURIComponent(transcript)}`)
      }

      recognition.onerror = () => {
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognition.start()
    }
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSearch} className="relative group flex-1 max-w-lg">
        {/* Main Search Input */}
        <Input
          type="search"
          placeholder="Search for products, brands, categories..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-full pl-10 pr-4"
        />
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          className="absolute left-0 top-0 h-full rounded-full hover:bg-transparent"
        >
          <SearchIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <span className="sr-only">Search</span>
        </Button>

        {/* Action Buttons */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          {/* Voice Search */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={`h-10 w-10 rounded-xl transition-all duration-300 ${
              isListening ? "bg-red-100 text-red-600 animate-pulse" : "hover:bg-purple-100 hover:text-purple-600"
            }`}
            onClick={handleVoiceSearch}
            title="Voice Search"
          >
            <Mic className="h-5 w-5" />
          </Button>

          {/* Visual Search */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-xl hover:bg-purple-100 hover:text-purple-600 transition-all duration-300"
            title="Visual Search"
          >
            <Camera className="h-5 w-5" />
          </Button>
        </div>

        {/* Search Suggestions Dropdown */}
        {query && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
            <div className="p-4 space-y-2">
              {/* Auto-complete suggestions */}
              {[`${query} phone`, `${query} case`, `${query} accessories`, `${query} review`].map(
                (suggestion, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-start text-left hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl"
                    onClick={() => {
                      setQuery(suggestion)
                      router.push(`/search?query=${encodeURIComponent(suggestion)}`)
                    }}
                  >
                    <SearchIcon className="h-4 w-4 mr-3 text-gray-400" />
                    <span className="truncate">{suggestion}</span>
                  </Button>
                ),
              )}
            </div>
          </div>
        )}
      </form>

      {/* Voice Search Indicator */}
      {isListening && (
        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-medium animate-pulse">
          Listening...
        </div>
      )}
    </div>
  )
}
