"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Target, ShoppingBag } from "lucide-react"
import { useFormatCurrency } from "@/context/StoreConfigContext"

interface DashboardProgressProps {
    revenueCurrent: number
    ordersCurrent: number
}

// Mock goals
const REVENUE_GOAL = 50000
const ORDERS_GOAL = 500

/**
 * DashboardProgress - CSS Version
 */
export function DashboardProgress({ revenueCurrent, ordersCurrent }: DashboardProgressProps) {
    const formatCurrency = useFormatCurrency()

    const revenueProgress = Math.min((revenueCurrent / REVENUE_GOAL) * 100, 100)
    const ordersProgress = Math.min((ordersCurrent / ORDERS_GOAL) * 100, 100)

    return (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <Card className="bg-white border-border shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-gray-900 font-medium flex items-center gap-2 text-base">
                        <div className="p-1.5 bg-green-50 rounded-lg">
                            <Target className="w-4 h-4 text-green-600" />
                        </div>
                        Revenue Goal
                    </CardTitle>
                    <CardDescription className="text-gray-500 text-sm">
                        {formatCurrency(revenueCurrent)} / {formatCurrency(REVENUE_GOAL)}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-green-500 rounded-full transition-all duration-1000 ease-out-expo"
                                style={{ width: `${revenueProgress}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>0%</span>
                            <span className="text-green-600 font-medium">{Math.round(revenueProgress)}% Achieved</span>
                            <span>100%</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-white border-border shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-gray-900 font-medium flex items-center gap-2 text-base">
                        <div className="p-1.5 bg-blue-50 rounded-lg">
                            <ShoppingBag className="w-4 h-4 text-blue-600" />
                        </div>
                        Orders Goal
                    </CardTitle>
                    <CardDescription className="text-gray-500 text-sm">
                        {ordersCurrent} / {ORDERS_GOAL} orders
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out-expo delay-300"
                                style={{ width: `${ordersProgress}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>0%</span>
                            <span className="text-blue-600 font-medium">{Math.round(ordersProgress)}% Achieved</span>
                            <span>100%</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
