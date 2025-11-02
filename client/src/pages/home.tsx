import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Header } from "@/components/header";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import type { ProductWithRating } from "@shared/schema";
import heroImage from "@assets/generated_images/Hero_cupcake_assortment_overhead_05ca111d.png";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { user } = useAuth();
  const { data: products } = useQuery<ProductWithRating[]>({
    queryKey: ["/api/products"],
  });

  const featuredProducts = products?.slice(0, 4) || [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative min-h-96 flex items-center justify-center overflow-hidden">
          <div 
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.4)), url(${heroImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          
          <div className="relative z-10 container mx-auto px-4 py-20 text-center">
            <h1 className="font-serif text-4xl md:text-6xl font-bold text-white mb-4" data-testid="text-home-hero-title">
              Bem-vindo de volta, {user?.firstName}!
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-6 max-w-2xl mx-auto">
              Explore nossa deliciosa seleção de cupcakes artesanais
            </p>
            <Button asChild size="lg" className="backdrop-blur-md bg-white/90 text-foreground hover:bg-white" data-testid="button-hero-shop">
              <Link href="/products">Comprar Agora</Link>
            </Button>
          </div>
        </section>

        {/* Featured Products */}
        {featuredProducts.length > 0 && (
          <section className="container mx-auto px-4 py-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-serif text-3xl font-bold">Cupcakes em Destaque</h2>
              <Button asChild variant="outline" data-testid="button-view-all">
                <Link href="/products">Ver Todos</Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6" data-testid="grid-featured-products">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Quick Links */}
        <section className="bg-primary/5 py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Link href="/orders">
                <div className="bg-background rounded-xl p-8 hover:shadow-lg transition-shadow" data-testid="card-orders-link">
                  <h3 className="font-serif text-2xl font-semibold mb-2">Seus Pedidos</h3>
                  <p className="text-muted-foreground">
                    Veja seu histórico de pedidos e rastreie entregas
                  </p>
                </div>
              </Link>
              
              <Link href="/products">
                <div className="bg-background rounded-xl p-8 hover:shadow-lg transition-shadow" data-testid="card-browse-link">
                  <h3 className="font-serif text-2xl font-semibold mb-2">Ver Todos</h3>
                  <p className="text-muted-foreground">
                    Descubra nossa coleção completa de cupcakes
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
