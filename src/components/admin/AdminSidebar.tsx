'use client'

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
  MessageSquare,
  Percent,
  BookOpen,
  FileText,
  Navigation,
  Store,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const coreNav = [
  { href: "/admin", label: "Home", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: Package },
  { href: "/admin/products", label: "Products", icon: ShoppingBag },
  { href: "/admin/customers", label: "Customers", icon: Users },
]

const storeNav = [
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/reviews", label: "Reviews", icon: MessageSquare },
  { href: "/admin/blog", label: "Blog", icon: BookOpen },
  { href: "/admin/pages", label: "Pages", icon: FileText },
  { href: "/admin/navigation", label: "Navigation", icon: Navigation },
  { href: "/admin/discount", label: "Discounts", icon: Percent },
]

export function AdminSidebar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin"
    return pathname.startsWith(href)
  }

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
        {/* Core */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-400 text-[11px] uppercase tracking-wider font-medium px-3 mb-2">
            Core
          </SidebarGroupLabel>
          <SidebarGroupContent>
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
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Store */}
        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="text-gray-400 text-[11px] uppercase tracking-wider font-medium px-3 mb-2">
            Store
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {storeNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    className={cn(
                      "py-2 px-3 rounded-lg transition-colors",
                      isActive(item.href)
                        ? "bg-gray-900 text-white font-medium"
                        : "text-gray-600 hover:bg-gray-200 hover:text-gray-900"
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

      <SidebarFooter className="border-t border-border p-3 bg-gray-50">
        <p className="text-[10px] text-gray-400 text-center">SMPL Admin v1.0</p>
      </SidebarFooter>
    </Sidebar>
  )
}
