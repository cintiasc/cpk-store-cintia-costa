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
import { formatCurrency } from "@/lib/formatters";

export default function Checkout() {
  const { user, isLoading: authLoading } = useAuth();
  const { items, getTotalAmount, clearCart } = useCart();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Não autorizado",
        description: "Você foi desconectado. Fazendo login novamente...",
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
        title: "Pedido realizado com sucesso!",
        description: "Seu pedido foi recebido e está sendo preparado.",
      });
      setLocation("/orders");
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Não autorizado",
          description: "Você foi desconectado. Fazendo login novamente...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erro",
        description: error.message || "Falha ao realizar pedido",
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
              Seu Carrinho está Vazio
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              Adicione alguns cupcakes ao seu carrinho antes de finalizar a compra
            </p>
            <Button asChild size="lg">
              <a href="/products">Ver Produtos</a>
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
          Finalizar Compra
        </h1>

        <div className="max-w-3xl mx-auto">
          <Card className="p-8 mb-6">
            <h2 className="font-serif text-2xl font-semibold mb-6">Resumo do Pedido</h2>
            
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item.product.id} className="flex justify-between" data-testid={`item-summary-${item.product.id}`}>
                  <div>
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Quantidade: {item.quantity} × {formatCurrency(item.product.price)}
                    </p>
                  </div>
                  <p className="font-semibold">
                    {formatCurrency(parseFloat(item.product.price) * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-lg">
                <span className="font-medium">Subtotal</span>
                <span data-testid="text-checkout-subtotal">
                  {formatCurrency(getTotalAmount())}
                </span>
              </div>
              <div className="flex justify-between text-lg">
                <span className="font-medium">Entrega</span>
                <span className="text-muted-foreground">Grátis</span>
              </div>
              <div className="flex justify-between font-serif text-2xl font-bold pt-2">
                <span>Total</span>
                <span data-testid="text-checkout-total">
                  {formatCurrency(getTotalAmount())}
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-8">
            <h2 className="font-serif text-2xl font-semibold mb-4">Informações de Entrega</h2>
            <div className="space-y-2 mb-6">
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">Nome:</span>{" "}
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">Email:</span>{" "}
                {user?.email}
              </p>
            </div>

            <div className="border-t pt-6">
              <p className="text-sm text-muted-foreground mb-6">
                Ao realizar este pedido, você concorda com nossos Termos de Serviço e Política de Privacidade.
                Seu pedido será preparado fresquinho e entregue em até 24 horas.
              </p>

              <Button
                className="w-full"
                size="lg"
                onClick={() => orderMutation.mutate()}
                disabled={orderMutation.isPending}
                data-testid="button-place-order"
              >
                {orderMutation.isPending ? "Realizando Pedido..." : "Realizar Pedido"}
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
