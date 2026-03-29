"use client"

import { createContext, useContext, useEffect, useState, type ReactNode, useCallback, useMemo } from "react"
import { useRouter, usePathname } from "next/navigation"

type Language = "en" | "es" | "fr" | "ar" | "de"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
  isRTL: boolean
}

const translations = {
  en: {
    home: "Home",
    products: "Products",
    categories: "Categories",
    deals: "Deals",
    about: "About",
    contact: "Contact",
    cart: "Cart",
    wishlist: "Wishlist",
    search: "Search",
    "search.placeholder": "Search products...",
    "add.to.cart": "Add to Cart",
    "buy.now": "Buy Now",
    price: "Price",
    "out.of.stock": "Out of Stock",
    "in.stock": "In Stock",
    brand: "Brand",
    category: "Category",
    description: "Description",
    specifications: "Specifications",
    reviews: "Reviews",
    "sign.in": "Sign In",
    "sign.up": "Sign Up",
    "sign.out": "Sign Out",
    welcome: "Welcome",
    dashboard: "Dashboard",
    profile: "Profile",
    orders: "Orders",
    settings: "Settings",
  },
  es: {
    home: "Inicio",
    products: "Productos",
    categories: "Categorías",
    deals: "Ofertas",
    about: "Acerca de",
    contact: "Contacto",
    cart: "Carrito",
    wishlist: "Lista de deseos",
    search: "Buscar",
    "search.placeholder": "Buscar productos...",
    "add.to.cart": "Añadir al carrito",
    "buy.now": "Comprar ahora",
    price: "Precio",
    "out.of.stock": "Agotado",
    "in.stock": "En stock",
    brand: "Marca",
    category: "Catégorie",
    description: "Descripción",
    specifications: "Especificaciones",
    reviews: "Reseñas",
    "sign.in": "Iniciar sesión",
    "sign.up": "Registrarse",
    "sign.out": "Cerrar sesión",
    welcome: "Bienvenido",
    dashboard: "Panel",
    profile: "Perfil",
    orders: "Pedidos",
    settings: "Configuración",
  },
  fr: {
    home: "Accueil",
    products: "Produits",
    categories: "Catégories",
    deals: "Offres",
    about: "À propos",
    contact: "Contact",
    cart: "Panier",
    wishlist: "Liste de souhaits",
    search: "Rechercher",
    "search.placeholder": "Rechercher des produits...",
    "add.to.cart": "Ajouter au panier",
    "buy.now": "Acheter maintenant",
    price: "Prix",
    "out.of.stock": "Rupture de stock",
    "in.stock": "En stock",
    brand: "Marque",
    category: "Catégorie",
    description: "Description",
    specifications: "Spécifications",
    reviews: "Avis",
    "sign.in": "Se connecter",
    "sign.up": "S'inscrire",
    "sign.out": "Se déconnecter",
    welcome: "Bienvenue",
    dashboard: "Tableau de bord",
    profile: "Profil",
    orders: "Commandes",
    settings: "Paramètres",
  },
  ar: {
    home: "الرئيسية",
    products: "المنتجات",
    categories: "الفئات",
    deals: "العروض",
    about: "حول",
    contact: "اتصل",
    cart: "السلة",
    wishlist: "قائمة الأمنيات",
    search: "بحث",
    "search.placeholder": "البحث عن المنتجات...",
    "add.to.cart": "أضف إلى السلة",
    "buy.now": "اشتري الآن",
    price: "السعر",
    "out.of.stock": "نفد المخزون",
    "in.stock": "متوفر",
    brand: "العلامة التجارية",
    category: "الفئة",
    description: "الوصف",
    specifications: "المواصفات",
    reviews: "المراجات",
    "sign.in": "تسجيل الدخول",
    "sign.up": "إنشاء حساب",
    "sign.out": "تسجيل الخروج",
    welcome: "مرحباً",
    dashboard: "لوحة التحكم",
    profile: "الملف الشخصي",
    orders: "الطلبات",
    settings: "الإعدادات",
  },
  de: {
    home: "Startseite",
    products: "Produkte",
    categories: "Kategorien",
    deals: "Angebote",
    about: "Über uns",
    contact: "Kontakt",
    cart: "Warenkorb",
    wishlist: "Wunschliste",
    search: "Suchen",
    "search.placeholder": "Produkte suchen...",
    "add.to.cart": "In den Warenkorb",
    "buy.now": "Jetzt kaufen",
    price: "Preis",
    "out.of.stock": "Ausverkauft",
    "in.stock": "Auf Lager",
    brand: "Marke",
    category: "Kategorie",
    description: "Beschreibung",
    specifications: "Spezifikationen",
    reviews: "Bewertungen",
    "sign.in": "Anmelden",
    "sign.up": "Registrieren",
    "sign.out": "Abmelden",
    welcome: "Willkommen",
    dashboard: "Dashboard",
    profile: "Profil",
    orders: "Bestellungen",
    settings: "Einstellungen",
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("language") as Language) || (pathname.split("/")[1] as Language) || "en"
    }
    return "en"
  })

  useEffect(() => {
    // You could load translations here based on the language
    console.log(`Current language: ${language}`)
    // For a real app, you'd integrate with an i18n library like react-i18next
  }, [language])

  useEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr"
  }, [language])

  const setLanguage = useCallback(
    (newLanguage: Language) => {
      setLanguageState(newLanguage)
      localStorage.setItem("language", newLanguage)
      // Construct new path with the selected language
      const segments = pathname.split("/")
      segments[1] = newLanguage // Replace the language segment
      const newPath = segments.join("/")
      router.push(newPath)
    },
    [pathname, router],
  )

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key
  }

  const isRTL = language === "ar"

  const contextValue = useMemo(() => ({ language, setLanguage, t, isRTL }), [language, setLanguage])

  return <LanguageContext.Provider value={contextValue}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
