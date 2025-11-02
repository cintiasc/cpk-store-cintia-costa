import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Product, OrderWithItems } from "@shared/schema";
import { Pencil, Trash2, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { z } from "zod";
import { formatCurrency } from "@/lib/formatters";

type ProductFormData = z.infer<typeof insertProductSchema>;

export default function Dashboard() {
  const { user, isEmployee, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || !isEmployee)) {
      toast({
        title: "Não Autorizado",
        description: "Você não tem acesso a esta página",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    }
  }, [authLoading, user, isEmployee, toast]);

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    enabled: !!user && isEmployee,
  });

  const { data: orders, isLoading: ordersLoading } = useQuery<OrderWithItems[]>({
    queryKey: ["/api/dashboard/orders"],
    enabled: !!user && isEmployee,
  });

  const form = useForm<ProductFormData>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "0.00",
      imageUrl: "",
    },
  });

  const productMutation = useMutation({
    mutationFn: async (data: ProductFormData & { id?: number }) => {
      if (data.id) {
        return await apiRequest("PUT", `/api/products/${data.id}`, data);
      } else {
        return await apiRequest("POST", "/api/products", data);
      }
    },
    onSuccess: () => {
      toast({
        title: editingProduct ? "Produto atualizado" : "Produto criado",
        description: "Alterações salvas com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setProductDialogOpen(false);
      setEditingProduct(null);
      form.reset();
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Não Autorizado",
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
        description: error.message || "Falha ao salvar produto",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (productId: number) => {
      return await apiRequest("DELETE", `/api/products/${productId}`, {});
    },
    onSuccess: () => {
      toast({
        title: "Produto excluído",
        description: "Produto foi removido",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Não Autorizado",
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
        description: error.message || "Falha ao excluir produto",
        variant: "destructive",
      });
    },
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      return await apiRequest("PATCH", `/api/orders/${orderId}/status`, { status });
    },
    onSuccess: () => {
      toast({
        title: "Pedido atualizado",
        description: "Status do pedido foi alterado",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/orders"] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Não Autorizado",
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
        description: error.message || "Falha ao atualizar pedido",
        variant: "destructive",
      });
    },
  });

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    form.reset({
      name: product.name,
      description: product.description || "",
      price: product.price,
      imageUrl: product.imageUrl || "",
    });
    setProductDialogOpen(true);
  };

  const handleNewProduct = () => {
    setEditingProduct(null);
    form.reset({
      name: "",
      description: "",
      price: "0.00",
      imageUrl: "",
    });
    setProductDialogOpen(true);
  };

  const onSubmit = (data: ProductFormData) => {
    productMutation.mutate({ ...data, id: editingProduct?.id });
  };

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

  if (authLoading || productsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="h-96 bg-muted animate-pulse rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <h1 className="font-serif text-4xl font-bold mb-8" data-testid="text-dashboard-title">
          Painel do Funcionário
        </h1>

        {/* Products Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl font-semibold">Produtos</h2>
            <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleNewProduct} data-testid="button-add-product">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Produto
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingProduct ? "Editar Produto" : "Adicionar Novo Produto"}
                  </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-product-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição</FormLabel>
                          <FormControl>
                            <Textarea {...field} data-testid="input-product-description" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preço</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" step="0.01" data-testid="input-product-price" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL da Imagem</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-product-image-url" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setProductDialogOpen(false)}
                        data-testid="button-cancel-product"
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={productMutation.isPending} data-testid="button-save-product">
                        {productMutation.isPending ? "Salvando..." : "Salvar Produto"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products && products.length > 0 ? (
              products.map((product) => (
                <Card key={product.id} className="p-4" data-testid={`card-product-manage-${product.id}`}>
                  <div className="flex gap-4">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground text-xs">
                          Sem imagem
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{product.name}</h3>
                      <p className="font-serif text-lg font-bold">{formatCurrency(product.price)}</p>
                      <div className="flex gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEditProduct(product)}
                          data-testid={`button-edit-product-${product.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => deleteMutation.mutate(product.id)}
                          disabled={deleteMutation.isPending}
                          data-testid={`button-delete-product-${product.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <p className="text-muted-foreground col-span-full text-center py-8" data-testid="text-no-products">
                Nenhum produto ainda. Adicione seu primeiro produto!
              </p>
            )}
          </div>
        </section>

        {/* Orders Queue Section */}
        <section>
          <h2 className="font-serif text-2xl font-semibold mb-6">Fila de Pedidos</h2>
          <div className="space-y-4">
            {ordersLoading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
              ))
            ) : orders && orders.length > 0 ? (
              orders.map((order) => (
                <Card key={order.id} className="p-6" data-testid={`card-order-queue-${order.id}`}>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-serif text-lg font-semibold">
                          Pedido #{order.id}
                        </h3>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status === "pending" ? "Pendente" :
                           order.status === "in_preparation" ? "Em Preparação" :
                           order.status === "ready_for_delivery" ? "Pronto para Entrega" :
                           order.status === "delivered" ? "Entregue" : order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Cliente: {order.user.firstName} {order.user.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.items.length} {order.items.length !== 1 ? 'itens' : 'item'} • 
                        {formatCurrency(order.totalAmount)} • 
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Select
                        value={order.status}
                        onValueChange={(value) =>
                          updateOrderStatusMutation.mutate({ orderId: order.id, status: value })
                        }
                      >
                        <SelectTrigger className="w-48" data-testid={`select-order-status-${order.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pendente</SelectItem>
                          <SelectItem value="in_preparation">Em Preparação</SelectItem>
                          <SelectItem value="ready_for_delivery">Pronto para Entrega</SelectItem>
                          <SelectItem value="delivered">Entregue</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-8" data-testid="text-no-orders">
                Nenhum pedido na fila
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
