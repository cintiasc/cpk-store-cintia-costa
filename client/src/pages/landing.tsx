import { Button } from "@/components/ui/button";
import { ShoppingBag, Star, Truck } from "lucide-react";
import heroImage from "@assets/generated_images/Hero_cupcake_assortment_overhead_05ca111d.png";

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.5)), url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        
        <div className="relative z-10 container mx-auto px-4 py-20 text-center">
          <h1 className="font-serif text-5xl md:text-7xl font-bold text-white mb-6" data-testid="text-hero-title">
            Cupcakes Artesanais,
            <br />
            Entregues Fresquinhos
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
            Delicie-se com nossos cupcakes premium feitos com amor e os melhores ingredientes.
            Peça online para entrega ou retirada.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              asChild 
              size="lg" 
              className="text-lg px-8 backdrop-blur-md bg-white/90 text-foreground hover:bg-white"
              data-testid="button-hero-login"
            >
              <a href="/api/login">Começar</a>
            </Button>
            <Button 
              asChild 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 backdrop-blur-md bg-white/10 text-white border-white/30 hover:bg-white/20"
              data-testid="button-hero-learn-more"
            >
              <a href="#features">Saiba Mais</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="font-serif text-4xl font-bold text-center mb-12">
            Por Que Escolher a Gente
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-semibold mb-2">
                Qualidade Premium
              </h3>
              <p className="text-muted-foreground">
                Cada cupcake é feito artesanalmente com ingredientes premium e atenção aos detalhes
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-semibold mb-2">
                Entrega Rápida
              </h3>
              <p className="text-muted-foreground">
                Cupcakes frescos entregues na sua porta, ou prontos para retirada em poucas horas
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-semibold mb-2">
                Favorito dos Clientes
              </h3>
              <p className="text-muted-foreground">
                Amado por milhares de clientes pelos nossos sabores únicos e designs lindos
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-4xl font-bold mb-4">
            Pronto para se deliciar?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Entre para navegar pela nossa deliciosa seleção e fazer seu primeiro pedido
          </p>
          <Button asChild size="lg" className="text-lg px-8" data-testid="button-cta-login">
            <a href="/api/login">Entrar para Pedir</a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 Cupcake Store. Todos os direitos reservados.</p>
          <p className="mt-2">
            Ao usar nosso serviço, você concorda com nossos Termos de Serviço e Política de Privacidade (em conformidade com a LGPD)
          </p>
        </div>
      </footer>
    </div>
  );
}
