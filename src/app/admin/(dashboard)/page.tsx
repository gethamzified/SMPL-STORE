import { StatsService } from "@/services/stats";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Overview } from "@/components/admin/dashboard/Overview";
import { RecentSales } from "@/components/admin/dashboard/RecentSales";
import { LowStockAlert } from "@/components/admin/dashboard/LowStockAlert";
import { DashboardProgress } from "@/components/admin/dashboard/DashboardProgress";
import { Package, DollarSign, ShoppingBag, Activity } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { StoreConfigService } from "@/services/config";

export default async function AdminDashboard() {
  // Parallel Data Fetching
  const [stats, monthlyRevenue, recentSales, lowStockProducts, storeConfig] = await Promise.all([
    StatsService.getDashboardStats(),
    StatsService.getMonthlyRevenue(),
    StatsService.getRecentSales(),
    StatsService.getLowStockProducts(),
    StoreConfigService.getStoreConfig()
  ]);

  return (
    <div className="space-y-6 pb-10 max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Home
          </h1>
          <p className="text-gray-500 text-sm">
            Welcome back. Here's what's happening with your store.
          </p>
        </div>

        {lowStockProducts.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg w-fit">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="text-xs font-medium text-red-600">Action Required</span>
          </div>
        )}
      </div>

      {/* Primary Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Total Revenue",
            value: formatCurrency(stats.totalRevenue, storeConfig.currency),
            change: stats.revenueChange,
            icon: DollarSign,
            iconBg: "bg-green-50",
            iconColor: "text-green-600"
          },
          {
            title: "Orders",
            value: `${stats.totalOrders}`,
            change: stats.ordersChange,
            icon: ShoppingBag,
            iconBg: "bg-blue-50",
            iconColor: "text-blue-600"
          },
          {
            title: "Active Products",
            value: stats.activeProducts,
            sub: `out of ${stats.totalProducts}`,
            icon: Package,
            iconBg: "bg-purple-50",
            iconColor: "text-purple-600"
          },
          {
            title: "Low Stock",
            value: stats.lowStockCount,
            sub: "Items need restocking",
            icon: Activity,
            iconBg: "bg-orange-50",
            iconColor: "text-orange-600"
          },
        ].map((stat, i) => (
          <Card key={i} className="bg-white border-border shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.iconBg}`}>
                <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
              {stat.change !== undefined ? (
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <span className={`${stat.change > 0 ? "text-green-600" : "text-red-600"} font-medium`}>
                    {stat.change > 0 ? "+" : ""}{stat.change}%
                  </span>
                  <span>from last month</span>
                </p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">{stat.sub}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 lg:grid-cols-7">

        {/* Left Column (Charts) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Revenue Overview */}
          <Card className="bg-white border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900 font-medium">Revenue Trend</CardTitle>
              <CardDescription className="text-gray-500 text-sm">Monthly performance over time</CardDescription>
            </CardHeader>
            <CardContent className="pl-0">
              <Overview data={monthlyRevenue} />
            </CardContent>
          </Card>

          {/* Progress Tracking */}
          <DashboardProgress
            revenueCurrent={stats.totalRevenue}
            ordersCurrent={stats.totalOrders}
          />
        </div>

        {/* Right Column (Lists) */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="bg-white border-border shadow-sm h-full">
            <CardHeader>
              <CardTitle className="text-gray-900 font-medium">Recent Sales</CardTitle>
              <CardDescription className="text-gray-500 text-sm">Latest transactions from your store</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentSales sales={recentSales} />
            </CardContent>
          </Card>
        </div>
      </div>

      <LowStockAlert products={lowStockProducts} />
    </div>
  );
}


