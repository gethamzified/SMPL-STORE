import { requireAuth } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { FadeInView } from '@/components/animations/FadeInView';
import AccountSettings from '@/components/account/AccountSettings';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
    const user = await requireAuth();
    const supabase = await createAdminClient();

    // Fetch Full Profile
    const { data: profile } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user.id)
        .single();

    return (
        <FadeInView>
            <div className="mb-8 border-b border-neutral-100 pb-8">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 mb-2">Settings</p>
                <h1 className="text-3xl font-bold text-black tracking-tight">
                    Profile & Application
                </h1>
                <p className="text-neutral-600 font-medium text-sm mt-2 max-w-md">
                    Manage your personal information and shipping details.
                </p>
            </div>

            <AccountSettings
                user={user}
                profile={profile}
            />
        </FadeInView>
    );
}
