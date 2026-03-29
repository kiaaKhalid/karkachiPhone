"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  X,
  ChevronDown,
  Phone,
  MapPin,
  LogOut,
  Settings,
  Package,
  Sun,
  Moon,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useCart } from "@/hooks/use-cart"
import { useTheme } from "next-themes"

const navLinks = [
  { label: "Accueil", href: "/" },
  { label: "Produits", href: "/products" },
  { label: "Deals", href: "/deals" },
  { label: "Marques", href: "/brands" },
  { label: "Catégories", href: "/categories" },
  { label: "À Propos", href: "/about" },
]

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuth()
  const { totalItems } = useCart()
  const { theme, setTheme } = useTheme()

  // Scroll handler
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Focus search on open
  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus()
  }, [searchOpen])

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
    setSearchOpen(false)
  }, [pathname])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery("")
      setSearchOpen(false)
    }
  }

  const isAdmin = user?.role === "admin" || user?.role === "super_admin"

  return (
    <>
    <div className="fixed top-0 left-0 right-0 z-50 w-full bg-background/95 backdrop-blur-md">
      {/* ── Announcement Bar ── */}
      <div className="announcement-bar">
        <div className="section-container flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" />
              <span className="text-xs sm:text-sm">+212 676-423340</span>
            </span>
            <span className="hidden md:flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              Marrakech, Maroc
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-orange-300 font-medium text-xs sm:text-sm">
              🚚 Livraison gratuite à partir de 300 DH
            </span>
          </div>
        </div>
      </div>

      {/* ── Main Navbar ── */}
      <header
        className={`transition-all duration-300 bg-background/95 backdrop-blur-md ${
          isScrolled ? "shadow-nav-scroll" : "shadow-nav"
        }`}
      >
        <div className="section-container">
          <div className="flex items-center justify-between h-16 md:h-18">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0">
              <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
                <span className="text-white font-bold text-lg">K</span>
              </div>
              <div>
                <span className="font-bold text-base md:text-lg text-foreground leading-none">
                  KARKACHI
                </span>
                <span className="block text-[8px] md:text-[10px] text-muted-foreground tracking-[0.2em] uppercase -mt-0.5">
                  Phone
                </span>
              </div>
            </Link>

            {/* Desktop Search */}
            <form
              onSubmit={handleSearch}
              className="hidden md:flex items-center flex-1 max-w-lg mx-8"
            >
              <div className="relative w-full group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un produit..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-secondary/50 text-sm
                             placeholder:text-muted-foreground
                             focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50
                             transition-all duration-200"
                />
              </div>
            </form>

            {/* Desktop Actions */}
            <nav className="hidden md:flex items-center gap-1">
              {/* Theme Toggle */}
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors relative"
              >
                <Heart className="w-5 h-5" />
              </Link>

              {/* Cart */}
              <Link
                href="/cart"
                className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors relative"
              >
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center">
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() =>
                    isAuthenticated ? setUserMenuOpen(!userMenuOpen) : router.push("/auth/login")
                  }
                  className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <User className="w-5 h-5" />
                </button>

                {userMenuOpen && isAuthenticated && (
                  <div className="absolute right-0 top-12 w-56 bg-card border border-border rounded-xl shadow-lg py-2 animate-fade-in z-50">
                    <div className="px-4 py-2.5 border-b border-border">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {user?.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                    <Link
                      href="/orders"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors"
                    >
                      <Package className="w-4 h-4" /> Mes commandes
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors"
                      >
                        <Settings className="w-4 h-4" /> Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setUserMenuOpen(false)
                        logout()
                      }}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-destructive hover:bg-secondary transition-colors w-full"
                    >
                      <LogOut className="w-4 h-4" /> Déconnexion
                    </button>
                  </div>
                )}
              </div>
            </nav>

            {/* Mobile Actions */}
            <div className="flex md:hidden items-center gap-1">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2.5 text-muted-foreground"
              >
                <Search className="w-5 h-5" />
              </button>
              <Link href="/cart" className="p-2.5 text-muted-foreground relative">
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 pb-2 -mt-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "text-accent bg-accent/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Mobile Search Bar */}
        {searchOpen && (
          <div className="md:hidden border-t border-border px-4 py-3 bg-background animate-slide-down">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-secondary/50 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </form>
          </div>
        )}
      </header>
    </div>

      {/* ── Mobile Drawer ── */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed top-0 right-0 bottom-0 w-[280px] bg-background z-50 md:hidden shadow-2xl animate-slide-down overflow-y-auto">
            <div className="p-5">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <span className="font-bold text-lg text-foreground">Menu</span>
                <button onClick={() => setMobileOpen(false)} className="p-1 text-muted-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User info */}
              {isAuthenticated && user && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary mb-4">
                  <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold">
                    {user.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
              )}

              {/* Nav Links */}
              <nav className="space-y-1 mb-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`block px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      pathname === link.href
                        ? "text-accent bg-accent/10"
                        : "text-foreground hover:bg-secondary"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <hr className="border-border mb-4" />

              {/* Actions */}
              <div className="space-y-1">
                <Link
                  href="/wishlist"
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-secondary transition-colors"
                >
                  <Heart className="w-4 h-4" /> Liste de souhaits
                </Link>
                <Link
                  href="/orders"
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-secondary transition-colors"
                >
                  <Package className="w-4 h-4" /> Mes commandes
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-secondary transition-colors"
                  >
                    <Settings className="w-4 h-4" /> Admin Panel
                  </Link>
                )}

                {/* Theme toggle */}
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-secondary transition-colors w-full"
                >
                  {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  {theme === "dark" ? "Mode clair" : "Mode sombre"}
                </button>
              </div>

              {/* Auth */}
              <div className="mt-6">
                {isAuthenticated ? (
                  <button
                    onClick={logout}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-destructive border border-destructive/30 hover:bg-destructive/5 transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Déconnexion
                  </button>
                ) : (
                  <Link
                    href="/auth/login"
                    className="btn-cta block text-center w-full text-sm"
                  >
                    Se connecter
                  </Link>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}