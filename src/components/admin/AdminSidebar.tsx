'use client'

import { useState } from 'react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import {
  LayoutDashboard,
  ShoppingBag,
  Settings,
  Package,
  Users,
  BarChart3,
  Globe,
  FileText,
  Navigation,
  Palette,
  Megaphone,
  ChevronDown,
  Store,
  MessageSquare,
  Percent,
  BookOpen,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const coreNav = [
  { href: "/admin", label: "Home", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: Package },
  { href: "/admin/products", label: "Products", icon: ShoppingBag },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/reviews", label: "Reviews", icon: MessageSquare },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
]

const onlineStoreNav = [
  { href: "/admin/theme", label: "Themes", icon: Palette },
  { href: "/admin/design/homepage", label: "Homepage", icon: LayoutDashboard },
  { href: "/admin/blog", label: "Blog Posts", icon: BookOpen },
  { href: "/admin/pages", label: "Pages", icon: FileText },
  { href: "/admin/navigation", label: "Navigation", icon: Navigation },
]

const marketingNav = [
  { href: "/admin/discount", label: "Discounts", icon: Percent },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [onlineStoreOpen, setOnlineStoreOpen] = useState(true)

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin"
    return pathname.startsWith(href)
  }

  const isOnlineStoreActive = onlineStoreNav.some(item => isActive(item.href))

  return (
    <Sidebar className="border-r border-border bg-gray-50">
      <SidebarHeader className="p-4 border-b border-border bg-white">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
            <Store className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-gray-900">SMPL</span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="bg-gray-50 px-2 py-4">
        {/* Core Navigation */}
        <SidebarGroup>
          <SidebarMenu className="space-y-0.5">
            {coreNav.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  className={cn(
                    "py-2 px-3 rounded-lg transition-colors",
                    isActive(item.href)
                      ? "bg-gray-900 text-white font-medium"
                      : "text-gray-800 hover:bg-gray-200 hover:text-gray-900"
                  )}
                >
                  <Link href={item.href}>
                    <item.icon className="w-4 h-4" />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {/* Sales Channels */}
        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="text-gray-400 text-[11px] uppercase tracking-wider font-medium px-3 mb-2">
            Sales Channels
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {/* Online Store - Collapsible */}
              <SidebarMenuItem>
                <button
                  onClick={() => setOnlineStoreOpen(!onlineStoreOpen)}
                  className={cn(
                    "flex items-center justify-between w-full py-2 px-3 rounded-lg transition-colors text-left",
                    isOnlineStoreActive
                      ? "bg-gray-200 text-gray-900"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    <span className="text-sm font-medium">Online Store</span>
                  </div>
                  <ChevronDown className={cn(
                    "w-4 h-4 transition-transform",
                    onlineStoreOpen ? "rotate-180" : ""
                  )} />
                </button>
              </SidebarMenuItem>

              {/* Online Store Sub-items */}
              {onlineStoreOpen && (
                <div className="ml-4 pl-2 border-l border-border space-y-0.5">
                  {onlineStoreNav.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        className={cn(
                          "py-1.5 px-3 rounded-lg transition-colors",
                          isActive(item.href)
                            ? "bg-gray-200 text-gray-900 font-medium"
                            : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                        )}
                      >
                        <Link href={item.href}>
                          <span className="text-sm">{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </div>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Marketing */}
        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="text-gray-400 text-[11px] uppercase tracking-wider font-medium px-3 mb-2">
            Marketing
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {marketingNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    className={cn(
                      "py-2 px-3 rounded-lg transition-colors",
                      isActive(item.href)
                        ? "bg-gray-200 text-gray-900 font-medium"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    <Link href={item.href}>
                      <item.icon className="w-4 h-4" />
                      <span className="text-sm">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Settings at Bottom */}
      <SidebarFooter className="border-t border-border p-2 bg-gray-50">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className={cn(
                "py-2 px-3 rounded-lg transition-colors",
                isActive("/admin/settings")
                  ? "bg-gray-200 text-gray-900 font-medium"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <Link href="/admin/settings">
                <Settings className="w-4 h-4" />
                <span className="text-sm">Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}


