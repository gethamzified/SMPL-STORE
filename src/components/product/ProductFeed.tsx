"use client";

import { useState, useMemo } from "react";
import ProductCard from "@/components/product/ProductCard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import type { Product } from "@/lib/types";

export default function ProductFeed({ initialProducts }: { initialProducts: Product[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedType, setSelectedType] = useState("all");

  const productTypes = useMemo(() => {
    const types = new Set(initialProducts.map(p => p.product_type).filter(Boolean));
    return ["all", ...Array.from(types)];
  }, [initialProducts]);

  const filteredProducts = useMemo(() => {
    let result = [...initialProducts];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.tags?.some(t => t.toLowerCase().includes(query))
      );
    }

    if (selectedType !== "all") {
      result = result.filter(p => p.product_type === selectedType);
    }

    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        result.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        break;
    }

    return result;
  }, [initialProducts, searchQuery, sortBy, selectedType]);

  return (
    <section className="px-6 md:px-12 pb-32">
      <div className="flex flex-col md:flex-row gap-6 mb-16 items-start md:items-center justify-between">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 pr-11 bg-secondary/20 border-transparent focus:border-foreground/20 rounded-full h-12 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-secondary rounded-full transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-full md:w-44 bg-secondary/20 border-transparent rounded-full h-12">
              <SelectValue placeholder="Product Type" />
            </SelectTrigger>
            <SelectContent>
              {productTypes.map(type => (
                <SelectItem key={type} value={type || 'null'} className="capitalize">
                  {type === 'all' ? 'All Types' : type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-44 bg-secondary/20 border-transparent rounded-full h-12">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Latest Arrivals</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mb-10 flex items-center justify-between">
        <p className="text-sm text-muted-foreground uppercase tracking-widest font-medium">
          {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'} found
        </p>
        {(searchQuery || selectedType !== "all") && (
          <button
            onClick={() => { setSearchQuery(""); setSelectedType("all"); }}
            className="text-xs font-bold uppercase tracking-tighter hover:text-red-500 transition-colors"
          >
            Clear All Filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8 md:gap-12 relative min-h-[500px]">
        {filteredProducts.map((product, index) => (
          <div
            key={product.id}
            className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out-expo fill-mode-both"
            style={{ animationDelay: `${(index % 12) * 50}ms` }}
          >
            <ProductCard {...product} />
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="py-20 text-center animate-in fade-in duration-700">
          <h3 className="text-2xl font-display mb-2">No matching silhouettes</h3>
          <p className="text-muted-foreground font-light">Try adjusting your search or filters.</p>
        </div>
      )}
    </section>
  );
}
