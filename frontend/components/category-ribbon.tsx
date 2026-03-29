"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useAdmin } from "@/hooks/use-admin";

const urlBase = process.env.NEXT_PUBLIC_API_URL || "https://karkachiphon-app-a513bd8dab1d.herokuapp.com/api";

interface CategoryChoix {
  id: string;
  name: string;
  image: string;
}

interface CategoryRibbonProps {
  isScrolled: boolean;
}

// Clés pour le stockage local
const CATEGORIES_CACHE_KEY = "cached_categories";
const CATEGORIES_CACHE_TIMESTAMP_KEY = "cached_categories_timestamp";
const CACHE_DURATION = 60 * 60 * 1000;

// Dynamic colors for categories
const categoryColors = [
  { base: "bg-blue-500 hover:bg-blue-600", gradient: "from-blue-400 to-blue-600", light: "bg-blue-400" },
  { base: "bg-green-500 hover:bg-green-600", gradient: "from-green-400 to-green-600", light: "bg-green-400" },
  { base: "bg-purple-500 hover:bg-purple-600", gradient: "from-purple-400 to-purple-600", light: "bg-purple-400" },
  { base: "bg-red-500 hover:bg-red-600", gradient: "from-red-400 to-red-600", light: "bg-red-400" },
  { base: "bg-yellow-500 hover:bg-yellow-600", gradient: "from-yellow-400 to-yellow-600", light: "bg-yellow-400" },
  { base: "bg-orange-500 hover:bg-orange-600", gradient: "from-orange-400 to-orange-600", light: "bg-orange-400" },
];

export default function CategoryRibbon({ isScrolled }: CategoryRibbonProps) {
  const pathname = usePathname();
  const { settings } = useAdmin();

  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrollDownCount, setScrollDownCount] = useState(0);
  const [showHyphen, setShowHyphen] = useState(false);
  const [isRibbonVisible, setIsRibbonVisible] = useState(true);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [apiCategories, setApiCategories] = useState<CategoryChoix[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour vérifier si le cache est valide
  const isCacheValid = (): boolean => {
    try {
      const cachedTimestamp = localStorage.getItem(CATEGORIES_CACHE_TIMESTAMP_KEY);
      if (!cachedTimestamp) return false;
      
      return Date.now() - parseInt(cachedTimestamp) < CACHE_DURATION;
    } catch (error) {
      console.error("Error checking cache validity:", error);
      return false;
    }
  };

  // Fonction pour récupérer les catégories depuis le cache
  const getCachedCategories = (): CategoryChoix[] | null => {
    try {
      const cached = localStorage.getItem(CATEGORIES_CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error("Error reading cache:", error);
      return null;
    }
  };

  // Fonction pour mettre en cache les catégories
  const cacheCategories = (categories: CategoryChoix[]): void => {
    try {
      localStorage.setItem(CATEGORIES_CACHE_KEY, JSON.stringify(categories));
      localStorage.setItem(CATEGORIES_CACHE_TIMESTAMP_KEY, Date.now().toString());
    } catch (error) {
      console.error("Error caching categories:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Vérifier d'abord si on a des données en cache valides
      if (isCacheValid()) {
        const cachedCategories = getCachedCategories();
        if (cachedCategories) {
          setApiCategories(cachedCategories);
          setIsLoading(false);
          return;
        }
      }
      
      // Si pas de cache valide, faire la requête API
      const response = await fetch(`${urlBase}/public/category/root-active`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const categories: CategoryChoix[] = await response.json();
      
      // Mettre en cache les nouvelles données
      cacheCategories(categories);
      setApiCategories(categories);
    } catch (err) {
      console.error("Error fetching categories:", err);
      
      // En cas d'erreur, essayer d'utiliser les données en cache même si expirées
      const cachedCategories = getCachedCategories();
      if (cachedCategories) {
        setApiCategories(cachedCategories);
        setError("Using cached data due to network error");
      } else {
        setError(err instanceof Error ? err.message : "Failed to fetch categories");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const dynamicCategories = apiCategories.map((cat, index) => {
    const slug = cat.name.toLowerCase().replace(/\s+/g, '-');
    const catColor = categoryColors[index % categoryColors.length];
    return {
      id: cat.id,
      name: cat.name,
      href: `/categories/${cat.id}`,
      slug,
      image: cat.image,
      color: catColor.base,
      gradient: catColor.gradient,
      light: catColor.light,
    };
  });

  // Load ribbon state from localStorage
  useEffect(() => {
    const savedRibbonState = localStorage.getItem("categoryRibbonState");
    if (savedRibbonState) {
      const state = JSON.parse(savedRibbonState);
      setIsRibbonVisible(state.isVisible ?? true);
      setShowHyphen(state.showHyphen ?? false);
    }
  }, []);

  // Save ribbon state to localStorage
  useEffect(() => {
    const state = {
      isVisible: isRibbonVisible,
      showHyphen: showHyphen,
    };
    localStorage.setItem("categoryRibbonState", JSON.stringify(state));
  }, [isRibbonVisible, showHyphen]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY) {
        // Scrolling down
        if (!isRibbonVisible) {
          setScrollDownCount((prev) => prev + 1);
          if (scrollDownCount + 1 >= 2) {
            setIsRibbonVisible(true);
            setShowHyphen(false);
            setScrollDownCount(0);
          }
        }
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up
        if (isRibbonVisible) {
          setIsRibbonVisible(false);
          setScrollDownCount(0);
          setTimeout(() => setShowHyphen(true), 100);
        }
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, scrollDownCount, isRibbonVisible]);

  if (pathname.startsWith("/admin") || pathname.startsWith("/auth/")) {
    return null;
  }

  if (isLoading || error) {
    return (
      <>
        {/* Main Ribbon Skeleton */}
        {isRibbonVisible && (
          <div
            className={cn(
              "fixed top-16 left-1/2 transform -translate-x-1/2 z-40 w-[90%] sm:w-[70%] md:w-[50%] lg:w-[28%] min-w-[280px] max-w-[400px] flex justify-center space-x-1 sm:space-x-2 py-2 px-2 sm:py-3 sm:px-4 transition-all duration-500 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl backdrop-blur-xl",
              isScrolled
                ? "bg-white/95 dark:bg-gray-900/95 shadow-2xl border-gray-300/60 dark:border-gray-600/60"
                : "bg-white/90 dark:bg-gray-800/90 shadow-xl",
            )}
          >
            <div className="flex justify-center space-x-1 sm:space-x-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse"
                />
              ))}
            </div>
          </div>
        )}

        {/* Hyphen Skeleton */}
        {showHyphen && !isRibbonVisible && (
          <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-40 w-[80%] sm:w-[60%] md:w-[40%] lg:w-[25%] flex justify-center space-x-2 py-2 transition-all duration-300">
            <div className="flex justify-center space-x-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-full px-4 py-2 shadow-lg">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-6 h-1 sm:w-8 sm:h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 animate-pulse"
                />
              ))}
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      {/* Main Ribbon */}
      {isRibbonVisible && (
        <div
          className={cn(
            "fixed top-16 left-1/2 transform -translate-x-1/2 z-40 w-[90%] sm:w-[70%] md:w-[50%] lg:w-[28%] min-w-[280px] max-w-[400px] flex justify-center space-x-1 sm:space-x-2 py-2 px-2 sm:py-3 sm:px-4 transition-all duration-500 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl backdrop-blur-xl",
            isScrolled
              ? "bg-white/95 dark:bg-gray-900/95 shadow-2xl border-gray-300/60 dark:border-gray-600/60"
              : "bg-white/90 dark:bg-gray-800/90 shadow-xl",
            "hover:shadow-3xl hover:scale-105 hover:bg-white/98 dark:hover:bg-gray-800/98",
          )}
        >
          <div className="flex justify-center space-x-1 sm:space-x-2 relative">
            {dynamicCategories.map((category, index) => (
              <div
                key={category.id}
                className="relative flex flex-col items-center group"
                onMouseEnter={() => setHoveredCategory(category.name)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <Button
                  asChild
                  variant="ghost"
                  className={cn(
                    "flex w-8 h-8 sm:w-10 sm:h-10 rounded-xl text-gray-600 items-center justify-center p-0 dark:text-gray-300 transition-all duration-500 ease-out relative overflow-hidden border-2 border-transparent",
                    "hover:border-white/40 dark:hover:border-gray-600/40",
                    pathname === category.href
                      ? `${category.color} text-white shadow-lg ring-2 ring-white/50 border-white/30`
                      : `hover:text-white hover:shadow-2xl`,
                    hoveredCategory === category.name && "scale-125 z-30 shadow-2xl border-white/50",
                    // Dynamic hover background colors
                    hoveredCategory === category.name && `bg-gradient-to-br ${category.gradient}`,
                  )}
                >
                  <Link href={category.href} className="relative z-10">
                    <img
                      src={category.image}
                      alt={category.name}
                      className={cn(
                        "transition-all duration-500 drop-shadow-sm object-contain",
                        hoveredCategory === category.name ? "w-5 h-5 sm:w-6 sm:h-6" : "w-4 h-4 sm:w-5 sm:h-5",
                        pathname === category.href && "w-5 h-5 sm:w-6 sm:h-6 drop-shadow-md",
                      )}
                    />
                  </Link>
                </Button>

                {/* Enhanced name tooltip */}
                {hoveredCategory === category.name && (
                  <div className="absolute top-10 sm:top-14 text-sm font-semibold text-gray-800 dark:text-gray-200 bg-white/98 dark:bg-gray-800/98 px-4 py-2 rounded-xl shadow-2xl border border-gray-200/80 dark:border-gray-600/80 whitespace-nowrap z-50 backdrop-blur-sm animate-in fade-in-0 zoom-in-95 duration-300">
                    {category.name}
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white dark:bg-gray-800 border-l border-t border-gray-200/80 dark:border-gray-600/80 rotate-45"></div>
                  </div>
                )}

                {/* Subtle glow effect */}
                {hoveredCategory === category.name && (
                  <div className="absolute inset-0 rounded-xl animate-pulse opacity-20 bg-current scale-110 blur-sm"></div>
                )}

                {/* Selected category name below button */}
                {pathname === category.href && (
                  <div className="absolute top-10 sm:top-12 text-xs sm:text-xs font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap z-20">
                    {category.name}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hyphen Indicator */}
      {showHyphen && !isRibbonVisible && (
        <div
          className="fixed top-16 left-1/2 transform -translate-x-1/2 z-40 w-[80%] sm:w-[60%] md:w-[40%] lg:w-[25%] flex justify-center space-x-2 py-2 transition-all duration-300 cursor-pointer hover:scale-110"
          onClick={() => {
            setIsRibbonVisible(true);
            setShowHyphen(false);
            setScrollDownCount(0);
          }}
        >
          <div className="flex justify-center space-x-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-full px-4 py-2 shadow-lg">
            {dynamicCategories.map((category, index) => (
              <div
                key={category.id}
                className={cn(
                  "w-6 h-1 sm:w-8 sm:h-1.5 rounded-full transition-all duration-300 blur-[0.3px] hover:blur-none",
                  category.light,
                )}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}