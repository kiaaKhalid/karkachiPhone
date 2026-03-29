"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Star, Heart } from "lucide-react";
import AddToCartButton from "@/components/add-to-cart-button";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

interface ProductDetailsProps {
  product?: Product | null; // On autorise null/undefined
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  // ⚡ Vérification si le produit existe
  if (!product) {
    return (
      <div className="p-8 text-center text-red-500 font-bold">
        Produit introuvable ou non disponible.
      </div>
    );
  }

  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const isWishlisted = wishlist.some((item) => item.id === product.id);

  const stock = product.stock ?? 0;
  const price = product.price ?? 0;
  const rating = product.rating ?? 0;
  const reviewCount = product.reviewCount ?? 0;

  const handleQuantityChange = (amount: number) => {
    setQuantity((prev) => Math.max(1, Math.min(stock, prev + amount)));
  };

  const handleWishlistClick = () => {
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-8 lg:gap-12 py-8">
      {/* Image produit */}
      <div className="relative h-[400px] md:h-[500px] rounded-lg overflow-hidden shadow-lg">
        <Image
          src={product.image || "/Placeholder.png"}
          alt={product.name || "Produit"}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 500px"
        />
      </div>

      {/* Détails produit */}
      <div className="flex flex-col justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {product.name ?? "Nom du produit"}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
            {product.brand ?? "Marque inconnue"} - {product.category ?? "Catégorie inconnue"}
          </p>

          {/* Étoiles + avis */}
          <div className="flex items-center mb-4">
            <div className="flex text-yellow-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "w-5 h-5",
                    rating > i ? "fill-current" : "fill-gray-300 dark:fill-gray-600"
                  )}
                />
              ))}
            </div>
            <span className="text-md text-gray-600 dark:text-gray-300 ml-2">
              ({reviewCount} reviews)
            </span>
          </div>

          {/* Prix */}
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            {price.toFixed(2)} MAD
          </p>

          {/* Description */}
          <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
            {product.description ?? "Aucune description disponible."}
          </p>

          {/* Quantité */}
          <div className="flex items-center mb-6">
            <span className="font-medium text-gray-700 dark:text-gray-300 mr-4">Quantity:</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1}
              className="w-8 h-8"
            >
              -
            </Button>
            <span className="mx-4 text-lg font-medium">{quantity}</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleQuantityChange(1)}
              disabled={quantity >= stock}
              className="w-8 h-8"
            >
              +
            </Button>
            <span className="ml-4 text-sm text-gray-500 dark:text-gray-400">
              ({stock} in stock)
            </span>
          </div>
        </div>

        {/* Boutons */}
        <div className="flex space-x-4 mt-6">
          <AddToCartButton
            product={{
              id: product.id,
              name: product.name ?? "Produit",
              price: price,
              image: product.image || "/Placeholder.png",
              category: product.category || undefined,
              stock: stock,
            }}
            className="flex-1"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={handleWishlistClick}
            className="w-12 h-12 rounded-full bg-transparent"
          >
            <Heart
              className={cn(
                "w-6 h-6",
                isWishlisted ? "fill-red-500 text-red-500" : "text-gray-500 dark:text-gray-400"
              )}
            />
          </Button>
        </div>
      </div>
    </div>
  );
}