import { createAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Edit, Trash2, FileText, Globe } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createPage, deletePage } from "./actions";

export default async function PagesPage() {
  const supabase = await createAdminClient();
  const { data: pages } = await supabase.from("pages").select("*").order('created_at', { ascending: false });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Content Manager</h1>
          <p className="text-gray-500 text-sm">Build and manage custom layouts for your storefront.</p>
        </div>
        <form action={createPage}>
          <Button type="submit" className="bg-gray-900 text-white hover:bg-gray-800 rounded-lg px-4 h-10 font-medium">
            <Plus className="mr-2 h-4 w-4" /> Create New Page
          </Button>
        </form>
      </div>

      <div className="border border-border rounded-xl bg-white overflow-hidden shadow-sm overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow className="border-gray-100 hover:bg-transparent">
              <TableHead className="text-gray-500 font-medium px-6 py-4 w-[400px]">Page Title</TableHead>
              <TableHead className="text-gray-500 font-medium px-4">URL Slug</TableHead>
              <TableHead className="text-gray-500 font-medium px-4 text-center">Status</TableHead>
              <TableHead className="text-gray-500 font-medium px-6 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pages && pages.length > 0 ? (
              pages.map((page) => (
                <TableRow key={page.id} className="border-gray-50 hover:bg-gray-50 transition-colors">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg border border-border flex items-center justify-center text-gray-500">
                        <FileText className="w-5 h-5" />
                      </div>
                      <span className="font-medium text-gray-900">{page.title}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 text-gray-600 font-mono text-sm">/{page.slug}</TableCell>
                  <TableCell className="px-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${page.is_published ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {page.is_published ? 'Live' : 'Draft'}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" asChild className="hover:bg-gray-100 text-gray-500 hover:text-gray-900 rounded-lg">
                        <Link href={`/admin/pages/${page.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      {page.is_published && (
                        <Button variant="ghost" size="icon" asChild className="hover:text-emerald-600 hover:bg-emerald-50 text-gray-500 rounded-lg">
                          <Link href={`/${page.slug}`} target="_blank">
                            <Globe className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                      <form action={async () => {
                        'use server';
                        await deletePage(page.id);
                      }}>
                        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-48 text-center text-gray-500 text-sm">
                  No custom pages created yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

