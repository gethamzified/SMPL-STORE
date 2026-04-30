'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateMenu } from '@/app/admin/(dashboard)/navigation/actions';
import { MenuItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, Save, GripVertical } from 'lucide-react';
import { toast } from "sonner";

interface MenuBuilderProps {
    initialMenu: {
        id: string;
        title: string;
        handle: string;
        items: MenuItem[];
    };
}

export default function MenuBuilder({ initialMenu }: MenuBuilderProps) {
    const [menu, setMenu] = useState(initialMenu);
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const handleAddItem = () => {
        setMenu({
            ...menu,
            items: [
                ...menu.items,
                { label: 'New Link', url: '/' }
            ]
        });
    };

    const handleUpdateItem = (index: number, field: keyof MenuItem, value: string) => {
        const newItems = [...menu.items];
        newItems[index] = { ...newItems[index], [field]: value };
        setMenu({ ...menu, items: newItems });
    };

    const handleDeleteItem = (index: number) => {
        const newItems = [...menu.items];
        newItems.splice(index, 1);
        setMenu({ ...menu, items: newItems });
    };

    const handleSave = async () => {
        setLoading(true);
        const res = await updateMenu(menu.id, {
            title: menu.title,
            handle: menu.handle,
            items: menu.items
        });
        setLoading(false);

        if (res?.error) {
            toast.error(res.error);
        } else {
            toast.success('Menu saved successfully');
            router.refresh();
        }
    };

    return (
        <div className="max-w-4xl space-y-8">
            {/* Menu Details */}
            <div className="grid grid-cols-2 gap-6 p-6 bg-[#0A0A0A] border border-white/10 rounded-xl">
                <div>
                    <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">Menu Title</label>
                    <Input
                        value={menu.title}
                        onChange={(e) => setMenu({ ...menu, title: e.target.value })}
                        className="bg-white/5 border-white/10 text-white"
                    />
                </div>
                <div>
                    <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">Handle (Programmatic ID)</label>
                    <Input
                        value={menu.handle}
                        onChange={(e) => setMenu({ ...menu, handle: e.target.value })}
                        className="bg-white/5 border-white/10 text-white font-mono"
                    />
                </div>
            </div>

            {/* Menu Items */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-white">Menu Items</h3>
                    <Button onClick={handleAddItem} variant="outline" size="sm" className="border-white/10 text-white hover:bg-white/5">
                        <Plus className="w-4 h-4 mr-2" /> Add Link
                    </Button>
                </div>

                <div className="space-y-2">
                    {menu.items.length === 0 && (
                        <div className="text-center py-12 border border-dashed border-white/10 rounded-xl text-white/30">
                            No links in this menu. Add one to get started.
                        </div>
                    )}
                    {menu.items.map((item, idx) => (
                        <div key={idx} className="flex gap-4 items-center bg-[#0A0A0A] p-4 border border-white/10 rounded-lg group">
                            <GripVertical className="text-white/20 cursor-move" />
                            <div className="flex-1 grid grid-cols-2 gap-4">
                                <Input
                                    value={item.label}
                                    onChange={(e) => handleUpdateItem(idx, 'label', e.target.value)}
                                    placeholder="Link Label"
                                    className="bg-transparent border-transparent hover:border-white/10 focus:border-white/20 text-white transition-colors"
                                />
                                <Input
                                    value={item.url}
                                    onChange={(e) => handleUpdateItem(idx, 'url', e.target.value)}
                                    placeholder="URL (e.g. /about)"
                                    className="bg-transparent border-transparent hover:border-white/10 focus:border-white/20 text-white/70 font-mono text-sm transition-colors"
                                />
                            </div>
                            <Button
                                onClick={() => handleDeleteItem(idx)}
                                variant="ghost"
                                size="icon"
                                className="opacity-0 group-hover:opacity-100 text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-all"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-white/10">
                <Button onClick={handleSave} disabled={loading} className="bg-white text-black hover:bg-white/90 px-8">
                    {loading ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        </div>
    );
}

