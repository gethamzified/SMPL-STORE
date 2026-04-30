import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert"
import { AlertCircle, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Product } from "@/lib/types"

export function LowStockAlert({ products }: { products: Product[] }) {
    if (!products || products.length === 0) return null;

    return (
        <Alert variant="default" className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800 font-medium text-sm mb-2">Inventory Alert</AlertTitle>
            <AlertDescription className="text-red-700">
                <p className="mb-3 text-sm">{products.length} products are running low on inventory.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {products.slice(0, 3).map(p => (
                        <div key={p.id} className="flex justify-between items-center bg-red-100 p-2 rounded-lg border border-red-200">
                            <span className="truncate text-sm text-red-800">{p.title}</span>
                            <span className="text-xs font-medium text-red-500">Low Stock</span>
                        </div>
                    ))}
                </div>
                <div className="mt-4">
                    <Link href="/admin/products?sort=stock_asc" className="text-sm font-medium text-red-700 flex items-center gap-1 hover:text-red-900 transition-colors">
                        View all items <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>
            </AlertDescription>
        </Alert>
    )
}


