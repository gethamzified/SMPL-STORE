import { createAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import { Users, Mail, ShoppingBag } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { StoreConfigService } from "@/services/config";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function CustomersPage() {
  const supabase = await createAdminClient();
  const [{ data: customers }, storeConfig] = await Promise.all([
    supabase.from("customers").select("*").order('created_at', { ascending: false }),
    StoreConfigService.getStoreConfig()
  ]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Customers</h1>
          <p className="text-gray-500 text-sm">View and manage your customer base.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
              <Users className="w-6 h-6 text-gray-500" />
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider">Total Customers</p>
              <p className="text-2xl font-semibold text-gray-900">{customers?.length || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="border border-border rounded-xl bg-white overflow-hidden shadow-sm overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow className="border-gray-100 hover:bg-transparent">
              <TableHead className="text-gray-500 font-medium px-6 py-4">Customer</TableHead>
              <TableHead className="text-gray-500 font-medium px-4">Email</TableHead>
              <TableHead className="text-gray-500 font-medium px-4 text-center">Orders</TableHead>
              <TableHead className="text-gray-500 font-medium px-4 text-right">Total Spent</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers && customers.length > 0 ? (
              customers.map((customer) => (
                <TableRow key={customer.id} className="border-gray-50 hover:bg-gray-50 transition-colors">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-50 rounded-full border border-border flex items-center justify-center text-gray-500 uppercase font-medium">
                        {customer.first_name?.[0] || customer.email?.[0] || '?'}
                      </div>
                      <span className="font-medium text-gray-900">
                        {customer.first_name && customer.last_name
                          ? `${customer.first_name} ${customer.last_name}`
                          : customer.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 text-gray-600 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      {customer.email}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 text-center">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      {customer.total_orders || 0}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 text-right font-mono text-gray-900">
                    {formatCurrency(customer.total_spent || 0, storeConfig.currency)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-48 text-center text-gray-400 text-sm">
                  No customers yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

