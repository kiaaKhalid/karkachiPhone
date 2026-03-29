"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Grid, Heart, User, Plus, X, ShoppingBag, Info, ShieldCheck, Mail, Shield } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"

export default function BottomNavbar() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const { isAuthenticated, user } = useAuth()

  const tabs = [
    { label: "Accueil", icon: Home, href: "/" },
    { label: "Catalogue", icon: Grid, href: "/products" },
    { label: "Plus", icon: Plus, onClick: () => setMenuOpen(!menuOpen), isAction: true },
    { label: "Favoris", icon: Heart, href: "/wishlist" },
    { label: "Profil", icon: User, href: isAuthenticated ? "/dashboard/profile" : "/auth/login" },
  ]

  const extraLinks = [
    { label: "À Propos", icon: Info, href: "/about" },
    { label: "Services", icon: ShieldCheck, href: "/services" },
    { label: "Commandes", icon: ShoppingBag, href: "/orders" },
    { label: "Contact", icon: Mail, href: "/contact" },
  ]

  const adminLinks = user?.role === "admin" || user?.role === "super_admin" ? [
    { label: "Admin Panel", icon: ShieldCheck, href: "/admin" }
  ] : []

  const allLinks = isAuthenticated 
    ? [...extraLinks, ...adminLinks] 
    : extraLinks

  return (
    <>
      {/* Absolute Modal Sheet Popover on bottom action */}
      {menuOpen && (
        <div className="fixed inset-0 z-[998] bg-black/40 backdrop-blur-sm md:hidden animate-fade-in" onClick={() => setMenuOpen(false)}>
          <div 
            className="absolute bottom-20 left-4 right-4 bg-background/95 backdrop-blur-md rounded-3xl border border-border/60 p-5 shadow-2xl animate-slide-up space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b pb-2 border-border/30">
              <span className="font-bold text-base text-foreground">Plus de pages</span>
              <button onClick={() => setMenuOpen(false)} className="p-1 rounded-full bg-secondary/80 text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {allLinks.map((link) => {
                const Icon = link.icon
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary border border-transparent hover:border-border/40 transition-all"
                  >
                    <div className="p-2 rounded-lg bg-accent/10 text-accent">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{link.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 z-[999] bg-background/95 backdrop-blur-md border-t border-border/60 md:hidden flex items-center justify-around px-2 h-16 pb-safe shadow-[0_-4px_12px_rgba(0,0,0,0.03)] dark:shadow-[0_-4px_12px_rgba(0,0,0,0.2)]">
        {tabs.map((tab: any) => {
          const Icon = tab.icon
          const isActive = !tab.isAction && pathname === tab.href

          const content = (
            <div className="flex flex-col items-center justify-center flex-1 h-full relative group">
              <div className={`p-1.5 rounded-xl transition-all duration-200 ${
                isActive || (tab.isAction && menuOpen)
                  ? "bg-accent/10 text-accent" 
                  : "text-muted-foreground group-hover:text-foreground"
              } ${tab.isAction ? "bg-accent text-white scale-110 shadow-lg shadow-accent/20" : ""}`}>
                <Icon className={`w-5 h-5 ${tab.isAction && !menuOpen ? "text-white" : ""}`} />
              </div>
              <span className={`text-[10px] font-medium mt-0.5 ${
                isActive ? "text-accent font-semibold" : "text-muted-foreground"
              }`}>
                {tab.label}
              </span>

              {isActive && (
                <span className="absolute top-1 right-1/2 translate-x-3 w-1.5 h-1.5 rounded-full bg-accent" />
              )}
            </div>
          )

          return tab.isAction ? (
            <button key={tab.label} onClick={tab.onClick} className="flex flex-col items-center justify-center flex-1 h-full relative">
              {content}
            </button>
          ) : (
            <Link key={tab.href} href={tab.href} className="flex flex-col items-center justify-center flex-1 h-full relative">
              {content}
            </Link>
          )
        })}
      </div>
    </>
  )
}
