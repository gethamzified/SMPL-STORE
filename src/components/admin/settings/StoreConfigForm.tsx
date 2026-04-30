'use client'

import { useState } from 'react';
import { updateStoreConfigAction, uploadSiteAsset, deleteSiteAsset } from '@/actions/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Upload, Trash2, Crop as CropIcon, Loader2, ImageIcon, Globe, Truck, DollarSign, Palette } from 'lucide-react';
import { ImageCropper } from '@/components/ui/image-cropper';
import { StoreConfig } from '@/services/config';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface StoreConfigFormProps {
    initialConfig: StoreConfig;
}

export function StoreConfigForm({ initialConfig }: StoreConfigFormProps) {
    const [config, setConfig] = useState(initialConfig);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Track images queued for deletion (deleted only after successful save)
    const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

    const [heroFile, setHeroFile] = useState<File | null>(null);
    const [tempCropImage, setTempCropImage] = useState<string | null>(null);

    const handleSave = async (section: keyof StoreConfig) => {
        setIsSaving(true);
        let currentConfig = { ...config };
        let toastId: string | number | undefined = undefined;

        // Handle File Upload for Hero Background
        if (section === 'hero' && heroFile) {
            setIsUploading(true);
            const formData = new FormData();
            toastId = toast.loading('Uploading background image to Cloudinary...');
            formData.append('file', heroFile);

            const uploadRes = await uploadSiteAsset(formData);
            setIsUploading(false);

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

        // Save to DB
        if (!toastId) toastId = toast.loading('Saving settings...');
        else toast.loading('Saving to database...', { id: toastId });

        const result = await updateStoreConfigAction(section, currentConfig[section]);
        setIsSaving(false);

        if (result.success) {
            toast.success(`Settings saved`, {
                id: toastId,
                description: 'Changes will appear on the storefront shortly.',
            });

            // Delete old images after successful save
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

    const queueImageForDeletion = (url: string | undefined) => {
        if (url) setImagesToDelete(prev => [...prev, url]);
    };

    const heroPreview = heroFile ? URL.createObjectURL(heroFile) : config.hero?.image;

    return (
        <Tabs defaultValue="homepage" className="space-y-6">
            <TabsList className="bg-gray-100 p-1 rounded-lg">
                <TabsTrigger value="homepage" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4">
                    <Globe className="w-4 h-4" />
                    Homepage
                </TabsTrigger>
                <TabsTrigger value="brand" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4">
                    <Palette className="w-4 h-4" />
                    Brand
                </TabsTrigger>
                <TabsTrigger value="delivery" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4">
                    <Truck className="w-4 h-4" />
                    Delivery
                </TabsTrigger>
                <TabsTrigger value="currency" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4">
                    <DollarSign className="w-4 h-4" />
                    Currency
                </TabsTrigger>
            </TabsList>

            {/* ═══════════════════════════════════════════════════════════════
                 HOMEPAGE TAB — Background, Hero Text, CTA
                 ═══════════════════════════════════════════════════════════════ */}
            <TabsContent value="homepage" className="space-y-6">
                {/* Background Image */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Background Image</CardTitle>
                        <CardDescription>The atmospheric image that spans the entire homepage. Uploaded to Cloudinary for optimal delivery.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {heroPreview ? (
                            <div className="relative w-full aspect-[21/9] rounded-xl overflow-hidden border border-gray-200 group bg-gray-50">
                                <img
                                    src={heroPreview}
                                    alt="Background preview"
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                                />
                                {/* Overlay Actions */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                    <label className="cursor-pointer p-3 bg-white/90 hover:bg-white rounded-full transition-colors shadow-md">
                                        <Upload className="w-5 h-5 text-gray-700" />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                if (e.target.files?.[0]) {
                                                    setHeroFile(e.target.files[0]);
                                                }
                                            }}
                                        />
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (heroFile) {
                                                setHeroFile(null);
                                            } else if (config.hero?.image) {
                                                queueImageForDeletion(config.hero.image);
                                                setConfig({ ...config, hero: { ...config.hero, image: '' } });
                                            }
                                        }}
                                        className="p-3 bg-white/90 hover:bg-red-50 rounded-full transition-colors shadow-md"
                                    >
                                        <Trash2 className="w-5 h-5 text-red-600" />
                                    </button>
                                </div>
                                {/* Upload indicator */}
                                {isUploading && (
                                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                                        <div className="flex items-center gap-3 bg-white rounded-xl px-6 py-3 shadow-lg">
                                            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                                            <span className="text-sm font-medium text-gray-700">Uploading to Cloudinary...</span>
                                        </div>
                                    </div>
                                )}
                                {/* Pending change indicator */}
                                {heroFile && (
                                    <div className="absolute bottom-3 left-3 bg-amber-500/90 text-white text-xs font-medium px-3 py-1.5 rounded-full">
                                        Unsaved — click Save to upload
                                    </div>
                                )}
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all group">
                                <ImageIcon className="w-10 h-10 text-gray-300 group-hover:text-blue-400 transition-colors mb-3" />
                                <span className="text-sm text-gray-500 group-hover:text-blue-600 font-medium">Click to upload background image</span>
                                <span className="text-xs text-gray-400 mt-1">High-res PNG or JPG recommended</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        if (e.target.files?.[0]) setHeroFile(e.target.files[0]);
                                    }}
                                />
                            </label>
                        )}

                        {imagesToDelete.length > 0 && (
                            <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                                ⚠️ {imagesToDelete.length} image(s) will be removed from Cloudinary when you save.
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Hero Text & CTA */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Hero Overlay</CardTitle>
                        <CardDescription>Text and CTA button displayed over the product carousel.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Heading</Label>
                                <Input
                                    value={config.hero?.heading || ''}
                                    onChange={(e) => setConfig({ ...config, hero: { ...config.hero, heading: e.target.value } })}
                                    placeholder="e.g. SMPL / SPRING 26"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Subheading</Label>
                                <Input
                                    value={config.hero?.subheading || ''}
                                    onChange={(e) => setConfig({ ...config, hero: { ...config.hero, subheading: e.target.value } })}
                                    placeholder="e.g. BEYOND THE BASICS"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">CTA Text</Label>
                                <Input
                                    value={config.hero?.ctaText || ''}
                                    onChange={(e) => setConfig({ ...config, hero: { ...config.hero, ctaText: e.target.value } })}
                                    placeholder="Shop Now"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">CTA Link</Label>
                                <Input
                                    value={config.hero?.ctaLink || ''}
                                    onChange={(e) => setConfig({ ...config, hero: { ...config.hero, ctaLink: e.target.value } })}
                                    placeholder="/shop"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Button onClick={() => handleSave('hero')} disabled={isSaving || isUploading} className="w-full h-11">
                    {isUploading ? 'Uploading...' : isSaving ? 'Saving...' : 'Save Homepage Settings'}
                </Button>
            </TabsContent>

            {/* ═══════════════════════════════════════════════════════════════
                 BRAND TAB — Name, Tagline, Announcement, Theme Color
                 ═══════════════════════════════════════════════════════════════ */}
            <TabsContent value="brand" className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Brand Identity</CardTitle>
                        <CardDescription>Core identity settings visible across your store.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Store Name</Label>
                            <Input
                                value={config.brand.name || ''}
                                onChange={(e) => setConfig({ ...config, brand: { ...config.brand, name: e.target.value } })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Tagline</Label>
                            <Input
                                value={config.brand.tagline || ''}
                                onChange={(e) => setConfig({ ...config, brand: { ...config.brand, tagline: e.target.value } })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Announcement Bar</Label>
                            <Input
                                value={config.brand.announcement || ''}
                                onChange={(e) => setConfig({ ...config, brand: { ...config.brand, announcement: e.target.value } })}
                                placeholder="e.g. Free shipping over Rs. 10,000"
                            />
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <Label htmlFor="show-announcement" className="text-sm">Show Announcement Bar</Label>
                            <Switch
                                id="show-announcement"
                                checked={config.brand.showAnnouncement || false}
                                onCheckedChange={(checked) => setConfig({ ...config, brand: { ...config.brand, showAnnouncement: checked } })}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Theme</CardTitle>
                        <CardDescription>Primary accent color used across the store.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <input
                                type="color"
                                value={config.theme?.primaryColor || '#000000'}
                                onChange={(e) => setConfig({ ...config, theme: { ...config.theme, primaryColor: e.target.value } })}
                                className="w-12 h-12 rounded-lg cursor-pointer border border-gray-200 p-1"
                            />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{config.theme?.primaryColor || '#000000'}</p>
                                <p className="text-xs text-gray-500">Used for buttons, links, and accents</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Button onClick={() => handleSave('brand')} disabled={isSaving} className="w-full h-11">
                    {isSaving ? 'Saving...' : 'Save Brand Settings'}
                </Button>
            </TabsContent>

            {/* ═══════════════════════════════════════════════════════════════
                 DELIVERY TAB
                 ═══════════════════════════════════════════════════════════════ */}
            <TabsContent value="delivery" className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Delivery Configuration</CardTitle>
                        <CardDescription>Configure shipping methods and free delivery threshold.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Standard */}
                        <div className="space-y-4 pb-6 border-b">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Standard Delivery</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Price (Rs.)</Label>
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
                                    <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Time</Label>
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
                            </div>
                        </div>

                        {/* Express */}
                        <div className="space-y-4 pb-6 border-b">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Express Delivery</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Price (Rs.)</Label>
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
                                    <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Time</Label>
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
                            </div>
                        </div>

                        {/* Free Threshold */}
                        <div className="space-y-3">
                            <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Free Delivery Threshold (Rs.)</Label>
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
                            />
                            <div className="p-3 bg-green-50 rounded-lg border border-green-100 text-sm text-green-800">
                                Orders ≥ Rs. {config.delivery?.freeThreshold ?? 2000} → <strong>Free Standard Delivery</strong>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Button onClick={() => handleSave('delivery')} disabled={isSaving} className="w-full h-11">
                    {isSaving ? 'Saving...' : 'Save Delivery Settings'}
                </Button>
            </TabsContent>

            {/* ═══════════════════════════════════════════════════════════════
                 CURRENCY TAB
                 ═══════════════════════════════════════════════════════════════ */}
            <TabsContent value="currency" className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Currency</CardTitle>
                        <CardDescription>Set the currency used for product pricing.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Preset</Label>
                            <Select onValueChange={(val) => {
                                const presets: Record<string, { code: string, symbol: string }> = {
                                    'PKR': { code: 'PKR', symbol: 'Rs.' },
                                    'USD': { code: 'USD', symbol: '$' },
                                    'GBP': { code: 'GBP', symbol: '£' },
                                    'EUR': { code: 'EUR', symbol: '€' },
                                    'AED': { code: 'AED', symbol: 'د.إ' }
                                };
                                if (presets[val]) setConfig({ ...config, currency: presets[val] });
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
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Code (ISO)</Label>
                                <Input
                                    value={config.currency?.code ?? ''}
                                    onChange={(e) => setConfig({ ...config, currency: { ...(config.currency || { symbol: 'Rs.' }), code: e.target.value } })}
                                    placeholder="PKR"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</Label>
                                <Input
                                    value={config.currency?.symbol ?? ''}
                                    onChange={(e) => setConfig({ ...config, currency: { ...(config.currency || { code: 'PKR' }), symbol: e.target.value } })}
                                    placeholder="Rs."
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Button onClick={() => handleSave('currency')} disabled={isSaving} className="w-full h-11">
                    {isSaving ? 'Saving...' : 'Save Currency Settings'}
                </Button>
            </TabsContent>

            {/* Image Cropper Modal */}
            {tempCropImage && (
                <ImageCropper
                    image={tempCropImage}
                    aspect={21 / 9}
                    onCropComplete={(blob) => {
                        const file = new File([blob], 'background.webp', { type: 'image/webp' });
                        setHeroFile(file);
                        setTempCropImage(null);
                    }}
                    onCancel={() => setTempCropImage(null)}
                />
            )}
        </Tabs>
    );
}
