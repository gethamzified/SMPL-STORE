'use client'

import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

const routeLabels: Record<string, string> = {
    admin: "Dashboard",
    products: "Products",
    collections: "Collections",
    orders: "Orders",
    theme: "Theme",
    navigation: "Navigation",
    pages: "Pages",
    customers: "Customers",
    settings: "Settings",
    discount: "Discount",
    design: "Design",
    homepage: "Homepage",
    new: "New",
}

export function AdminBreadcrumbs() {
    const pathname = usePathname()
    const segments = pathname.split('/').filter(Boolean)

    // Build breadcrumb items
    const breadcrumbs = segments.map((segment, index) => {
        const href = '/' + segments.slice(0, index + 1).join('/')
        const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
        const isLast = index === segments.length - 1
        const isId = /^[a-f0-9-]{20,}$/i.test(segment) // UUID-like

        return { href, label: isId ? 'Edit' : label, isLast }
    })

    // Skip if we're on root admin
    if (breadcrumbs.length <= 1) return null

    return (
        <nav className="flex items-center gap-1 text-sm">
            {breadcrumbs.map((crumb, i) => (
                <div key={crumb.href} className="flex items-center gap-1">
                    {i > 0 && <ChevronRight className="w-3 h-3 text-gray-300" />}
                    {crumb.isLast ? (
                        <span className="text-gray-900 font-medium">{crumb.label}</span>
                    ) : (
                        <Link
                            href={crumb.href}
                            className={cn(
                                "text-gray-500 hover:text-gray-700 transition-colors",
                                i === 0 && "hidden sm:inline" // Hide "Dashboard" on mobile
                            )}
                        >
                            {crumb.label}
                        </Link>
                    )}
                </div>
            ))}
        </nav>
    )
}

