"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useAdmin } from "@/hooks/use-admin";

// Color mapping for different categories
const colorMap: Record<string, string> = {
  smartphones: "bg-blue-500 hover:bg-blue-600",
  laptops: "bg-green-500 hover:bg-green-600",
  smartwatches: "bg-purple-500 hover:bg-purple-600",
  gaming: "bg-red-500 hover:bg-red-600",
  services: "bg-yellow-500 hover:bg-yellow-600",
  accessories: "bg-orange-500 hover:bg-orange-600",
  audio: "bg-pink-500 hover:bg-pink-600",
  cameras: "bg-indigo-500 hover:bg-indigo-600",
  tablets: "bg-teal-500 hover:bg-teal-600",
  tv: "bg-cyan-500 hover:bg-cyan-600",
  appliances: "bg-gray-500 hover:bg-gray-600",
};

// Mapping for API category names to colorMap slugs
const nameToSlugMap: Record<string, string> = {
  Smartphones: "smartphones",
  Ordinateurs: "laptops",
  Audio: "audio",
  TV: "tv",
  Électroménagers: "appliances",
};

interface CategoryChoix {
  id: number;
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
      const response = await fetch("https://karkachiphon-app-a513bd8dab1d.herokuapp.com/api/public/category/root-active");

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

  const dynamicCategories = apiCategories.map((cat) => {
    const slug = nameToSlugMap[cat.name] || cat.name.toLowerCase();
    return {
      id: cat.id,
      name: cat.name,
      href: `/categories/${cat.name}`,
      slug,
      image: cat.image,
      color: colorMap[slug] || "bg-gray-500 hover:bg-gray-600",
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
                    hoveredCategory === category.name && index === 0 && "bg-gradient-to-br from-blue-400 to-blue-600",
                    hoveredCategory === category.name && index === 1 && "bg-gradient-to-br from-green-400 to-green-600",
                    hoveredCategory === category.name &&
                      index === 2 &&
                      "bg-gradient-to-br from-pink-400 to-pink-600",
                    hoveredCategory === category.name && index === 3 && "bg-gradient-to-br from-cyan-400 to-cyan-600",
                    hoveredCategory === category.name &&
                      index === 4 &&
                      "bg-gradient-to-br from-gray-400 to-gray-600",
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
                  index === 0
                    ? "bg-blue-400"
                    : index === 1
                      ? "bg-green-400"
                      : index === 2
                        ? "bg-pink-400"
                        : index === 3
                          ? "bg-cyan-400"
                          : "bg-gray-400",
                )}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}