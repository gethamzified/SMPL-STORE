"use client";

import * as React from "react";
import { Search, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import {
    Command,
    CommandGroup,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

// Singleton supabase client — avoids re-creating on every render
let _supabaseClient: ReturnType<typeof createClient> | null = null;
function getSupabaseClient() {
    if (!_supabaseClient) {
        _supabaseClient = createClient();
    }
    return _supabaseClient;
}

/**
 * SearchModal - Premium CSS Edition
 * Replaces Framer Motion with CSS transitions and standard tailwindcss-animate utilities
 * to maintain a high-quality feel without the heavy JS bundle.
 */
export function SearchModal() {
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState("");
    const [results, setResults] = React.useState<{ products: any[] }>({ products: [] });
    const [loading, setLoading] = React.useState(false);
    const [hasSearched, setHasSearched] = React.useState(false);

    // Internal state for delaying unmount to allow CSS exit animations
    const [isRendered, setIsRendered] = React.useState(false);

    const router = useRouter();
    const supabase = getSupabaseClient();
    const inputRef = React.useRef<HTMLInputElement>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Handle delayed unmount
    React.useEffect(() => {
        if (open) {
            setIsRendered(true);
        } else {
            const timer = setTimeout(() => setIsRendered(false), 300); // match duration
            return () => clearTimeout(timer);
        }
    }, [open]);

    // Reset hasSearched when query changes to prevent stale empty state
    React.useEffect(() => {
        if (query.trim() === "") {
            setHasSearched(false);
        }
    }, [query]);

    // Close when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (open && containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    // Focus input when opening
    React.useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [open]);

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
            if (e.key === "Escape") {
                setOpen(false);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    React.useEffect(() => {
        if (!open || !query.trim()) {
            setResults({ products: [] });
            setLoading(false);
            return;
        }

        const search = async () => {
            setLoading(true);
            try {
                const { data: productsData } = await supabase
                    .from('products')
                    .select('*')
                    .or(`title.ilike.%${query.trim()}%,description.ilike.%${query.trim()}%,product_type.ilike.%${query.trim()}%`)
                    .eq('status', 'active')
                    .limit(5);

                setResults({
                    products: productsData || [],
                });
                setHasSearched(true);
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setLoading(false);
            }
        };

        const debounce = setTimeout(search, 300);
        return () => clearTimeout(debounce);
    }, [open, query, supabase]);

    const runCommand = React.useCallback((command: () => unknown) => {
        setOpen(false);
        command();
    }, []);

    return (
        <div ref={containerRef} className={cn("flex items-center", open ? "absolute inset-x-4 z-[100] md:relative md:inset-auto" : "relative z-10")}>

            {/* Search Icon Toggle */}
            <button
                onClick={() => setOpen(true)}
                className={cn(
                    "w-full h-full flex items-center justify-center transition-all duration-300",
                    isRendered ? "opacity-0 scale-75 pointer-events-none absolute" : "opacity-100 scale-100"
                )}
                aria-label="Open search"
                aria-hidden={isRendered}
            >
                <Search className="h-5 w-5 stroke-[2]" />
            </button>

            {/* Search Input Container */}
            {isRendered && (
                <div
                    className={cn(
                        "flex justify-end w-full md:w-auto transition-all duration-300 ease-out-expo absolute right-0 md:bg-transparent bg-white md:shadow-none shadow-lg rounded-full z-[110] transform origin-right",
                        open ? "opacity-100 scale-x-100" : "opacity-0 scale-x-75 pointer-events-none"
                    )}
                >
                    <div className="flex items-center w-full md:w-[300px] bg-white md:bg-neutral-50 rounded-full border border-neutral-200 overflow-visible relative">
                        <div className="flex items-center w-full px-3 h-10 relative">
                            <Search className="h-4 w-4 text-neutral-400 shrink-0 mr-2" />
                            <input
                                ref={inputRef}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && query.trim()) {
                                        runCommand(() => router.push(`/shop?q=${encodeURIComponent(query)}`));
                                    }
                                }}
                                placeholder="Search..."
                                className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-neutral-400 h-full w-full"
                            />
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin text-neutral-400 ml-2" />
                            ) : (
                                query && (
                                    <button onClick={() => setQuery('')} className="ml-2 hover:bg-neutral-200 rounded-full p-0.5 transition-colors">
                                        <X className="h-3 w-3 text-neutral-500" />
                                    </button>
                                )
                            )}
                            <button 
                                onClick={() => setOpen(false)} 
                                className="ml-2 bg-[#ff0000] text-white w-8 h-8 flex items-center justify-center shrink-0 transition-transform active:scale-95"
                            >
                                <X className="h-5 w-5 stroke-[3]" />
                            </button>
                        </div>

                        {/* Results Dropdown */}
                        {(query.trim().length > 0) && (
                            <div
                                className={cn(
                                    "absolute top-full left-0 md:w-[400px] mt-2 bg-white rounded-xl shadow-2xl border border-neutral-100 overflow-hidden p-2 transform origin-top transition-all duration-300 ease-out-expo",
                                    open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
                                )}
                            >
                                <Command className="border-none" shouldFilter={false}>
                                    <CommandList className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                        {loading ? (
                                            <div className="py-6 text-center text-sm text-neutral-500 flex items-center justify-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                <span>Searching...</span>
                                            </div>
                                        ) : (hasSearched && results.products.length === 0) ? (
                                            <div className="py-6 text-center text-sm text-neutral-500">
                                                No results found.
                                            </div>
                                        ) : !hasSearched && query.trim() !== "" ? (
                                            <div className="py-6 text-center text-sm text-neutral-500">
                                                Press enter to search...
                                            </div>
                                        ) : null}


                                        {results.products.length > 0 && (
                                            <CommandGroup heading="Products" className="text-xs font-bold text-neutral-400 uppercase tracking-widest px-2 py-1.5 mt-2">
                                                {results.products.map((product) => (
                                                    <CommandItem
                                                        key={product.slug}
                                                        onSelect={() => runCommand(() => router.push(`/product/${product.slug}`))}
                                                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg aria-selected:bg-neutral-50 cursor-pointer group"
                                                    >
                                                        <div className="h-10 w-10 shrink-0 rounded-md overflow-hidden bg-neutral-100 border border-neutral-100 relative">
                                                            {product.cover_image ? (
                                                                <Image src={product.cover_image} alt={product.title} width={40} height={40} sizes="40px" quality={75} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center">
                                                                    <Search className="w-4 h-4 text-neutral-300" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-black group-hover:underline decoration-neutral-300 underline-offset-4">{product.title}</span>
                                                            <span className="text-[10px] uppercase tracking-wider text-neutral-500">{product.category || 'Product'}</span>
                                                        </div>
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        )}
                                    </CommandList>
                                </Command>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Mobile Overlay Backdrop (Rendered completely separately to cover the whole viewport behind the search) */}
            {isRendered && (
                <div
                    className={cn(
                        "fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] md:hidden transition-opacity duration-300 ease-out",
                        open ? "opacity-100" : "opacity-0"
                    )}
                    onClick={() => setOpen(false)}
                />
            )}
        </div>
    );
}
