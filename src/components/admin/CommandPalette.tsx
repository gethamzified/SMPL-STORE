"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command"
import {
    LayoutDashboard,
    ShoppingBag,
    Package,
    Users,
    Settings,
    FileText,
    Navigation,
    Palette,
    Plus,
    Search,
    ArrowRight,
} from "lucide-react"

interface CommandPaletteProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

// Quick action items for the command palette
const navigationItems = [
    {
        group: "Navigation",
        items: [
            { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
            { label: "Products", href: "/admin/products", icon: ShoppingBag },
            { label: "Collections", href: "/admin/collections", icon: Package },
            { label: "Orders", href: "/admin/orders", icon: FileText },
            { label: "Customers", href: "/admin/customers", icon: Users },
            { label: "Navigation", href: "/admin/navigation", icon: Navigation },
            { label: "Branding & Theme", href: "/admin/theme", icon: Palette },
            { label: "Settings", href: "/admin/settings", icon: Settings },
        ],
    },
    {
        group: "Quick Actions",
        items: [
            { label: "Add New Product", href: "/admin/products/new", icon: Plus },
            { label: "Create Collection", href: "/admin/collections/new", icon: Plus },
            { label: "Return to Store", href: "/", icon: ArrowRight },
        ],
    },
]

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
    const router = useRouter()
    const [internalOpen, setInternalOpen] = React.useState(false)

    // Use controlled or uncontrolled state
    const isOpen = open !== undefined ? open : internalOpen
    const setIsOpen = onOpenChange || setInternalOpen

    // Handle keyboard shortcut
    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
                e.preventDefault()
                setIsOpen(!isOpen)
            }
        }

        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [isOpen, setIsOpen])

    const handleSelect = (href: string) => {
        setIsOpen(false)
        router.push(href)
    }

    return (
        <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
            <CommandInput
                placeholder="Type a command or search..."
                className="border-0"
            />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                {navigationItems.map((group, index) => (
                    <React.Fragment key={group.group}>
                        <CommandGroup heading={group.group}>
                            {group.items.map((item) => (
                                <CommandItem
                                    key={item.href}
                                    value={item.label}
                                    onSelect={() => handleSelect(item.href)}
                                    className="cursor-pointer"
                                >
                                    <item.icon className="mr-2 h-4 w-4 text-white/50" />
                                    <span>{item.label}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                        {index < navigationItems.length - 1 && <CommandSeparator />}
                    </React.Fragment>
                ))}
            </CommandList>
        </CommandDialog>
    )
}

// Hook to trigger command palette from anywhere
export function useCommandPalette() {
    const [open, setOpen] = React.useState(false)

    const toggle = React.useCallback(() => {
        setOpen((prev) => !prev)
    }, [])

    return { open, setOpen, toggle }
}

