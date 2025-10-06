"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Settings,
  Moon,
  Sun,
  Heart,
  ShoppingCart,
  Globe,
  Menu,
  X,
  Home,
  Package,
  Tag,
  Info,
  Grid3x3,
  User,
  LogOut,
  Shield,
  BarChart3,
  Users,
  MessageSquare,
  Cog,
  ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import CategoryRibbon from "./category-ribbon"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useCart } from "@/hooks/use-cart"
import { useAuth } from "@/hooks/use-auth"
import { decryptData } from "@/lib/security"

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [showRibbon, setShowRibbon] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [upScrollCount, setUpScrollCount] = useState(0)
  const pathname = usePathname()
  const [themeMode, setThemeMode] = useState<"light" | "dark" | "system">("dark")
  const [currentLanguage, setCurrentLanguage] = useState("en")
  const [isMobile, setIsMobile] = useState(false)
  const [showMobileDrawer, setShowMobileDrawer] = useState(false)
  const { totalItems } = useCart()
  const { user, isAuthenticated, logout, isLoading } = useAuth()

  const [avatarUrl, setAvatarUrl] = useState<string>("")

  useEffect(() => {
    const fetchUserAvatarFromLocalStorage = async () => {
      const encryptedUser = localStorage.getItem("auth_user")
      if (encryptedUser && isAuthenticated) {
        try {
          const decryptedUserData = await decryptData(encryptedUser)
          const userData = JSON.parse(decryptedUserData)
          setAvatarUrl(userData.user?.avatar || "/Placeholder.png?height=32&width=32")
        } catch (error) {
          console.error("Error decrypting user data:", error)
          setAvatarUrl("/Placeholder.png?height=32&width=32")
        }
      } else {
        setAvatarUrl("")
      }
    }

    fetchUserAvatarFromLocalStorage()
  }, [isAuthenticated])

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      setIsScrolled(currentScrollY > 10)

      if (currentScrollY > lastScrollY) {
        // Scrolling down
        setShowRibbon(false)
        setUpScrollCount(0)
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up
        setUpScrollCount((prev) => prev + 1)
        if (upScrollCount + 1 >= 2) {
          setShowRibbon(true)
          setUpScrollCount(0)
        }
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY, upScrollCount])

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024) // lg breakpoint
    }

    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  useEffect(() => {
    document.documentElement.classList.add("dark")
  }, [])

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  const cycleTheme = () => {
    const modes: ("light" | "dark" | "system")[] = ["light", "system", "dark"]
    const currentIndex = modes.indexOf(themeMode)
    const nextIndex = (currentIndex + 1) % modes.length
    const nextMode = modes[nextIndex]
    setThemeMode(nextMode)

    if (nextMode === "light") {
      document.documentElement.classList.remove("dark")
    } else if (nextMode === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      // system mode - check user's system preference
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      if (systemPrefersDark) {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }
    }
  }

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "ar", name: "العربية", flag: "🇸🇦" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
  ]

  const mobilePages = [
    { href: "/", name: "Accueil", icon: Home },
    { href: "/products", name: "Produits", icon: Package },
    { href: "/services", name: "Services", icon: Settings },
    { href: "/deals", name: "Offres", icon: Tag },
    { href: "/about", name: "À propos", icon: Info },
    { href: "/categories", name: "Catégories", icon: Grid3x3 },
    { href: "/wishlist", name: "Liste d'envies", icon: Heart },
  ]

  const adminPages = [
    { href: "/admin", name: "Tableau de bord", icon: BarChart3 },
    { href: "/admin/orders", name: "Commandes", icon: Package },
    { href: "/admin/products", name: "Produits", icon: Tag },
    { href: "/admin/users", name: "Utilisateurs", icon: Users },
    { href: "/admin/messages", name: "Messages", icon: MessageSquare },
    { href: "/admin/settings", name: "Paramètres", icon: Cog },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 w-full flex flex-col items-center justify-between transition-all duration-300">
      {/* First Line: Main Navigation */}
      <div
        className={cn(
          "w-full flex items-center justify-between h-16 transition-all duration-300 bg-gray-100 dark:bg-gray-900 bg-opacity-80 dark:bg-opacity-80 backdrop-blur-3xl border-b border-gray-200 dark:border-gray-700 px-4 lg:px-6",
        )}
      >
        {/* Mobile Menu Button and Logo - Mobile only */}
        <div className="lg:hidden flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="p-2 hover:bg-accent hover:text-accent-foreground"
            onClick={() => setShowMobileDrawer(true)}
          >
            <Menu className="h-6 w-6 text-muted-foreground" />
          </Button>

          <Link href="/" className="flex items-center space-x-2">
            <img src="/logo.png" alt="KARKACHI PHONE Logo" className="w-8 h-8" />
            <div>
              <span className="text-lg font-bold text-[#01A0EA]">KARKACHI PHONE</span>
              <div className="text-xs text-muted-foreground">Premium Mobile Store</div>
            </div>
          </Link>
        </div>

        {/* Desktop Logo - Desktop only */}
        <div className="hidden lg:flex items-center space-x-2 ml-5">
          <Link href="/" className="flex items-center space-x-2">
            <img src="/logo.png" alt="KARKACHI PHONE Logo" className="w-10 h-10" />
            <div>
              <span className="text-xl font-bold text-[#01A0EA]">KARKACHI PHONE</span>
              <div className="text-xs text-muted-foreground">Premium Mobile Store</div>
            </div>
          </Link>
        </div>

        {/* Center Links - Desktop only */}
        <div className="hidden lg:flex items-center space-x-6">
          {["/products", "/services", "/deals", "/about"].map((href) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "text-foreground hover:text-primary transition-colors font-medium",
                isActive(href) && "text-[#01A0EA]",
              )}
            >
              {href.replace("/", "").charAt(0).toUpperCase() + href.slice(2)}
            </Link>
          ))}
        </div>

        {/* Right Icons */}
        <div className="flex items-center space-x-2 lg:space-x-4 pr-2.5">

          {/* Basket Icon with Count */}
          <div className="relative">
            <Button asChild variant="ghost" size="sm" className="p-2 hover:bg-accent hover:text-accent-foreground">
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5 text-muted-foreground" />
              </Link>
            </Button>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                {totalItems}
              </span>
            )}
          </div>

          {/* Settings Dropdown - Desktop only */}
          <div className="hidden lg:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2 hover:bg-accent hover:text-accent-foreground">
                  <Settings className="h-5 w-5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-80 p-0 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-2xl shadow-2xl"
              >
                <div className="p-6 space-y-6">
                  {/* Theme */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Thème</h3>
                    <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <Sun className="h-5 w-5 text-yellow-500" />
                        <span className="font-medium">Theme Mode</span>
                        <Moon className="h-5 w-5 text-blue-400" />
                      </div>
                      <button
                        onClick={cycleTheme}
                        className="relative inline-flex h-6 w-16 items-center rounded-full bg-gray-200 dark:bg-gray-600 transition-colors"
                      >
                        <span
                          className={cn(
                            "inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-lg",
                            themeMode === "light" && "translate-x-0.5",
                            themeMode === "system" && "translate-x-5",
                            themeMode === "dark" && "translate-x-10",
                          )}
                        />
                        <div className="absolute inset-0 flex items-center justify-around px-1">
                          <Sun className="h-3 w-3 text-yellow-600" />
                          <div className="h-3 w-3 rounded-full border border-gray-400" />
                          <Moon className="h-3 w-3 text-blue-600" />
                        </div>
                      </button>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
                      Current: {themeMode.charAt(0).toUpperCase() + themeMode.slice(1)}
                    </div>
                  </div>

                  {/* Language */}
                  <div>
                    <div className="flex items-center space-x-2 mb-4">
                      <Globe className="h-5 w-5" />
                      <h3 className="text-lg font-semibold">Langue</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => setCurrentLanguage(lang.code)}
                          className={cn(
                            "flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors",
                            currentLanguage === lang.code
                              ? "bg-[#01A0EA] text-white"
                              : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                          )}
                        >
                          <span className="text-lg">{lang.flag}</span>
                          <span className="font-medium">{lang.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Actions rapides */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Actions rapides</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <Link
                        href="/dashboard/orders"
                        className="flex items-center justify-center space-x-2 p-4 bg-muted rounded-xl hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        <ShoppingCart className="h-5 w-5" />
                        <span className="font-medium">Commandes</span>
                      </Link>
                      <Link
                        href="/wishlist"
                        className="flex items-center justify-center space-x-2 p-4 bg-muted rounded-xl hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        <Heart className="h-5 w-5" />
                        <span className="font-medium">Liste d'envies</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* User Profile / Auth Buttons - Desktop only */}
          <div className="hidden lg:flex items-center space-x-2">
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2 p-2 hover:bg-accent hover:text-accent-foreground"
                  >
                    <img
                      src={avatarUrl || "/Placeholder.png?height=32&width=32"}
                      alt={user.name}
                      className="w-8 h-8 rounded-full border-2 border-[#01A0EA]"
                      onError={(e) => {
                        // Fallback if image fails to load
                        e.currentTarget.src = "/Placeholder.png?height=32&width=32"
                      }}
                    />
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role}</span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 p-2">
                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile" className="flex items-center space-x-2 cursor-pointer">
                      <User className="h-4 w-4" />
                      <span>Profil</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/orders" className="flex items-center space-x-2 cursor-pointer">
                      <Package className="h-4 w-4" />
                      <span>Mes Commandes</span>
                    </Link>
                  </DropdownMenuItem>

                  {(user.role === "admin" || user.role === "super_admin") && (
                    <>
                      <DropdownMenuSeparator />
                      <div className="px-2 py-1">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Panneau d'administration
                        </p>
                      </div>
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center space-x-2 cursor-pointer text-[#01A0EA]">
                          <Shield className="h-4 w-4" />
                          <span>Tableau de bord</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/orders" className="flex items-center space-x-2 cursor-pointer">
                          <Package className="h-4 w-4" />
                          <span>Gérer les commandes</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/users" className="flex items-center space-x-2 cursor-pointer">
                          <Users className="h-4 w-4" />
                          <span>Gérer les utilisateurs</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/messages" className="flex items-center space-x-2 cursor-pointer">
                          <MessageSquare className="h-4 w-4" />
                          <span>Messages</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={logout}
                    className="flex items-center space-x-2 cursor-pointer text-red-600 dark:text-red-400"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Déconnexion</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button
                  asChild
                  className="bg-[#01A0EA] text-white hover:bg-[#0190D4] px-4 py-2 rounded-md transition-colors"
                >
                  <Link href="/auth/login">Connexion</Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="border-[#01A0EA] text-[#01A0EA] hover:bg-[#01A0EA] hover:text-white px-4 py-2 rounded-md transition-colors bg-transparent"
                >
                  <Link href="/auth/register">S'inscrire</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {showMobileDrawer && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setShowMobileDrawer(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={cn(
          "lg:hidden fixed top-0 left-0 h-full w-80 bg-white dark:bg-gray-900 z-50 transform transition-transform duration-300 ease-in-out shadow-2xl",
          showMobileDrawer ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="p-6 h-full overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <img src="/logo.png" alt="KARKACHI PHONE Logo" className="w-8 h-8" />
              <div>
                <span className="text-lg font-bold text-[#01A0EA]">KARKACHI PHONE</span>
                <div className="text-xs text-muted-foreground">Premium Mobile Store</div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowMobileDrawer(false)} className="p-2">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* User Profile Section - Mobile */}
          {isAuthenticated && user && (
            <div className="mb-6 px-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-full flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <img
                      src={avatarUrl || "/Placeholder.png?height=40&width=40"}
                      alt={user.name}
                      className="w-10 h-10 rounded-full border-2 border-[#01A0EA]"
                      onError={(e) => {
                        // Fallback if image fails to load
                        e.currentTarget.src = "/Placeholder.png?height=40&width=40"
                      }}
                    />
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                      <p className="text-xs text-[#01A0EA] font-medium capitalize">{user.role}</p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 p-2">
                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild>
                    <Link
                      href="/dashboard/profile"
                      className="flex items-center space-x-2 cursor-pointer"
                      onClick={() => setShowMobileDrawer(false)}
                    >
                      <User className="h-4 w-4" />
                      <span>Paramètres du profil</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link
                      href="/dashboard/orders"
                      className="flex items-center space-x-2 cursor-pointer"
                      onClick={() => setShowMobileDrawer(false)}
                    >
                      <Package className="h-4 w-4" />
                      <span>Mes Commandes</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link
                      href="/wishlist"
                      className="flex items-center space-x-2 cursor-pointer"
                      onClick={() => setShowMobileDrawer(false)}
                    >
                      <Heart className="h-4 w-4" />
                      <span>Liste d'envies</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link
                      href="/dashboard/notifications"
                      className="flex items-center space-x-2 cursor-pointer"
                      onClick={() => setShowMobileDrawer(false)}
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>Notifications</span>
                    </Link>
                  </DropdownMenuItem>

                  {user.role === "admin" && (
                    <>
                      <DropdownMenuSeparator />
                      <div className="px-2 py-1">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Panneau d'administration
                        </p>
                      </div>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/admin"
                          className="flex items-center space-x-2 cursor-pointer text-[#01A0EA]"
                          onClick={() => setShowMobileDrawer(false)}
                        >
                          <Shield className="h-4 w-4" />
                          <span>Tableau de bord</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/admin/users"
                          className="flex items-center space-x-2 cursor-pointer"
                          onClick={() => setShowMobileDrawer(false)}
                        >
                          <Users className="h-4 w-4" />
                          <span>Gérer les utilisateurs</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={() => {
                      logout()
                      setShowMobileDrawer(false)
                    }}
                    className="flex items-center space-x-2 cursor-pointer text-red-600 dark:text-red-400"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Déconnexion</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* Theme Switch - Mobile */}
          <div className="mb-6 px-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Sun className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">Thème</span>
                  <Moon className="h-4 w-4 text-blue-400" />
                </div>
                <button
                  onClick={cycleTheme}
                  className="relative inline-flex h-6 w-16 items-center rounded-full bg-gray-200 dark:bg-gray-600 transition-colors"
                >
                  <span
                    className={cn(
                      "inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-lg",
                      themeMode === "light" && "translate-x-0.5",
                      themeMode === "system" && "translate-x-5",
                      themeMode === "dark" && "translate-x-10",
                    )}
                  />
                  <div className="absolute inset-0 flex items-center justify-around px-1">
                    <Sun className="h-3 w-3 text-yellow-600" />
                    <div className="h-3 w-3 rounded-full border border-gray-400" />
                    <Moon className="h-3 w-3 text-blue-600" />
                  </div>
                </button>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Current: {themeMode.charAt(0).toUpperCase() + themeMode.slice(1)}
              </div>
            </div>
          </div>

          {/* Language Dropdown - Mobile */}
          <div className="mb-6 px-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4" />
                  <span className="text-sm font-medium">Langue</span>
                </div>
              </div>
              <div className="relative">
                <select
                  value={currentLanguage}
                  onChange={(e) => setCurrentLanguage(e.target.value)}
                  className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#01A0EA] focus:border-transparent"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} {lang.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1 mb-8">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 px-4">NAVIGATION</h3>
            {mobilePages.map((page) => {
              const IconComponent = page.icon
              return (
                <Link
                  key={page.href}
                  href={page.href}
                  onClick={() => setShowMobileDrawer(false)}
                  className={cn(
                    "flex items-center px-4 py-3 rounded-lg transition-colors hover:bg-accent hover:text-accent-foreground text-sm font-medium",
                    isActive(page.href) && "bg-[#01A0EA] text-white hover:bg-[#0190D4]",
                  )}
                >
                  <IconComponent className="h-5 w-5 mr-3" />
                  <span>{page.name}</span>
                  {page.href === "/cart" && totalItems > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>

          {/* Admin Section - Mobile */}
          {isAuthenticated && user?.role === "admin" && (
            <div className="space-y-1 mb-8">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 px-4">Panneau d'administration</h3>
              {adminPages.map((page) => {
                const IconComponent = page.icon
                return (
                  <Link
                    key={page.href}
                    href={page.href}
                    onClick={() => setShowMobileDrawer(false)}
                    className={cn(
                      "flex items-center px-4 py-3 rounded-lg transition-colors hover:bg-accent hover:text-accent-foreground text-sm font-medium",
                      isActive(page.href) && "bg-[#01A0EA] text-white hover:bg-[#0190D4]",
                    )}
                  >
                    <IconComponent className="h-5 w-5 mr-3" />
                    <span>{page.name}</span>
                  </Link>
                )
              })}
            </div>
          )}

          {/* Settings Section */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-muted-foreground mb-4 px-4">Paramètres</h3>
          </div>

          {/* Auth Buttons */}
          <div className="px-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            {isAuthenticated && user ? (
              <div className="text-center text-sm text-gray-500 dark:text-gray-400">Connecté en tant que {user.name}</div>
            ) : (
              <div className="flex space-x-2">
                <Button
                  asChild
                  className="flex-1 bg-[#01A0EA] text-white hover:bg-[#0190D4] transition-colors text-sm py-2"
                  onClick={() => setShowMobileDrawer(false)}
                >
                  <Link href="/auth/login">Connexion</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="flex-1 border-[#01A0EA] text-[#01A0EA] hover:bg-[#01A0EA] hover:text-white transition-colors bg-transparent text-sm py-2"
                  onClick={() => setShowMobileDrawer(false)}
                >
                  <Link href="/auth/register">S'inscrire</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ribbon - Hidden on mobile */}
      {showRibbon && !isMobile && <CategoryRibbon isScrolled={isScrolled} />}
    </nav>
  )
}