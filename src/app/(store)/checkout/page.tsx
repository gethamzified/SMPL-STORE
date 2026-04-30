import { getAuthUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { StoreConfigService } from "@/services/config";

import CheckoutWizard from "@/components/checkout/CheckoutWizard";
export const dynamic = "force-dynamic";
export default async function CheckoutPage() {
  const user = await getAuthUser();
  const supabase = await createAdminClient();
  const storeConfig = await StoreConfigService.getStoreConfig();

  let customerProfile = user?.customer_data || null;

  return (
    <main className="min-h-screen bg-background">
      <CheckoutWizard
        user={user}
        customer={customerProfile}
        savedAddress={customerProfile ? {
          first_name: customerProfile.first_name,
          last_name: customerProfile.last_name,
          address1: customerProfile.address1,
          city: customerProfile.city,
          zip: customerProfile.zip,
          country: customerProfile.country,
          phone: customerProfile.phone
        } : null}
        deliveryConfig={storeConfig.delivery}
      />

    </main>
  );
}
