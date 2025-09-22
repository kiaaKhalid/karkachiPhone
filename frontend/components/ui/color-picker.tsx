"use client"

import * as React from "react"
import { CheckIcon, ChevronDownIcon } from "@radix-ui/react-icons"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

const colors = [
  { value: "#000000", label: "Black" },
  { value: "#FFFFFF", label: "White" },
  { value: "#EF4444", label: "Red" },
  { value: "#F97316", label: "Orange" },
  { value: "#F59E0B", label: "Amber" },
  { value: "#EAB308", label: "Yellow" },
  { value: "#84CC16", label: "Lime" },
  { value: "#22C55E", label: "Green" },
  { value: "#10B981", label: "Emerald" },
  { value: "#06B6D4", label: "Cyan" },
  { value: "#0EA5E9", label: "Sky" },
  { value: "#3B82F6", label: "Blue" },
  { value: "#6366F1", label: "Indigo" },
  { value: "#8B5CF6", label: "Violet" },
  { value: "#A855F7", label: "Purple" },
  { value: "#D946EF", label: "Fuchsia" },
  { value: "#EC4899", label: "Pink" },
  { value: "#F43F5E", label: "Rose" },
]

interface ColorPickerProps {
  id: string
  value: string
  onChange: (color: string) => void
}

export function ColorPicker({ id, value, onChange }: ColorPickerProps) {
  const [open, setOpen] = React.useState(false)
  const selectedColor = colors.find((color) => color.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between bg-transparent"
          id={id}
        >
          <div className="flex items-center">
            {selectedColor && (
              <span className="mr-2 h-4 w-4 rounded-full border" style={{ backgroundColor: selectedColor.value }} />
            )}
            {selectedColor ? selectedColor.label : "Select color..."}
          </div>
          <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search color..." className="h-9" />
          <CommandList>
            <CommandEmpty>No color found.</CommandEmpty>
            <CommandGroup>
              {colors.map((color) => (
                <CommandItem
                  key={color.value}
                  value={color.label}
                  onSelect={() => {
                    onChange(color.value)
                    setOpen(false)
                  }}
                >
                  <span className="mr-2 h-4 w-4 rounded-full border" style={{ backgroundColor: color.value }} />
                  {color.label}
                  <CheckIcon className={cn("ml-auto h-4 w-4", value === color.value ? "opacity-100" : "opacity-0")} />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
