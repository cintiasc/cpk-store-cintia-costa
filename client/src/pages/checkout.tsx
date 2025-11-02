import { useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";

export default function Checkout() {
  const { user, isLoading: authLoading } = useAuth();
  const { items, getTotalAmount, clearCart } = useCart();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [authLoading, user, toast]);

  const orderMutation = useMutation({
    mutationFn: async () => {
      const orderItems = items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        priceAtPurchase: item.product.price,
      }));

      return await apiRequest("POST", "/api/orders", {
        items: orderItems,
        totalAmount: getTotalAmount().toFixed(2),
      });
    },
    onSuccess: () => {
      clearCart();
      toast({
        title: "Order placed successfully!",
        description: "Your order has been received and is being prepared.",
      });
      setLocation("/orders");
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to place order",
        variant: "destructive",
      });
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="h-96 bg-muted animate-pulse rounded-xl" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="text-center py-20">
            <h1 className="font-serif text-4xl font-bold mb-4">
              Your Cart is Empty
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              Add some cupcakes to your cart before checking out
            </p>
            <Button asChild size="lg">
              <a href="/products">Browse Products</a>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <h1 className="font-serif text-4xl font-bold mb-8" data-testid="text-checkout-title">
          Checkout
        </h1>

        <div className="max-w-3xl mx-auto">
          <Card className="p-8 mb-6">
            <h2 className="font-serif text-2xl font-semibold mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item.product.id} className="flex justify-between" data-testid={`item-summary-${item.product.id}`}>
                  <div>
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Quantity: {item.quantity} × ${parseFloat(item.product.price).toFixed(2)}
                    </p>
                  </div>
                  <p className="font-semibold">
                    ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-lg">
                <span className="font-medium">Subtotal</span>
                <span data-testid="text-checkout-subtotal">
                  ${getTotalAmount().toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-lg">
                <span className="font-medium">Delivery</span>
                <span className="text-muted-foreground">Free</span>
              </div>
              <div className="flex justify-between font-serif text-2xl font-bold pt-2">
                <span>Total</span>
                <span data-testid="text-checkout-total">
                  ${getTotalAmount().toFixed(2)}
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-8">
            <h2 className="font-serif text-2xl font-semibold mb-4">Delivery Information</h2>
            <div className="space-y-2 mb-6">
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">Name:</span>{" "}
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">Email:</span>{" "}
                {user?.email}
              </p>
            </div>

            <div className="border-t pt-6">
              <p className="text-sm text-muted-foreground mb-6">
                By placing this order, you agree to our Terms of Service and Privacy Policy.
                Your order will be prepared fresh and delivered within 24 hours.
              </p>

              <Button
                className="w-full"
                size="lg"
                onClick={() => orderMutation.mutate()}
                disabled={orderMutation.isPending}
                data-testid="button-place-order"
              >
                {orderMutation.isPending ? "Placing Order..." : "Place Order"}
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
