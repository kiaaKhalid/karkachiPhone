"use client"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface CategoryFilterProps {
  categories: string[]
  selectedCategory: string | undefined // Changed to single selected category
  onCategoryChange: (category: string | undefined) => void // Changed to single category
}

export function CategoryFilter({ categories, selectedCategory, onCategoryChange }: CategoryFilterProps) {
  const handleCheckboxChange = (category: string, checked: boolean) => {
    if (checked) {
      onCategoryChange(category) // Set the selected category
    } else if (selectedCategory === category) {
      onCategoryChange(undefined) // Unset if the current category is unchecked
    }
  }

  return (
    <div className="bg-filter-bg dark:bg-gray-800 p-4 rounded-lg">
      <Accordion type="single" collapsible defaultValue="categories">
        <AccordionItem value="categories">
          <AccordionTrigger className="text-lg font-semibold">Categories</AccordionTrigger>
          <AccordionContent>
            <div className="grid gap-2">
              {categories.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category}`}
                    checked={selectedCategory === category} // Check if this category is selected
                    onCheckedChange={(checked) => handleCheckboxChange(category, checked as boolean)}
                  />
                  <Label htmlFor={`category-${category}`}>{category}</Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
