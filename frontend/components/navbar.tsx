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
import Logo from "@/components/logo"

import { NAV_LINKS, USER_MENU_LINKS } from "@/lib/nav-config"

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
            <Logo />

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
                    {USER_MENU_LINKS.map((link) => {
                      if (link.adminOnly && !isAdmin) return null
                      const Icon = link.icon
                      const isDestructive = link.destructive
                      
                      return (
                        <button
                          key={link.label}
                          onClick={() => {
                            setUserMenuOpen(false)
                            if (link.action === "logout") logout()
                            else router.push(link.href!)
                          }}
                          className={`flex items-center gap-2.5 px-4 py-2.5 text-sm w-full transition-colors ${
                            isDestructive ? "text-destructive hover:bg-destructive/10" : "text-foreground hover:bg-secondary"
                          }`}
                        >
                          <Icon className="w-4 h-4" /> {link.label}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </nav>

            {/* Mobile Actions */}
            <div className="flex md:hidden items-center gap-1">
              {/* Mobile Search Toggle */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2.5 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Toggle search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Mobile Cart */}
              <Link
                href="/cart"
                className="p-2.5 text-muted-foreground hover:text-foreground transition-colors relative"
              >
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-accent text-white text-[9px] font-bold flex items-center justify-center">
                    {totalItems > 99 ? "9+" : totalItems}
                  </span>
                )}
              </Link>

              {/* Theme Toggle */}
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2.5 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 pb-2 -mt-1">
            {NAV_LINKS.map((link) => (
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

    </>
  )
}