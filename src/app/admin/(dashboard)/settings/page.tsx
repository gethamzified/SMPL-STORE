import { StoreConfigService } from '@/services/config';
import { StoreConfigForm } from '@/components/admin/settings/StoreConfigForm';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

export const metadata = {
    title: 'Store Settings | SMPL Admin',
};

export default async function SettingsPage() {
    const config = await StoreConfigService.getStoreConfig();

    return (
        <div className="flex-1 space-y-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
                    <p className="text-sm text-gray-500 mt-1">Configure your store appearance and behavior</p>
                </div>
                <Link
                    href="/"
                    target="_blank"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white hover:bg-gray-50 border border-border text-gray-700 rounded-lg transition-colors"
                >
                    <ExternalLink className="w-4 h-4" />
                    Preview Changes
                </Link>
            </div>
            <StoreConfigForm initialConfig={config} />
        </div>
    );
}

