import { createAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { updateThemeConfig } from "./actions";

const defaultTheme = {
    mode: 'light',
    primaryColor: '#000000',
    secondaryColor: '#ffffff',
    backgroundColor: '#ffffff',
    foregroundColor: '#000000',
    font: 'manrope',
    borderRadius: '0.5rem'
};

export default async function ThemePage() {
    const supabase = await createAdminClient();
    const { data: themeConfig } = await supabase.from('site_config').select('value').eq('key', 'theme').single();

    const theme = { ...defaultTheme, ...(themeConfig?.value || {}) };

    return (
        <div className="space-y-10 max-w-4xl">
            <div>
                <h1 className="text-xl font-semibold text-gray-900">Theme & Branding</h1>
                <p className="text-gray-500 text-sm">Customize the visual identity of your storefront.</p>
            </div>

            <form action={updateThemeConfig}>
                <div className="grid gap-10">
                    <Card className="bg-white border-border rounded-xl overflow-hidden shadow-sm">
                        <CardHeader className="border-b border-gray-100 bg-gray-50/50 px-8 py-6">
                            <CardTitle className="text-lg text-gray-900">Theme Mode</CardTitle>
                            <CardDescription className="text-gray-500">Select the base appearance for your storefront.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="space-y-2">
                                <Label htmlFor="mode" className="text-gray-500 text-xs font-medium uppercase tracking-widest pl-1">Appearance</Label>
                                <Select name="mode" defaultValue={theme.mode}>
                                    <SelectTrigger className="bg-white border-border text-gray-900 h-12">
                                        <SelectValue placeholder="Select mode" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="light">Light Mode</SelectItem>
                                        <SelectItem value="dark">Dark Mode</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border-border rounded-xl overflow-hidden shadow-sm">
                        <CardHeader className="border-b border-gray-100 bg-gray-50/50 px-8 py-6">
                            <CardTitle className="text-lg text-gray-900">Typography</CardTitle>
                            <CardDescription className="text-gray-500">Choose the primary font family for your store.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 p-8">
                            <div className="space-y-2">
                                <Label htmlFor="font" className="text-gray-500 text-xs font-medium uppercase tracking-widest pl-1">Primary Font</Label>
                                <Select name="font" defaultValue={theme.font}>
                                    <SelectTrigger className="bg-white border-border text-gray-900 h-12">
                                        <SelectValue placeholder="Select a font" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="helvetica">Helvetica (Classic)</SelectItem>
                                        <SelectItem value="manrope">Manrope (Sans)</SelectItem>
                                        <SelectItem value="inter">Inter (Modern)</SelectItem>
                                        <SelectItem value="playfair">Playfair Display (Serif)</SelectItem>
                                        <SelectItem value="mono">Space Mono (Tech)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="borderRadius" className="text-gray-500 text-xs font-medium uppercase tracking-widest pl-1">Border Radius</Label>
                                <Input id="borderRadius" name="borderRadius" defaultValue={theme.borderRadius}
                                    className="bg-white border-border rounded-xl focus:border-input focus:ring-0 transition-all py-6 h-12 text-gray-900" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border-border rounded-xl overflow-hidden shadow-sm">
                        <CardHeader className="border-b border-gray-100 bg-gray-50/50 px-8 py-6">
                            <CardTitle className="text-lg text-gray-900">Color Palette</CardTitle>
                            <CardDescription className="text-gray-500">Global color configuration for your store.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-8 p-8">
                            <div className="space-y-2">
                                <Label htmlFor="primaryColor" className="text-gray-500 text-xs font-medium uppercase tracking-widest pl-1">Primary (Buttons & Accents)</Label>
                                <div className="flex gap-4">
                                    <Input type="color" id="primaryColor" name="primaryColor" className="w-16 h-12 p-1 bg-white border-border rounded-xl cursor-pointer" defaultValue={theme.primaryColor} />
                                    <Input type="text" value={theme.primaryColor} readOnly className="flex-1 bg-gray-50 border-border rounded-xl text-gray-500 text-sm italic h-12" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="backgroundColor" className="text-gray-500 text-xs font-medium uppercase tracking-widest pl-1">Background (Main Page)</Label>
                                <div className="flex gap-4">
                                    <Input type="color" id="backgroundColor" name="backgroundColor" className="w-16 h-12 p-1 bg-white border-border rounded-xl cursor-pointer" defaultValue={theme.backgroundColor} />
                                    <Input type="text" value={theme.backgroundColor} readOnly className="flex-1 bg-gray-50 border-border rounded-xl text-gray-500 text-sm italic h-12" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="foregroundColor" className="text-gray-500 text-xs font-medium uppercase tracking-widest pl-1">Text (Primary Font)</Label>
                                <div className="flex gap-4">
                                    <Input type="color" id="foregroundColor" name="foregroundColor" className="w-16 h-12 p-1 bg-white border-border rounded-xl cursor-pointer" defaultValue={theme.foregroundColor} />
                                    <Input type="text" value={theme.foregroundColor} readOnly className="flex-1 bg-gray-50 border-border rounded-xl text-gray-500 text-sm italic h-12" />
                                </div>
                            </div>
                            {/* Hidden secondary input for backward compatibility if needed, or just let it fall to default */}
                            <input type="hidden" name="secondaryColor" value={theme.secondaryColor || '#ffffff'} />
                        </CardContent>
                    </Card>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" className="bg-gray-900 text-white hover:bg-gray-800 rounded-lg px-6 h-10 font-medium">
                            Save Theme
                        </Button>
                    </div>

                </div>
            </form>
        </div>
    );
}

