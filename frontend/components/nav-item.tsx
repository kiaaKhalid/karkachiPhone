"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface NavItemProps {
  href: string
  title: string
  icon: LucideIcon
  badge?: string | null
  onClick?: () => void
}

export default function NavItem({ href, title, icon: Icon, badge, onClick }: NavItemProps) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group",
        isActive
          ? "bg-[#01A0EA] text-white shadow-sm"
          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white",
      )}
    >
      <div className="flex items-center space-x-3">
        <Icon className="h-6 w-6 flex-shrink-0" />
        <span className="truncate">{title}</span>
      </div>
      {badge && (
        <Badge
          variant={isActive ? "secondary" : "outline"}
          className={cn(
            "text-xs font-medium px-2 py-0.5",
            isActive
              ? "bg-white/20 text-white border-white/30"
              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
          )}
        >
          {badge}
        </Badge>
      )}
    </Link>
  )
}
