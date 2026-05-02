import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { CommandPalette } from "@/components/admin/CommandPalette"
import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs"
import Link from "next/link"
import { ExternalLink, Search, Bell } from "lucide-react"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin Dashboard | SMPL",
  robots: {
    index: false,
    follow: false,
  }
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-panel">
      <SidebarProvider>
        <AdminSidebar />
        <main className="w-full bg-[#F6F6F7] text-gray-900 min-h-screen font-sans">
          {/* Top Bar */}
          <div className="flex items-center gap-4 px-4 py-3 border-b border-border bg-white sticky top-0 z-50">
            <SidebarTrigger className="text-gray-900 hover:bg-gray-100 rounded-lg" />
            <div className="h-5 w-px bg-gray-200 hidden sm:block" />

            {/* Breadcrumbs */}
            <div className="flex-1 min-w-0">
              <AdminBreadcrumbs />
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors min-w-[280px] border border-input">
              <Search className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-900 flex-1">Search...</span>
              <kbd className="pointer-events-none h-5 select-none items-center gap-1 rounded border border-input bg-white px-1.5 font-mono text-[10px] font-medium text-gray-900 hidden lg:inline-flex">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <Link
                href="/"
                target="_blank"
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="hidden sm:inline">View Store</span>
              </Link>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-3 sm:p-4 md:p-6">
            {children}
          </div>
          <CommandPalette />
        </main>
      </SidebarProvider>
    </div>
  )
}


