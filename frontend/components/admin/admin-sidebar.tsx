"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  LayoutDashboard,
  Package,
  Tag,
  Users,
  ShoppingCart,
  BarChart3,
  Star,
  UserCheck,
  Shield,
  Home,
  Menu,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  HelpCircle,
  LogOut,
  X,
  Component,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin",
  },
  {
    title: "Categories",
    icon: Component,
    href: "/admin/categories",
  },
  {
    title: "Products",
    icon: Package,
    href: "/admin/products",
    submenu: [
      { title: "All Products", href: "/admin/products" },
      { title: "Add Product", href: "/admin/products/add" },
    ],
  },

  {
    title: "Brands",
    icon: Tag,
    href: "/admin/brands",

  },
  {
    title: "Orders",
    icon: ShoppingCart,
    href: "/admin/orders",
  },
  {
    title: "Users",
    icon: Users,
    href: "/admin/users",
  },
  {
    title: "Analytics",
    icon: BarChart3,
    href: "/admin/analytics",
    badge: null,
  },
  {
    title: "Reviews",
    icon: Star,
    href: "/admin/reviews",
  },
]

interface AdminSidebarProps {
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
  isMobileOpen: boolean
  setIsMobileOpen: (open: boolean) => void
}

export default function AdminSidebar({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
}: AdminSidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [isMobile, setIsMobile] = useState(false)

  // Check if screen is mobile
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024)
    }

    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  // Load collapsed state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem("admin-sidebar-collapsed")
    if (savedState !== null) {
      setIsCollapsed(JSON.parse(savedState))
    }
  }, [setIsCollapsed])

  // Save collapsed state to localStorage
  useEffect(() => {
    localStorage.setItem("admin-sidebar-collapsed", JSON.stringify(isCollapsed))
  }, [isCollapsed])

  const toggleExpanded = (title: string) => {
    if (isCollapsed) return // Don't expand submenus when sidebar is collapsed
    setExpandedItems((prev) => (prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]))
  }

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin"
    }
    return pathname.startsWith(href)
  }

  const handleLogout = () => {
    logout()
  }

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <TooltipProvider delayDuration={0}>
      <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="flex items-center justify-between">
            {(!isCollapsed || mobile) && (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-[#01A0EA] to-[#0190D4] rounded-lg flex items-center justify-center shadow-sm">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Admin Panel</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Management</p>
                </div>
              </div>
            )}

            {/* Toggle Button for Desktop */}
            {!mobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </Button>
            )}

            {/* Close Button for Mobile */}
            {mobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Collapsed State Icon Only */}
        {isCollapsed && !mobile && (
          <div className="p-3 flex justify-center border-b border-gray-200 dark:border-gray-700">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCollapsed(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Expand Sidebar</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}

        {/* User Info */}
        {(!isCollapsed || mobile) && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                <UserCheck className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.name || "Admin User"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email || "admin@example.com"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <ScrollArea className="flex-1 overflow-y-auto py-6 bg-filter-bg dark:bg-gray-800/20">
          <nav className="space-y-4 px-3">
            {/* Main Navigation */}
            <div className="space-y-2">
              {(!isCollapsed || mobile) && (
                <p className="px-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                  Main
                </p>
              )}
              <div className="space-y-1">
                {menuItems.map((item) => {
                  if (isCollapsed && !mobile) {
                    const Icon = item.icon
                    const isItemActive = isActive(item.href)
                    return (
                      <Tooltip key={item.href}>
                        <TooltipTrigger asChild>
                          <Link
                            href={item.href}
                            className={cn(
                              "relative flex items-center justify-center rounded-xl transition-all duration-300 group",
                              "w-10 h-10 mx-auto",
                              "hover:scale-110 active:scale-95",
                              isItemActive
                                ? "bg-[#01A0EA] text-white shadow-lg shadow-[#01A0EA]/25 scale-105"
                                : "text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 hover:text-[#01A0EA] dark:hover:text-[#01A0EA] hover:shadow-md",
                            )}
                          >
                            <Icon className="h-5 w-5 stroke-2 transition-all duration-200 group-hover:scale-110" />
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p>{item.title}</p>
                        </TooltipContent>
                      </Tooltip>
                    )
                  }

                  return (
                    <div key={item.title}>
                      {item.submenu ? (
                        <div>
                          <button
                            onClick={() => toggleExpanded(item.title)}
                            className={cn(
                              "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                              isActive(item.href)
                                ? "bg-[#01A0EA] text-white"
                                : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
                            )}
                          >
                            <div className="flex items-center space-x-3">
                              <item.icon className="w-5 h-5" />
                              <span>{item.title}</span>
                            </div>
                            {expandedItems.includes(item.title) ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                          {expandedItems.includes(item.title) && (
                            <div className="mt-1 ml-6 space-y-1">
                              {item.submenu.map((subItem) => (
                                <Link
                                  key={subItem.href}
                                  href={subItem.href}
                                  onClick={() => mobile && setIsMobileOpen(false)}
                                  className={cn(
                                    "block px-3 py-2 text-sm rounded-lg transition-colors",
                                    isActive(subItem.href)
                                      ? "bg-[#01A0EA] text-white"
                                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800",
                                  )}
                                >
                                  {subItem.title}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <Link
                          href={item.href}
                          onClick={() => mobile && setIsMobileOpen(false)}
                          className={cn(
                            "flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                            isActive(item.href)
                              ? "bg-[#01A0EA] text-white"
                              : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
                          )}
                        >
                          <div className="flex items-center space-x-3">
                            <item.icon className="w-5 h-5" />
                            <span>{item.title}</span>
                          </div>
                        </Link>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-filter-bg dark:bg-gray-800/50">
          <div className="space-y-2">
            {(!isCollapsed || mobile) && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-gray-700 dark:text-gray-300"
                  asChild
                >
                  <Link href="/">
                    <Home className="w-4 h-4 mr-2" />
                    View Site
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start text-gray-700 dark:text-gray-300">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Help & Support
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="w-full justify-start px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  Sign Out
                </Button>
              </>
            )}
            {isCollapsed && !mobile && (
              <div className="flex flex-col space-y-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                      asChild
                    >
                      <Link href="/">
                        <Home className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>View Site</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                    >
                      <HelpCircle className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Help & Support</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Sign Out</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex lg:flex-col lg:fixed lg:top-16 lg:bottom-0 lg:z-20 lg:bg-white lg:dark:bg-gray-900 transition-all duration-300 shadow-lg",
          isCollapsed ? "lg:w-16" : "lg:w-64",
        )}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetContent side="left" className="p-0 w-64 mt-16">
          <SidebarContent mobile />
        </SheetContent>
      </Sheet>
    </>
  )
}
