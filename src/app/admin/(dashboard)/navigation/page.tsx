import { createAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Edit, Trash2, Menu } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createMenu, deleteMenu } from "./actions";

export default async function NavigationPage() {
  const supabase = await createAdminClient();
  const { data: menus } = await supabase.from("navigation_menus").select("*").order('created_at', { ascending: false });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Navigation</h1>
          <p className="text-gray-500 text-sm">Manage website menus and link structures.</p>
        </div>
        <form action={createMenu}>
          <Button type="submit" className="bg-gray-900 text-white hover:bg-gray-800 rounded-lg px-4 h-10 font-medium">
            <Plus className="mr-2 h-4 w-4" /> Add Menu
          </Button>
        </form>
      </div>

      <div className="border border-border rounded-xl bg-white overflow-hidden shadow-sm overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow className="border-gray-100 hover:bg-transparent">
              <TableHead className="text-gray-500 font-medium px-6 py-4 w-[400px]">Menu Title</TableHead>
              <TableHead className="text-gray-500 font-medium px-4">Handle</TableHead>
              <TableHead className="text-gray-500 font-medium px-4 text-center">Items</TableHead>
              <TableHead className="text-gray-500 font-medium px-6 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {menus && menus.length > 0 ? (
              menus.map((menu) => (
                <TableRow key={menu.id} className="border-gray-50 hover:bg-gray-50 transition-colors">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-50 rounded-lg border border-border flex items-center justify-center text-gray-500">
                        <Menu className="w-5 h-5" />
                      </div>
                      <span className="font-medium text-gray-900">{menu.title}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 text-gray-600 font-mono text-sm">{menu.handle}</TableCell>
                  <TableCell className="px-4 text-center text-gray-500">
                    {Array.isArray(menu.items) ? menu.items.length : 0} Links
                  </TableCell>
                  <TableCell className="px-6 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" asChild className="hover:bg-gray-100 text-gray-500 hover:text-gray-900 rounded-lg">
                        <Link href={`/admin/navigation/${menu.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <form action={async () => {
                        'use server';
                        await deleteMenu(menu.id);
                      }}>
                        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-48 text-center text-gray-400 text-sm">
                  No menus defined.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

