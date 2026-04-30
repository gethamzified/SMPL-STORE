'use client';

import { useState } from 'react';
import { updateProfile } from '@/app/(store)/account/actions';
import { useRouter } from 'next/navigation';
import { User, MapPin, Check, Save } from 'lucide-react';

type Props = {
    user: any;
    profile: any;
};

export default function AccountSettings({ user, profile }: Props) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const router = useRouter();

    async function handleUpdate(formData: FormData) {
        setLoading(true);
        const res = await updateProfile(formData);
        setLoading(false);
        if (res.error) setMessage(res.error);
        else {
            setMessage('Profile updated successfully');
            router.refresh();
            // Clear message after 3 seconds
            setTimeout(() => setMessage(''), 3000);
        }
    }

    return (
        <div className="space-y-8">
            <form action={handleUpdate} className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">

                {/* Personal Profile Card */}
                <section className="bg-white border border-neutral-100 rounded-[2rem] p-8 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4 mb-8 pb-6 border-b border-neutral-50">
                        <div className="w-12 h-12 bg-neutral-50 rounded-full flex items-center justify-center border border-neutral-100">
                            <User className="w-5 h-5 text-black" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-black tracking-tight">Personal Profile</h3>
                            <p className="text-neutral-500 text-xs font-medium uppercase tracking-wide">Contact Details</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-black mb-2 ml-1">First Name</label>
                                <input
                                    name="first_name"
                                    defaultValue={profile?.first_name || ''}
                                    placeholder="Enter your first name"
                                    className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3.5 text-sm font-medium focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-neutral-300"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-black mb-2 ml-1">Last Name</label>
                                <input
                                    name="last_name"
                                    defaultValue={profile?.last_name || ''}
                                    placeholder="Enter your last name"
                                    className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3.5 text-sm font-medium focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-neutral-300"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2 ml-1">Email <span className="text-[10px] normal-case tracking-normal">(Read Only)</span></label>
                            <input
                                disabled
                                value={user.email}
                                className="w-full bg-neutral-50 border border-neutral-100 rounded-xl px-4 py-3.5 text-sm text-neutral-500 font-medium cursor-not-allowed"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-black mb-2 ml-1">Phone Number</label>
                            <input
                                name="phone"
                                defaultValue={profile?.phone || ''}
                                placeholder="+1 (555) 000-0000"
                                className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3.5 text-sm font-medium focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-neutral-300"
                            />
                        </div>
                    </div>
                </section>

                {/* Shipping Address Card */}
                <section className="bg-white border border-neutral-100 rounded-[2rem] p-8 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4 mb-8 pb-6 border-b border-neutral-50">
                        <div className="w-12 h-12 bg-neutral-50 rounded-full flex items-center justify-center border border-neutral-100">
                            <MapPin className="w-5 h-5 text-black" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-black tracking-tight">Shipping Address</h3>
                            <p className="text-neutral-500 text-xs font-medium uppercase tracking-wide">For Deliveries</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-black mb-2 ml-1">Address Line 1</label>
                            <input
                                name="address1"
                                defaultValue={profile?.address1 || ''}
                                placeholder="Street address, P.O. box, etc."
                                className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3.5 text-sm font-medium focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-neutral-300"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2 ml-1">Address Line 2 <span className="text-black">(Optional)</span></label>
                            <input
                                name="address2"
                                defaultValue={profile?.address2 || ''}
                                placeholder="Apartment, suite, unit, etc."
                                className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3.5 text-sm font-medium focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-neutral-300"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-black mb-2 ml-1">City</label>
                                <input
                                    name="city"
                                    defaultValue={profile?.city || ''}
                                    placeholder="City"
                                    className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3.5 text-sm font-medium focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-neutral-300"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-black mb-2 ml-1">State / Province</label>
                                <input
                                    name="province"
                                    defaultValue={profile?.province || ''}
                                    placeholder="State"
                                    className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3.5 text-sm font-medium focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-neutral-300"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-black mb-2 ml-1">ZIP / Postal Code</label>
                                <input
                                    name="zip"
                                    defaultValue={profile?.zip || ''}
                                    placeholder="ZIP Code"
                                    className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3.5 text-sm font-medium focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-neutral-300"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-black mb-2 ml-1">Country</label>
                                <input
                                    name="country"
                                    defaultValue={profile?.country || 'US'}
                                    placeholder="Country"
                                    className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3.5 text-sm font-medium focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-neutral-300"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <div className="xl:col-span-2 flex justify-end pt-4">
                    <button
                        disabled={loading}
                        className="bg-black text-white px-12 py-4 rounded-full text-xs font-bold uppercase tracking-[0.2em] hover:bg-neutral-800 transition-all disabled:opacity-50 flex items-center gap-3 shadow-xl hover:shadow-2xl hover:-translate-y-1 active:translate-y-0"
                    >
                        {loading ? (
                            'Saving...'
                        ) : (
                            <>
                                <Save className="w-4 h-4" /> Save Changes
                            </>
                        )}
                    </button>
                </div>
            </form>

            {message && (
                <div className="fixed bottom-8 right-8 bg-black text-white px-6 py-4 rounded-xl shadow-2xl text-sm font-bold animate-fade-in z-50 flex items-center gap-3 border border-neutral-800">
                    <div className="bg-green-500 rounded-full p-1">
                        <Check className="w-3 h-3 text-black" />
                    </div>
                    {message}
                </div>
            )}
        </div>
    );
}
