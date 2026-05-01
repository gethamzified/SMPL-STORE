import ProductGrid from "@/components/product/ProductGrid";
import { Product } from "@/lib/types";

interface RelatedProductsProps {
  products: Product[];
}

export default function RelatedProducts({ products }: RelatedProductsProps) {
  if (!products || products.length === 0) return null;

  return (
    <ProductGrid 
      products={products} 
      animate={false} 
      gridClassName="lg:grid-cols-4 xl:grid-cols-4" // Lock to 4 columns for related section
    />
  );
}
