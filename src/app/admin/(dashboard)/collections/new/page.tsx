import { CollectionForm } from "../collection-form";

export default function NewCollectionPage() {
    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div>
                <h1 className="text-xl font-semibold text-gray-900">Create Collection</h1>
                <p className="text-gray-500 text-sm">Add a new category to organize your catalog.</p>
            </div>
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-border">
                <CollectionForm />
            </div>
        </div>
    );
}

