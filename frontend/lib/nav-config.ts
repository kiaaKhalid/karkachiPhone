import { Home, Grid, Heart, User, ShieldCheck, Mail, Info, Zap, Award, Settings, Package, LogOut } from "lucide-react"

export const NAV_LINKS = [
  { label: "Accueil", href: "/" },
  { label: "Produits", href: "/products" },
  { label: "Services", href: "/services" },
  { label: "Deals", href: "/deals" },
  { label: "Catégories", href: "/categories" },
  { label: "À Propos", href: "/about" },
]

export const MOBILE_TABS = [
  { label: "Accueil", icon: Home, href: "/" },
  { label: "Catalogue", icon: Grid, href: "/products" },
  { label: "Plus", icon: null, isAction: true },
  { label: "Favoris", icon: Heart, href: "/wishlist" },
  { label: "Profil", icon: User, href: "/dashboard/profile", authRequired: true, fallback: "/auth/login" },
]

export const PLUS_MENU_LINKS = [
  { label: "Services", icon: ShieldCheck, href: "/services" },
  { label: "Deals", icon: Zap, href: "/deals" },
  { label: "Promotion", icon: Zap, href: "/promotions" }, // Added to fix empty link or missing page
  { label: "À Propos", icon: Info, href: "/about" },
  { label: "Contact", icon: Mail, href: "/contact" },
]

export const USER_MENU_LINKS = [
  { label: "Mes commandes", icon: Package, href: "/orders" },
  { label: "Admin Panel", icon: Settings, href: "/admin", adminOnly: true },
  { label: "Déconnexion", icon: LogOut, action: "logout", destructive: true },
]
