import { Link } from "wouter";
import { Trash2, Minus, Plus } from "lucide-react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCart } from "@/hooks/useCart";

export default function Cart() {
  const { items, updateQuantity, removeItem, getTotalAmount } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="text-center py-20">
            <h1 className="font-serif text-4xl font-bold mb-4" data-testid="text-empty-cart-title">
              Your Cart is Empty
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              Add some delicious cupcakes to get started!
            </p>
            <Button asChild size="lg" data-testid="button-browse-products">
              <Link href="/products">Browse Products</Link>
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
        <h1 className="font-serif text-4xl font-bold mb-8" data-testid="text-cart-title">
          Shopping Cart
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4" data-testid="list-cart-items">
            {items.map((item) => (
              <Card key={item.product.id} className="p-6" data-testid={`card-cart-item-${item.product.id}`}>
                <div className="flex gap-4">
                  <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    {item.product.imageUrl ? (
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground text-xs">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between gap-4">
                      <div>
                        <Link href={`/products/${item.product.id}`}>
                          <h3 className="font-serif font-semibold text-lg hover:text-primary" data-testid={`text-cart-item-name-${item.product.id}`}>
                            {item.product.name}
                          </h3>
                        </Link>
                        <p className="text-muted-foreground" data-testid={`text-cart-item-price-${item.product.id}`}>
                          ${parseFloat(item.product.price).toFixed(2)} each
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.product.id)}
                        data-testid={`button-remove-item-${item.product.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        data-testid={`button-decrease-${item.product.id}`}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-12 text-center font-medium" data-testid={`text-quantity-${item.product.id}`}>
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        data-testid={`button-increase-${item.product.id}`}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <span className="ml-auto font-serif text-xl font-bold" data-testid={`text-item-total-${item.product.id}`}>
                        ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-20">
              <h2 className="font-serif text-2xl font-bold mb-6">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span data-testid="text-subtotal">
                    ${getTotalAmount().toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>

              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between font-serif text-2xl font-bold">
                  <span>Total</span>
                  <span data-testid="text-total">
                    ${getTotalAmount().toFixed(2)}
                  </span>
                </div>
              </div>

              <Button asChild className="w-full" size="lg" data-testid="button-checkout">
                <Link href="/checkout">Proceed to Checkout</Link>
              </Button>

              <Button asChild variant="outline" className="w-full mt-2" data-testid="button-continue-shopping">
                <Link href="/products">Continue Shopping</Link>
              </Button>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
