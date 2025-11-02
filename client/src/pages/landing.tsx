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
            Handcrafted Cupcakes,
            <br />
            Delivered Fresh
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
            Indulge in our premium cupcakes made with love and the finest ingredients.
            Order online for delivery or pickup.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              asChild 
              size="lg" 
              className="text-lg px-8 backdrop-blur-md bg-white/90 text-foreground hover:bg-white"
              data-testid="button-hero-login"
            >
              <a href="/api/login">Get Started</a>
            </Button>
            <Button 
              asChild 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 backdrop-blur-md bg-white/10 text-white border-white/30 hover:bg-white/20"
              data-testid="button-hero-learn-more"
            >
              <a href="#features">Learn More</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="font-serif text-4xl font-bold text-center mb-12">
            Why Choose Us
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-semibold mb-2">
                Premium Quality
              </h3>
              <p className="text-muted-foreground">
                Every cupcake is handcrafted with premium ingredients and attention to detail
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-semibold mb-2">
                Fast Delivery
              </h3>
              <p className="text-muted-foreground">
                Fresh cupcakes delivered to your door, or ready for pickup within hours
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-semibold mb-2">
                Customer Favorite
              </h3>
              <p className="text-muted-foreground">
                Loved by thousands of customers for our unique flavors and beautiful designs
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-4xl font-bold mb-4">
            Ready to indulge?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Sign in to browse our delicious selection and place your first order
          </p>
          <Button asChild size="lg" className="text-lg px-8" data-testid="button-cta-login">
            <a href="/api/login">Sign In to Order</a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 Cupcake Store. All rights reserved.</p>
          <p className="mt-2">
            By using our service, you agree to our Terms of Service and Privacy Policy (LGPD compliant)
          </p>
        </div>
      </footer>
    </div>
  );
}
