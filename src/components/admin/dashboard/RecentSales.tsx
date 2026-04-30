"use client";

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import { useFormatCurrency } from "@/context/StoreConfigContext"

type RecentSaleProps = {
    sales: {
        id: string;
        amount: number;
        customerName: string;
        customerEmail: string;
        avatarUrl?: string;
    }[]
}

export function RecentSales({ sales }: RecentSaleProps) {
    const formatCurrency = useFormatCurrency();
    return (
        <div className="space-y-4">
            {sales.length === 0 && <p className="text-sm text-gray-500">No sales yet.</p>}

            {sales.map((sale) => (
                <div key={sale.id} className="flex items-center p-2 rounded-lg hover:bg-gray-50 transition-colors group">
                    <Avatar className="h-9 w-9 border border-gray-100">
                        <AvatarImage src={sale.avatarUrl || "/avatars/01.png"} alt="Avatar" />
                        <AvatarFallback className="bg-gray-100 text-gray-600">{sale.customerName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none text-gray-900">{sale.customerName}</p>
                        <p className="text-xs text-gray-500">
                            {sale.customerEmail}
                        </p>
                    </div>
                    <div className="ml-auto text-sm font-medium text-gray-900">
                        +{formatCurrency(sale.amount)}
                    </div>
                </div>
            ))}
        </div>
    )
}


