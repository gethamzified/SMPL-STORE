import { createAdminClient } from "@/lib/supabase/admin";
import { CollectionForm } from "../collection-form";
import { notFound } from "next/navigation";

export default async function EditCollectionPage({ params }: { params: { id: string } }) {
    // Need to await params in Next.js 15+, but let's check version. 
    // Assuming Next.js 15+ convention where params is a Promise, but in 14 it's just an object depending on configuration.
    // Safest is to await it if it's a promise, but TS might complain if it isn't.
    // In strict Next.js 15, `params` is a promise.
    const { id } = await params;

    const supabase = await createAdminClient();
    const { data: collection } = await supabase.from('collections').select('*').eq('id', id).maybeSingle();

    if (!collection) {
        notFound();
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div>
                <h1 className="text-xl font-semibold text-gray-900">Edit Collection</h1>
                <p className="text-gray-500 text-sm">Update collection details and visibility.</p>
            </div>
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-border">
                <CollectionForm initialData={collection} />
            </div>
        </div>
    );
}
