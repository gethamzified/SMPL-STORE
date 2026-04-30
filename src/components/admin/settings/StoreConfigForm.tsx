'use client'

import { useState } from 'react';
import { updateStoreConfigAction, uploadSiteAsset, deleteSiteAsset } from '@/actions/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Upload, Trash2, Crop as CropIcon, Plus, ChevronUp, ChevronDown, GripVertical } from 'lucide-react';
import { ImageCropper } from '@/components/ui/image-cropper';
import { StoreConfig } from '@/services/config';
import { BenefitItem } from '@/lib/types';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

interface StoreConfigFormProps {
    initialConfig: StoreConfig;
}

export function StoreConfigForm({ initialConfig }: StoreConfigFormProps) {
    const [config, setConfig] = useState(initialConfig);
    const [isSaving, setIsSaving] = useState(false);

    // Track images queued for deletion (deleted only after successful save)
    const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

    const [heroFile, setHeroFile] = useState<File | null>(null);
    const [tempCropImage, setTempCropImage] = useState<string | null>(null);

    const [mobileHeroFile, setMobileHeroFile] = useState<File | null>(null);
    const [tempMobileCropImage, setTempMobileCropImage] = useState<string | null>(null);



    const handleSave = async (section: keyof StoreConfig) => {
        setIsSaving(true);
        let currentConfig = { ...config };
        let toastId = undefined; // Track toast ID for updates

        // Handle File Upload for Hero
        if (section === 'hero' && heroFile) {
            const formData = new FormData();
            toastId = toast.loading('Uploading hero image...');
            formData.append('file', heroFile);

            const uploadRes = await uploadSiteAsset(formData);

            if (uploadRes.success && uploadRes.url) {
                currentConfig = {
                    ...currentConfig,
                    hero: { ...currentConfig.hero, image: uploadRes.url }
                };
                setConfig(currentConfig);
                setHeroFile(null);
            } else {
                toast.error(uploadRes.error || 'Failed to upload image', { id: toastId });
                setIsSaving(false);
                return;
            }
        }

        // Handle File Upload for Mobile Hero
        if (section === 'hero' && mobileHeroFile) {
            const formData = new FormData();
            if (!toastId) toastId = toast.loading('Uploading mobile image...');
            else toast.loading('Uploading mobile image...', { id: toastId });

            formData.append('file', mobileHeroFile);

            const uploadRes = await uploadSiteAsset(formData);

            if (uploadRes.success && uploadRes.url) {
                currentConfig = {
                    ...currentConfig,
                    hero: { ...currentConfig.hero, mobileImage: uploadRes.url }
                };
                setConfig(currentConfig);
                setMobileHeroFile(null);
            } else {
                toast.error(uploadRes.error || 'Failed to upload mobile image', { id: toastId });
                setIsSaving(false);
                return;
            }
        }



        // If no file upload happened yet, start saving toast
        if (!toastId) toastId = toast.loading('Saving settings...');
        else toast.loading('Saving settings...', { id: toastId });

        const result = await updateStoreConfigAction(section, currentConfig[section]);
        setIsSaving(false);

        if (result.success) {
            toast.success(`${section.charAt(0).toUpperCase() + section.slice(1)} settings saved`, { id: toastId });

            // SAFE DELETION
            if (section === 'hero' && imagesToDelete.length > 0) {
                for (const url of imagesToDelete) {
                    await deleteSiteAsset(url);
                }
                setImagesToDelete([]);
            }
        } else {
            toast.error(result.error || 'Failed to save settings', { id: toastId });
        }
    };

    // Queue image for deletion (doesn't actually delete until save)
    const queueImageForDeletion = (url: string | undefined) => {
        if (url) {
            setImagesToDelete(prev => [...prev, url]);
        }
    };

    return (
        <Tabs defaultValue="brand" className="space-y-4">
            <TabsList>
                <TabsTrigger value="brand">Brand & Identity</TabsTrigger>
                <TabsTrigger value="hero">Hero</TabsTrigger>
                <TabsTrigger value="categoryGrid">Collections</TabsTrigger>
                <TabsTrigger value="benefits">Benefits</TabsTrigger>
                <TabsTrigger value="currency">Currency</TabsTrigger>
                <TabsTrigger value="delivery">Delivery</TabsTrigger>
            </TabsList>

            <TabsContent value="brand">
                <Card>
                    <CardHeader>
                        <CardTitle>Brand Settings</CardTitle>
                        <CardDescription>Manage your store's identity and basic information.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Store Name</Label>
                            <Input
                                value={config.brand.name || ''}
                                onChange={(e) => setConfig({ ...config, brand: { ...config.brand, name: e.target.value } })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Tagline</Label>
                            <Input
                                value={config.brand.tagline || ''}
                                onChange={(e) => setConfig({ ...config, brand: { ...config.brand, tagline: e.target.value } })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Announcement Bar</Label>
                            <Input
                                value={config.brand.announcement || ''}
                                onChange={(e) => setConfig({ ...config, brand: { ...config.brand, announcement: e.target.value } })}
                                placeholder="e.g. Free shipping over Rs. 10,000"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="show-announcement"
                                checked={config.brand.showAnnouncement || false}
                                onChange={(e) => setConfig({ ...config, brand: { ...config.brand, showAnnouncement: e.target.checked } })}
                                className="rounded border-input"
                            />
                            <Label htmlFor="show-announcement">Show Announcement Bar</Label>
                        </div>
                        <Button onClick={() => handleSave('brand')} disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save Brand Settings'}
                        </Button>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="currency">
                <Card>
                    <CardHeader>
                        <CardTitle>Currency Settings</CardTitle>
                        <CardDescription>Set the currency used for product pricing.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 space-y-2">
                                <Label>Preset Currencies</Label>
                                <Select onValueChange={(val) => {
                                    const presets: Record<string, { code: string, symbol: string }> = {
                                        'PKR': { code: 'PKR', symbol: 'Rs.' },
                                        'USD': { code: 'USD', symbol: '$' },
                                        'GBP': { code: 'GBP', symbol: '£' },
                                        'EUR': { code: 'EUR', symbol: '€' },
                                        'AED': { code: 'AED', symbol: 'د.إ' }
                                    };
                                    if (presets[val]) {
                                        setConfig({ ...config, currency: presets[val] });
                                    }
                                }}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a preset..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PKR">PKR - Pakistani Rupee</SelectItem>
                                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                                        <SelectItem value="GBP">GBP - British Pound</SelectItem>
                                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                                        <SelectItem value="AED">AED - UAE Dirham</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Currency Code (ISO)</Label>
                                <Input
                                    value={config.currency?.code ?? ''}
                                    onChange={(e) => setConfig({ ...config, currency: { ...(config.currency || { symbol: 'Rs.' }), code: e.target.value } })}
                                    placeholder="PKR"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Currency Symbol</Label>
                                <Input
                                    value={config.currency?.symbol ?? ''}
                                    onChange={(e) => setConfig({ ...config, currency: { ...(config.currency || { code: 'PKR' }), symbol: e.target.value } })}
                                    placeholder="Rs."
                                />
                            </div>
                        </div>
                        <Button onClick={() => handleSave('currency')} disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save Currency Settings'}
                        </Button>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="hero">
                <Card>
                    <CardHeader>
                        <CardTitle>Hero Configuration</CardTitle>
                        <CardDescription>Manage your homepage hero section. Set a main image, heading, and call-to-action.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">

                        {/* Heading & Text */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Main Heading</Label>
                                <Input
                                    value={config.hero?.heading || ''}
                                    onChange={(e) => setConfig({ ...config, hero: { ...config.hero, heading: e.target.value } })}
                                    placeholder="e.g. SMPL"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Subheading</Label>
                                <Input
                                    value={config.hero?.subheading || ''}
                                    onChange={(e) => setConfig({ ...config, hero: { ...config.hero, subheading: e.target.value } })}
                                    placeholder="e.g. Spring/Summer Collection"
                                />
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Button Text</Label>
                                <Input
                                    value={config.hero?.ctaText || ''}
                                    onChange={(e) => setConfig({ ...config, hero: { ...config.hero, ctaText: e.target.value } })}
                                    placeholder="Shop Now"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Button Link</Label>
                                <Input
                                    value={config.hero?.ctaLink || ''}
                                    onChange={(e) => setConfig({ ...config, hero: { ...config.hero, ctaLink: e.target.value } })}
                                    placeholder="/shop"
                                />
                            </div>
                        </div>

                        {/* Overlay Opacity */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label>Overlay Opacity</Label>
                                <span className="text-sm text-muted-foreground">
                                    {Math.round((config.hero?.overlayOpacity ?? 0.3) * 100)}%
                                </span>
                            </div>
                            <Slider
                                value={[config.hero?.overlayOpacity ?? 0.3]}
                                min={0}
                                max={0.9}
                                step={0.05}
                                onValueChange={(vals) => setConfig({ ...config, hero: { ...config.hero, overlayOpacity: vals[0] } })}
                            />
                        </div>

                        {/* Hero Image */}
                        <div className="space-y-4 pt-4 border-t border-white/10">
                            <Label className="text-base font-semibold">Desktop Image</Label>

                            {(config.hero?.image || heroFile) ? (
                                <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-white/10 group">
                                    <img
                                        src={heroFile ? URL.createObjectURL(heroFile) : config.hero?.image}
                                        alt="Hero Desktop"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <label className="cursor-pointer p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                                            <Upload className="w-4 h-4" />
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => {
                                                    if (e.target.files?.[0]) {
                                                        const file = e.target.files[0];
                                                        const reader = new FileReader();
                                                        reader.onload = (ev) => {
                                                            if (ev.target?.result && typeof ev.target.result === 'string') {
                                                                setTempCropImage(ev.target.result);
                                                            }
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                            />
                                        </label>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="icon"
                                            onClick={() => {
                                                if (heroFile) {
                                                    setHeroFile(null);
                                                } else if (config.hero?.image) {
                                                    queueImageForDeletion(config.hero.image);
                                                    setConfig({ ...config, hero: { ...config.hero, image: '' } });
                                                }
                                            }}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-white/10 rounded-lg cursor-pointer hover:border-white/30 transition-all bg-black/20">
                                    <Upload className="w-8 h-8 text-white/40 mb-2" />
                                    <span className="text-sm text-white/40">Click to upload desktop image (16:9 recommended)</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            if (e.target.files?.[0]) {
                                                const file = e.target.files[0];
                                                const reader = new FileReader();
                                                reader.onload = (ev) => {
                                                    if (ev.target?.result && typeof ev.target.result === 'string') {
                                                        setTempCropImage(ev.target.result);
                                                    }
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                </label>
                            )}
                        </div>

                        {/* Mobile Image */}
                        <div className="space-y-4 pt-4 border-t border-white/10">
                            <Label className="text-base font-semibold">Mobile Image (Optional)</Label>

                            {(config.hero?.mobileImage || mobileHeroFile) ? (
                                <div className="relative aspect-[9/16] w-full max-w-xs mx-auto rounded-lg overflow-hidden border border-white/10 group">
                                    <img
                                        src={mobileHeroFile ? URL.createObjectURL(mobileHeroFile) : config.hero?.mobileImage}
                                        alt="Hero Mobile"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <label className="cursor-pointer p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                                            <Upload className="w-4 h-4" />
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => {
                                                    if (e.target.files?.[0]) {
                                                        const file = e.target.files[0];
                                                        const reader = new FileReader();
                                                        reader.onload = (ev) => {
                                                            if (ev.target?.result && typeof ev.target.result === 'string') {
                                                                setTempMobileCropImage(ev.target.result);
                                                            }
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                            />
                                        </label>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="icon"
                                            onClick={() => {
                                                if (mobileHeroFile) {
                                                    setMobileHeroFile(null);
                                                } else if (config.hero?.mobileImage) {
                                                    queueImageForDeletion(config.hero.mobileImage);
                                                    setConfig({ ...config, hero: { ...config.hero, mobileImage: '' } });
                                                }
                                            }}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center w-full max-w-xs mx-auto aspect-[9/16] border-2 border-dashed border-white/10 rounded-lg cursor-pointer hover:border-white/30 transition-all bg-black/20">
                                    <Upload className="w-6 h-6 text-white/40 mb-2" />
                                    <span className="text-xs text-white/40">Click to upload mobile image (9:16)</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            if (e.target.files?.[0]) {
                                                const file = e.target.files[0];
                                                const reader = new FileReader();
                                                reader.onload = (ev) => {
                                                    if (ev.target?.result && typeof ev.target.result === 'string') {
                                                        setTempMobileCropImage(ev.target.result);
                                                    }
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                </label>
                            )}
                        </div>

                        {imagesToDelete.length > 0 && (
                            <p className="text-xs text-amber-500">
                                ⚠️ {imagesToDelete.length} image(s) will be deleted when you save.
                            </p>
                        )}

                        <Button onClick={() => handleSave('hero')} disabled={isSaving} className="w-full">
                            {isSaving ? 'Saving...' : 'Save Hero Settings'}
                        </Button>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="benefits">
                <Card>
                    <CardHeader>
                        <CardTitle>Benefits Strip</CardTitle>
                        <CardDescription>Value propositions displayed on the homepage.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="benefits-enabled"
                                checked={config.benefits?.enabled ?? true}
                                onChange={(e) => setConfig({
                                    ...config,
                                    benefits: {
                                        items: config.benefits?.items || [],
                                        enabled: e.target.checked
                                    }
                                })}
                                className="rounded border-input"
                            />
                            <Label htmlFor="benefits-enabled">Enable Benefits Strip</Label>
                        </div>

                        {config.benefits?.items?.map((item, index) => (
                            <div key={index} className="grid grid-cols-[100px_1fr] gap-2 items-center border p-2 rounded-lg border-white/5">
                                <select
                                    className="bg-black border border-white/10 rounded px-2 py-1 text-sm h-9"
                                    value={item.icon || 'truck'}
                                    onChange={(e) => {
                                        const newItems = [...(config.benefits?.items || [])];
                                        newItems[index] = { ...item, icon: e.target.value as BenefitItem['icon'] };
                                        setConfig({ ...config, benefits: { ...config.benefits!, items: newItems } });
                                    }}
                                >
                                    <option value="truck">Truck</option>
                                    <option value="rotate">Return</option>
                                    <option value="shield">Shield</option>
                                    <option value="headphones">Support</option>
                                    <option value="star">Star</option>
                                    <option value="gift">Gift</option>
                                </select>
                                <Input
                                    value={item.text || ''}
                                    onChange={(e) => {
                                        const currentItems = config.benefits?.items || [];
                                        const newItems: BenefitItem[] = [...currentItems];
                                        if (newItems[index]) {
                                            newItems[index] = { ...newItems[index], text: e.target.value };
                                            setConfig({
                                                ...config,
                                                benefits: {
                                                    enabled: config.benefits?.enabled ?? true,
                                                    items: newItems
                                                }
                                            });
                                        }
                                    }}
                                    placeholder="Benefit text"
                                />
                            </div>
                        ))}

                        <Button onClick={() => handleSave('benefits')} disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save Benefits Settings'}
                        </Button>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="categoryGrid">
                <Card>
                    <CardHeader>
                        <CardTitle>Collection Grid</CardTitle>
                        <CardDescription>Customize the appearance of collection cards.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Card Aspect Ratio</Label>
                            <select
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={config.categoryGrid?.aspectRatio || '0.8'}
                                onChange={(e) => setConfig({
                                    ...config,
                                    categoryGrid: { aspectRatio: e.target.value }
                                })}
                            >
                                <option value="0.8">Portrait (4:5) - Default</option>
                                <option value="1">Square (1:1)</option>
                                <option value="1.33">Landscape (4:3)</option>
                                <option value="0.66">Tall (2:3)</option>
                            </select>
                            <p className="text-[0.8rem] text-muted-foreground">
                                This controls the shape of collection cards on the homepage and cropping aspect ratio.
                            </p>
                        </div>
                        <Button onClick={() => handleSave('categoryGrid')} disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save Collection Settings'}
                        </Button>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="delivery">
                <Card>
                    <CardHeader>
                        <CardTitle>Delivery Settings</CardTitle>
                        <CardDescription>Configure multiple delivery methods and free shipping threshold.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* STANDARD DELIVERY */}
                        <div className="space-y-4 border-b border-border pb-6">
                            <h3 className="text-sm font-semibold uppercase tracking-wider">Standard Delivery</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Price (Rs.)</Label>
                                    <Input
                                        type="number"
                                        value={config.delivery?.standard?.price ?? 250}
                                        onChange={(e) => setConfig({
                                            ...config,
                                            delivery: {
                                                ...config.delivery,
                                                standard: { ...config.delivery.standard, price: Number(e.target.value) }
                                            }
                                        })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Delivery Time</Label>
                                    <Input
                                        value={config.delivery?.standard?.time ?? '3-5 Working Days'}
                                        onChange={(e) => setConfig({
                                            ...config,
                                            delivery: {
                                                ...config.delivery,
                                                standard: { ...config.delivery.standard, time: e.target.value }
                                            }
                                        })}
                                    />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <Label>Description</Label>
                                    <Input
                                        value={config.delivery?.standard?.description ?? 'Reliable delivery via TCS or Leopards.'}
                                        onChange={(e) => setConfig({
                                            ...config,
                                            delivery: {
                                                ...config.delivery,
                                                standard: { ...config.delivery.standard, description: e.target.value }
                                            }
                                        })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* EXPRESS DELIVERY */}
                        <div className="space-y-4 border-b border-border pb-6">
                            <h3 className="text-sm font-semibold uppercase tracking-wider">Express Delivery</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Price (Rs.)</Label>
                                    <Input
                                        type="number"
                                        value={config.delivery?.express?.price ?? 450}
                                        onChange={(e) => setConfig({
                                            ...config,
                                            delivery: {
                                                ...config.delivery,
                                                express: { ...config.delivery.express, price: Number(e.target.value) }
                                            }
                                        })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Delivery Time</Label>
                                    <Input
                                        value={config.delivery?.express?.time ?? '1-2 Working Days'}
                                        onChange={(e) => setConfig({
                                            ...config,
                                            delivery: {
                                                ...config.delivery,
                                                express: { ...config.delivery.express, time: e.target.value }
                                            }
                                        })}
                                    />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <Label>Description</Label>
                                    <Input
                                        value={config.delivery?.express?.description ?? 'Priority processing and overnight shipping.'}
                                        onChange={(e) => setConfig({
                                            ...config,
                                            delivery: {
                                                ...config.delivery,
                                                express: { ...config.delivery.express, description: e.target.value }
                                            }
                                        })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* FREE THRESHOLD */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Free Delivery Threshold (Rs.)</Label>
                                <Input
                                    type="number"
                                    value={config.delivery?.freeThreshold ?? 2000}
                                    onChange={(e) => setConfig({
                                        ...config,
                                        delivery: {
                                            ...config.delivery,
                                            freeThreshold: Number(e.target.value)
                                        }
                                    })}
                                    placeholder="2000"
                                />
                                <p className="text-[0.8rem] text-muted-foreground">
                                    Orders above this amount get free <strong>Standard</strong> delivery.
                                </p>
                            </div>

                            <div className="p-4 bg-muted/50 rounded-lg border border-border">
                                <p className="text-sm">
                                    <strong>Logic:</strong> Orders ≥ Rs. {config.delivery?.freeThreshold ?? 2000} lead to
                                    <span className="text-green-500 font-medium mx-1">FREE STANDARD DELIVERY</span>.
                                    Express delivery always maintains its set price.
                                </p>
                            </div>
                        </div>

                        <Button onClick={() => handleSave('delivery')} disabled={isSaving} className="w-full">
                            {isSaving ? 'Saving...' : 'Save All Delivery Settings'}
                        </Button>
                    </CardContent>
                </Card>
            </TabsContent>

            {tempCropImage && (
                <ImageCropper
                    image={tempCropImage}
                    aspect={16 / 9}
                    onCropComplete={(blob) => {
                        const file = new File([blob], 'hero.webp', { type: 'image/webp' });
                        setHeroFile(file);
                        setTempCropImage(null);
                    }}
                    onCancel={() => setTempCropImage(null)}
                />
            )}
            {tempMobileCropImage && (
                <ImageCropper
                    image={tempMobileCropImage}
                    aspect={9 / 16}
                    onCropComplete={(blob) => {
                        const file = new File([blob], 'hero-mobile.webp', { type: 'image/webp' });
                        setMobileHeroFile(file);
                        setTempMobileCropImage(null);
                    }}
                    onCancel={() => setTempMobileCropImage(null)}
                />
            )}
        </Tabs>
    );
}

