import { StoreConfigService } from '@/services/config';
import { DiscountForm } from './discount-form';

export const metadata = {
    title: 'Global Discount | SMPL Admin',
};

export default async function DiscountPage() {
    const config = await StoreConfigService.getStoreConfig();

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div>
                <h1 className="text-xl font-semibold text-gray-900">
                    Discounts
                </h1>
                <p className="text-gray-500 text-sm font-light tracking-wide">
                    Configure a popup discount offer for your visitors.
                </p>
            </div>

            <DiscountForm initialConfig={config.globalDiscount} />
        </div>
    );
}

