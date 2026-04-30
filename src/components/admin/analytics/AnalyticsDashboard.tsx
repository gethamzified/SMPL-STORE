"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Users, ShoppingBag, TrendingUp } from "lucide-react"

export function AnalyticsDashboard() {
    return (
        <div className="space-y-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-white border-border shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">
                            Total Revenue
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">$45,231.89</div>
                        <p className="text-xs text-gray-500">
                            +20.1% from last month
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-white border-border shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">
                            Subscriptions
                        </CardTitle>
                        <Users className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">+2350</div>
                        <p className="text-xs text-gray-500">
                            +180.1% from last month
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-white border-border shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">
                            Sales
                        </CardTitle>
                        <ShoppingBag className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">+12,234</div>
                        <p className="text-xs text-gray-500">
                            +19% from last month
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-white border-border shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">
                            Active Now
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">+573</div>
                        <p className="text-xs text-gray-500">
                            +201 since last hour
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 bg-white border-border shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-gray-900">Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[200px] flex items-center justify-center text-gray-400">
                            Chart Placeholder
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3 bg-white border-border shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-gray-900">Recent Sales</CardTitle>
                        <p className="text-sm text-gray-500">
                            You made 265 sales this month.
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            <div className="flex items-center">
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none text-gray-900">
                                        Olivia Martin
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        olivia.martin@email.com
                                    </p>
                                </div>
                                <div className="ml-auto font-medium text-gray-900">+$1,999.00</div>
                            </div>
                            <div className="flex items-center">
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none text-gray-900">
                                        Jackson Lee
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        jackson.lee@email.com
                                    </p>
                                </div>
                                <div className="ml-auto font-medium text-gray-900">+$39.00</div>
                            </div>
                            <div className="flex items-center">
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none text-gray-900">
                                        Isabella Nguyen
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        isabella.nguyen@email.com
                                    </p>
                                </div>
                                <div className="ml-auto font-medium text-gray-900">+$299.00</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

