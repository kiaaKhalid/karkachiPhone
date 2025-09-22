"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2 } from "lucide-react"
import type { CartItem as CartItemType } from "@/lib/types"

interface CartItemProps {
  item: CartItemType
  onQuantityChange: (id: string, quantity: number) => void
  onRemove: (id: string) => void
}

export function CartItem({ item, onQuantityChange, onRemove }: CartItemProps) {
  return (
    <div className="flex items-center gap-4 border-b py-4">
      <Link href={`/products/${item.product.id}`} className="shrink-0">
        <Image
          src={item.product.image || "/Placeholder.png"}
          alt={item.product.name}
          width={80}
          height={80}
          className="rounded-md object-cover"
        />
      </Link>
      <div className="flex-1">
        <Link href={`/products/${item.product.id}`} className="font-medium hover:underline">
          {item.product.name}
        </Link>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {item.product.price.toFixed(2)} MAD x {item.quantity}
        </p>
        <p className="font-semibold">{(item.product.price * item.quantity).toFixed(2)} MAD</p>
      </div>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min="1"
          value={item.quantity}
          onChange={(e) => onQuantityChange(item.product.id, Number.parseInt(e.target.value))}
          className="w-16 text-center"
        />
        <Button variant="ghost" size="icon" onClick={() => onRemove(item.product.id)}>
          <Trash2 className="h-5 w-5 text-red-500" />
          <span className="sr-only">Remove</span>
        </Button>
      </div>
    </div>
  )
}
