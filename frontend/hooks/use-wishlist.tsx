"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useAuth } from "./use-auth"
import { useToast } from "./use-toast"
import type { Product } from "@/lib/types"

interface WishlistContextType {
  wishlist: Product[]
  addToWishlist: (product: Product) => Promise<void>
  removeFromWishlist: (productId: string) => Promise<void>
  isInWishlist: (productId: string) => boolean
  clearWishlist: () => Promise<void>
  wishlistCount: number
  refreshWishlist: () => void
  isLoading: boolean
}

const WishlistContext = createContext<WishlistContextType | null>(null)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()

  const getAuthToken = () => localStorage.getItem("auth_token")
  const apiUrl = process.env.NEXT_PUBLIC_API_URL

  // Charger le wishlist depuis l'API
  const fetchWishlist = async () => {
    if (!isAuthenticated) {
      setWishlist([]);
      return;
    }
    try {
      setIsLoading(true);
      const token = getAuthToken();
      if (!token) {
        setWishlist([]);
        return;
      }

      const response = await fetch(`${apiUrl}/person/product/wishlist?limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data?.items) {
          // Transformer les items de l'API au type Product du frontend si nécessaire
          const formattedItems = result.data.items.map((item: any) => ({
            id: item.id?.toString() || item.id || "",
            name: item.name,
            description: item.description,
            price: item.price,
            originalPrice: item.priceOriginal,
            image: item.image,
            stock: item.stock,
            isAvailable: item.isAvailable,
          }));
          setWishlist(formattedItems);
        }
      }
    } catch (error) {
      console.error("Failed to fetch wishlist from API:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Charger à chaque changement d'utilisateur ou d'authentification
  useEffect(() => {
    fetchWishlist();
  }, [user, isAuthenticated]);

  const addToWishlist = async (product: Product) => {
    if (!isAuthenticated) return;

    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch(`${apiUrl}/person/wishlist`, {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({ productId: product.id }),
      });

      if (response.ok) {
        setWishlist((prev) => {
          if (prev.find((item) => item.id === product.id)) return prev;
          return [...prev, product];
        });
        toast({ title: "Ajouté", description: "Produit ajouté à vos favoris !" });
      } else {
        throw new Error("API responded with error");
      }
    } catch (error) {
      console.error("addToWishlist error:", error);
      toast({ title: "Erreur", description: "Impossible d'ajouter à vos favoris", variant: "destructive" });
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!isAuthenticated) return;

    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch(`${apiUrl}/person/wishlist`, {
        method: "DELETE",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({ productId }),
      });

      if (response.ok) {
        setWishlist((prev) => prev.filter((item) => item.id !== productId));
        toast({ title: "Supprimé", description: "Produit retiré de vos favoris." });
      } else {
        throw new Error("API responded with error");
      }
    } catch (error) {
      console.error("removeFromWishlist error:", error);
      toast({ title: "Erreur", description: "Impossible de retirer de vos favoris", variant: "destructive" });
    }
  };

  const isInWishlist = (productId: string) => {
    if (!isAuthenticated) return false;
    return wishlist.some((item) => item.id === productId);
  };

  const clearWishlist = async () => {
    if (!isAuthenticated) return;

    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch(`${apiUrl}/person/wishlist/clear`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setWishlist([]);
        toast({ title: "Liste vidée", description: "Tous les articles ont été retirés." });
      }
    } catch (error) {
      console.error("clearWishlist error:", error);
    }
  };

  const refreshWishlist = () => {
    fetchWishlist();
  };

  const value: WishlistContextType = {
    wishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    wishlistCount: wishlist.length,
    refreshWishlist,
    isLoading,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
