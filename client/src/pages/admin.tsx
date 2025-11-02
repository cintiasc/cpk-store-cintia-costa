import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import type { User } from "@shared/schema";
import { Trash2 } from "lucide-react";

export default function Admin() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      toast({
        title: "Não Autorizado",
        description: "Você não tem acesso a esta página",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    }
  }, [authLoading, user, isAdmin, toast]);

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: !!user && isAdmin,
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      return await apiRequest("PATCH", `/api/admin/users/${userId}/role`, { role });
    },
    onSuccess: () => {
      toast({
        title: "Papel atualizado",
        description: "Papel do usuário foi alterado com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
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
        description: error.message || "Falha ao atualizar papel do usuário",
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest("DELETE", `/api/admin/users/${userId}`, {});
    },
    onSuccess: () => {
      toast({
        title: "Usuário excluído",
        description: "Usuário foi removido do sistema",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
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
        description: error.message || "Falha ao excluir usuário",
        variant: "destructive",
      });
    },
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500/10 text-red-700 dark:text-red-400";
      case "employee":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
      case "client":
        return "bg-green-500/10 text-green-700 dark:text-green-400";
      default:
        return "";
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
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
        <h1 className="font-serif text-4xl font-bold mb-8" data-testid="text-admin-title">
          Gerenciamento de Usuários
        </h1>

        <div className="space-y-4">
          {users && users.length > 0 ? (
            users.map((userItem) => (
              <Card key={userItem.id} className="p-6" data-testid={`card-user-${userItem.id}`}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-muted flex-shrink-0">
                      {userItem.profileImageUrl ? (
                        <img
                          src={userItem.profileImageUrl}
                          alt={`${userItem.firstName} ${userItem.lastName}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground text-xs">
                          {userItem.firstName?.[0]}{userItem.lastName?.[0]}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold" data-testid={`text-user-name-${userItem.id}`}>
                        {userItem.firstName} {userItem.lastName}
                      </h3>
                      <p className="text-sm text-muted-foreground" data-testid={`text-user-email-${userItem.id}`}>
                        {userItem.email}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getRoleBadgeColor(userItem.role)} data-testid={`badge-user-role-${userItem.id}`}>
                          {userItem.role === "client" ? "Cliente" :
                           userItem.role === "employee" ? "Funcionário" :
                           userItem.role === "admin" ? "Administrador" : userItem.role}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Entrou em {new Date(userItem.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Select
                      value={userItem.role}
                      onValueChange={(value) =>
                        updateRoleMutation.mutate({ userId: userItem.id, role: value })
                      }
                      disabled={userItem.id === user?.id}
                    >
                      <SelectTrigger className="w-40" data-testid={`select-user-role-${userItem.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="client">Cliente</SelectItem>
                        <SelectItem value="employee">Funcionário</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => deleteUserMutation.mutate(userItem.id)}
                      disabled={deleteUserMutation.isPending || userItem.id === user?.id}
                      data-testid={`button-delete-user-${userItem.id}`}
                      title={userItem.id === user?.id ? "Não é possível excluir sua própria conta" : "Excluir usuário"}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8" data-testid="text-no-users">
              Nenhum usuário encontrado
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
