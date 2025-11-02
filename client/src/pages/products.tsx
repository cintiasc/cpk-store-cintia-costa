import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { ProductCard } from "@/components/product-card";
import type { ProductWithRating } from "@shared/schema";

export default function Products() {
  const { data: products, isLoading } = useQuery<ProductWithRating[]>({
    queryKey: ["/api/products"],
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="font-serif text-4xl font-bold mb-2" data-testid="text-page-title">
            Nossos Cupcakes
          </h1>
          <p className="text-muted-foreground text-lg">
            Descubra nossos deliciosos cupcakes artesanais
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-96 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" data-testid="grid-products">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg" data-testid="text-no-products">
              Nenhum produto disponível no momento.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
