import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReviewModal } from "@/components/review-modal";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { OrderWithItems, Product } from "@shared/schema";
import { RotateCcw, Star } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";

export default function Orders() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const clearCart = useCart((state) => state.clearCart);
  const addItem = useCart((state) => state.addItem);
  const [reviewProduct, setReviewProduct] = useState<Product | null>(null);

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

  const { data: orders, isLoading } = useQuery<OrderWithItems[]>({
    queryKey: ["/api/orders"],
    enabled: !!user,
  });

  // Get all unique product IDs from all orders
  const productIds = orders?.flatMap(order => 
    order.items.map(item => item.productId)
  ).filter((id, index, self) => self.indexOf(id) === index) || [];

  // Check review eligibility for each product
  const reviewEligibility = useQuery<Record<number, boolean>>({
    queryKey: ["/api/products/can-review", productIds],
    queryFn: async () => {
      if (!user || productIds.length === 0) return {};
      
      const results: Record<number, boolean> = {};
      await Promise.all(
        productIds.map(async (productId) => {
          try {
            const response = await fetch(`/api/products/${productId}/can-review`);
            const data = await response.json();
            results[productId] = data.canReview;
          } catch {
            results[productId] = false;
          }
        })
      );
      return results;
    },
    enabled: !!user && productIds.length > 0,
  });

  const repeatOrderMutation = useMutation({
    mutationFn: async (orderId: number) => {
      const response = await apiRequest("POST", `/api/orders/${orderId}/repeat`, {});
      return await response.json();
    },
    onSuccess: (data: { items: any[] }) => {
      clearCart();
      data.items.forEach((item: any) => {
        addItem(item.product, item.quantity);
      });
      toast({
        title: "Pedido repetido",
        description: "Itens foram adicionados ao seu carrinho",
      });
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
        description: error.message || "Falha ao repetir pedido",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
      case "in_preparation":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
      case "ready_for_delivery":
        return "bg-purple-500/10 text-purple-700 dark:text-purple-400";
      case "delivered":
        return "bg-green-500/10 text-green-700 dark:text-green-400";
      default:
        return "";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendente";
      case "in_preparation":
        return "Em Preparação";
      case "ready_for_delivery":
        return "Pronto para Entrega";
      case "delivered":
        return "Entregue";
      default:
        return status;
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <h1 className="font-serif text-4xl font-bold mb-8" data-testid="text-orders-title">
          Meus Pedidos
        </h1>

        {orders && orders.length > 0 ? (
          <div className="space-y-6" data-testid="list-orders">
            {orders.map((order) => (
              <Card key={order.id} className="p-6" data-testid={`card-order-${order.id}`}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-serif text-xl font-semibold" data-testid={`text-order-number-${order.id}`}>
                        Pedido #{order.id}
                      </h3>
                      <Badge className={getStatusColor(order.status)} data-testid={`badge-status-${order.id}`}>
                        {getStatusLabel(order.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Realizado em {new Date(order.createdAt).toLocaleDateString()} às{" "}
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-serif text-2xl font-bold" data-testid={`text-order-total-${order.id}`}>
                      {formatCurrency(order.totalAmount)}
                    </p>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => repeatOrderMutation.mutate(order.id)}
                      disabled={repeatOrderMutation.isPending}
                      data-testid={`button-repeat-order-${order.id}`}
                      title="Repetir Pedido"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 py-2"
                      data-testid={`order-item-${item.id}`}
                    >
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        {item.product.imageUrl ? (
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-muted-foreground text-xs">
                            Sem imagem
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Quantidade: {item.quantity} × {formatCurrency(item.priceAtPurchase)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-semibold">
                          {formatCurrency(parseFloat(item.priceAtPurchase) * item.quantity)}
                        </p>
                        {reviewEligibility.data?.[item.productId] && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setReviewProduct(item.product)}
                            data-testid={`button-review-product-${item.productId}`}
                          >
                            <Star className="h-4 w-4 mr-2" />
                            Avaliar
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg mb-8" data-testid="text-no-orders">
              Você ainda não fez nenhum pedido.
            </p>
            <Button asChild size="lg" data-testid="button-browse-products">
              <a href="/products">Ver Produtos</a>
            </Button>
          </div>
        )}
      </main>

      {reviewProduct && (
        <ReviewModal
          product={reviewProduct}
          isOpen={!!reviewProduct}
          onClose={() => setReviewProduct(null)}
        />
      )}
    </div>
  );
}
