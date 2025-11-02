import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { OrderWithItems } from "@shared/schema";
import { RotateCcw } from "lucide-react";

export default function Orders() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const clearCart = useCart((state) => state.clearCart);
  const addItem = useCart((state) => state.addItem);

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

  const { data: orders, isLoading } = useQuery<OrderWithItems[]>({
    queryKey: ["/api/orders"],
    enabled: !!user,
  });

  const repeatOrderMutation = useMutation({
    mutationFn: async (orderId: number) => {
      return await apiRequest("POST", `/api/orders/${orderId}/repeat`, {});
    },
    onSuccess: (data: { items: any[] }) => {
      clearCart();
      data.items.forEach((item: any) => {
        addItem(item.product, item.quantity);
      });
      toast({
        title: "Order repeated",
        description: "Items have been added to your cart",
      });
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
        description: error.message || "Failed to repeat order",
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
        return "Pending";
      case "in_preparation":
        return "In Preparation";
      case "ready_for_delivery":
        return "Ready for Delivery";
      case "delivered":
        return "Delivered";
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
          My Orders
        </h1>

        {orders && orders.length > 0 ? (
          <div className="space-y-6" data-testid="list-orders">
            {orders.map((order) => (
              <Card key={order.id} className="p-6" data-testid={`card-order-${order.id}`}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-serif text-xl font-semibold" data-testid={`text-order-number-${order.id}`}>
                        Order #{order.id}
                      </h3>
                      <Badge className={getStatusColor(order.status)} data-testid={`badge-status-${order.id}`}>
                        {getStatusLabel(order.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Placed on {new Date(order.createdAt).toLocaleDateString()} at{" "}
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-serif text-2xl font-bold" data-testid={`text-order-total-${order.id}`}>
                      ${parseFloat(order.totalAmount).toFixed(2)}
                    </p>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => repeatOrderMutation.mutate(order.id)}
                      disabled={repeatOrderMutation.isPending}
                      data-testid={`button-repeat-order-${order.id}`}
                      title="Repeat Order"
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
                            No image
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Quantity: {item.quantity} × ${parseFloat(item.priceAtPurchase).toFixed(2)}
                        </p>
                      </div>
                      <p className="font-semibold">
                        ${(parseFloat(item.priceAtPurchase) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg mb-8" data-testid="text-no-orders">
              You haven't placed any orders yet.
            </p>
            <Button asChild size="lg" data-testid="button-browse-products">
              <a href="/products">Browse Products</a>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
