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
import { deleteMenu } from "../../navigation/actions";

// Reusing the same actions from the existing navigation folder if compatible, 
// or I will create new ones. For now, assuming I can reuse or will move them.
// Actually, I should probably use the existing /admin/navigation page as a base 
// and just enhance it, rather than creating a duplicate at /admin/design/navigation.
// The user asked for /admin/design/navigation, but I already found /admin/navigation exists.
// I will REDIRECT /admin/design/navigation to /admin/navigation or just update /admin/navigation?
// The user report said: "Required Admin Features: Navigation Manager (/admin/design/navigation)".
// I will implement it there to follow the spec, but I might just reuse the logic.

export default async function NavigationDesignPage() {
    // Determine if I should just redirect or render the same thing. 
    // Let's render the same list for now but with "Design" context if needed.
    // Actually, let's keep it simple. I will just update the EXISTING /admin/navigation page 
    // to be the full manager, and maybe add a redirect or just link to it.

    // STARTING WITH NEW FILE as requested.
    const supabase = await createAdminClient();
    const { data: menus } = await supabase.from("navigation_menus").select("*").order('title');

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">Navigation Menus</h1>
                    <p className="text-gray-500 text-sm">Manage the structure of your menus.</p>
                </div>
                <Button className="bg-gray-900 text-white hover:bg-gray-800 rounded-lg px-4 h-10 font-medium">
                    <Plus className="mr-2 h-4 w-4" /> Create Menu
                </Button>
            </div>

            <div className="border border-border rounded-xl bg-white overflow-hidden shadow-sm overflow-x-auto">
                <Table>
                    <TableHeader className="bg-gray-50/50">
                        <TableRow className="border-gray-100 hover:bg-transparent">
                            <TableHead className="text-gray-500 font-medium px-6 py-4">Title</TableHead>
                            <TableHead className="text-gray-500 font-medium px-4">Handle</TableHead>
                            <TableHead className="text-gray-500 font-medium px-4 text-center">Items</TableHead>
                            <TableHead className="text-gray-500 font-medium px-6 text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {menus?.map(menu => (
                            <TableRow key={menu.id} className="border-gray-50 hover:bg-gray-50">
                                <TableCell className="px-6 py-4 font-medium text-gray-900">{menu.title}</TableCell>
                                <TableCell className="px-4 text-gray-500 font-mono text-sm">{menu.handle}</TableCell>
                                <TableCell className="px-4 text-center text-gray-500">{Array.isArray(menu.items) ? menu.items.length : 0}</TableCell>
                                <TableCell className="px-6 text-right">
                                    <Button variant="ghost" size="sm" asChild className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                                        <Link href={`/admin/navigation/${menu.id}`}>Edit</Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

