import { Suspense } from "react";
import { AnalyticsDashboard } from "@/components/admin/analytics/AnalyticsDashboard";
import { TableSkeleton } from "@/components/admin/ui/TableSkeleton";

export default function AnalyticsPage() {
    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div>
                <h1 className="text-xl font-semibold text-gray-900">Analytics</h1>
                <p className="text-sm text-gray-500 mt-1">Overview of your store performance</p>
            </div>
            <Suspense fallback={<TableSkeleton rows={4} />}>
                <AnalyticsDashboard />
            </Suspense>
        </div>
    );
}

