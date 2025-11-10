import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import type { User, PreassignedRole } from "@shared/schema";
import { Trash2, UserPlus, Edit } from "lucide-react";

export default function Admin() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [newUserDialogOpen, setNewUserDialogOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserFirstName, setNewUserFirstName] = useState("");
  const [newUserLastName, setNewUserLastName] = useState("");
  const [newUserPhoneNumber, setNewUserPhoneNumber] = useState("");
  const [newUserAddress, setNewUserAddress] = useState("");
  const [newUserRole, setNewUserRole] = useState<string>("client");
  
  // Edit user states
  const [editUserDialogOpen, setEditUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editUserFirstName, setEditUserFirstName] = useState("");
  const [editUserLastName, setEditUserLastName] = useState("");
  const [editUserEmail, setEditUserEmail] = useState("");
  const [editUserPhoneNumber, setEditUserPhoneNumber] = useState("");
  const [editUserAddress, setEditUserAddress] = useState("");
  const [editUserRole, setEditUserRole] = useState<string>("client");

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

  const { data: preassignedRoles } = useQuery<PreassignedRole[]>({
    queryKey: ["/api/admin/preassigned-roles"],
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

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: any }) => {
      return await apiRequest("PATCH", `/api/admin/users/${userId}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Usuário atualizado",
        description: "Dados do usuário foram alterados com sucesso. SMS enviado se telefone fornecido.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setEditUserDialogOpen(false);
      setEditingUser(null);
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
        description: error.message || "Falha ao atualizar usuário",
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

  const createPreassignedRoleMutation = useMutation({
    mutationFn: async ({ email, firstName, lastName, phoneNumber, address, role }: { email: string; firstName?: string; lastName?: string; phoneNumber?: string; address?: string; role: string }) => {
      return await apiRequest("POST", "/api/admin/preassigned-roles", { email, firstName, lastName, phoneNumber, address, role });
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Usuário pré-cadastrado",
        description: variables.phoneNumber ? "Usuário receberá SMS com instruções de acesso" : "Usuário receberá este perfil no primeiro login",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/preassigned-roles"] });
      setNewUserDialogOpen(false);
      setNewUserEmail("");
      setNewUserFirstName("");
      setNewUserLastName("");
      setNewUserPhoneNumber("");
      setNewUserAddress("");
      setNewUserRole("client");
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
        description: error.message || "Falha ao pré-cadastrar usuário",
        variant: "destructive",
      });
    },
  });

  const deletePreassignedRoleMutation = useMutation({
    mutationFn: async (roleId: number) => {
      return await apiRequest("DELETE", `/api/admin/preassigned-roles/${roleId}`, {});
    },
    onSuccess: () => {
      toast({
        title: "Pré-cadastro removido",
        description: "Atribuição de perfil foi removida",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/preassigned-roles"] });
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
        description: error.message || "Falha ao remover pré-cadastro",
        variant: "destructive",
      });
    },
  });

  const handleCreatePreassignedRole = () => {
    if (!newUserEmail || !newUserRole) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o email e selecione um nível de acesso",
        variant: "destructive",
      });
      return;
    }
    createPreassignedRoleMutation.mutate({ 
      email: newUserEmail,
      phoneNumber: newUserPhoneNumber, 
      address: newUserAddress || undefined,
      firstName: newUserFirstName || undefined,
      lastName: newUserLastName || undefined,
      role: newUserRole 
    });
  };

  const handleOpenEditUser = (userItem: User) => {
    setEditingUser(userItem);
    setEditUserFirstName(userItem.firstName || "");
    setEditUserLastName(userItem.lastName || "");
    setEditUserEmail(userItem.email);
    setEditUserPhoneNumber(userItem.phoneNumber || "");
    setEditUserAddress(userItem.address || "");
    setEditUserRole(userItem.role);
    setEditUserDialogOpen(true);
  };

  const handleUpdateUser = () => {
    if (!editingUser) return;
    
    if (!editUserEmail) {
      toast({
        title: "Campo obrigatório",
        description: "Email é obrigatório",
        variant: "destructive",
      });
      return;
    }
    
    updateUserMutation.mutate({
      userId: editingUser.id,
      data: {
        firstName: editUserFirstName || undefined,
        lastName: editUserLastName || undefined,
        email: editUserEmail,
        phoneNumber: editUserPhoneNumber || undefined,
        address: editUserAddress || undefined,
        role: editUserRole,
      },
    });
  };

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
          Painel de Administração
        </h1>

        {/* Preassigned Roles Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl font-semibold">Cadastrar Novo Usuário</h2>
            <Dialog open={newUserDialogOpen} onOpenChange={setNewUserDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-user">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Adicionar Usuário
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Pré-cadastrar Novo Usuário</DialogTitle>
                  <DialogDescription>
                    O usuário receberá o perfil e informações automaticamente no primeiro login.
                    A senha será criada pelo usuário através do Replit Auth.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nome</Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="João"
                      value={newUserFirstName}
                      onChange={(e) => setNewUserFirstName(e.target.value)}
                      data-testid="input-new-user-firstname"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Sobrenome</Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Silva"
                      value={newUserLastName}
                      onChange={(e) => setNewUserLastName(e.target.value)}
                      data-testid="input-new-user-lastname"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="usuario@exemplo.com"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      data-testid="input-new-user-email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Telefone (opcional)</Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      placeholder="(11) 98765-4321"
                      value={newUserPhoneNumber}
                      onChange={(e) => setNewUserPhoneNumber(e.target.value)}
                      data-testid="input-new-user-phone"
                    />
                    <p className="text-xs text-muted-foreground">
                      Se fornecido, enviará SMS com instruções de acesso
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Endereço (opcional)</Label>
                    <Input
                      id="address"
                      type="text"
                      placeholder="Rua Exemplo, 123 - Bairro - Cidade/UF"
                      value={newUserAddress}
                      onChange={(e) => setNewUserAddress(e.target.value)}
                      data-testid="input-new-user-address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Nível de Acesso</Label>
                    <Select value={newUserRole} onValueChange={setNewUserRole}>
                      <SelectTrigger data-testid="select-new-user-role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="client">Cliente</SelectItem>
                        <SelectItem value="employee">Funcionário</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setNewUserDialogOpen(false)}
                      data-testid="button-cancel-new-user"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleCreatePreassignedRole}
                      disabled={createPreassignedRoleMutation.isPending}
                      data-testid="button-save-new-user"
                    >
                      {createPreassignedRoleMutation.isPending ? "Salvando..." : "Cadastrar"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-3">
            {preassignedRoles && preassignedRoles.length > 0 ? (
              preassignedRoles.map((preassigned) => (
                <Card key={preassigned.id} className="p-4" data-testid={`card-preassigned-${preassigned.id}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        {(preassigned.firstName || preassigned.lastName) && (
                          <p className="font-semibold" data-testid={`text-preassigned-name-${preassigned.id}`}>
                            {preassigned.firstName} {preassigned.lastName}
                          </p>
                        )}
                        <p className={`${preassigned.firstName || preassigned.lastName ? 'text-sm text-muted-foreground' : 'font-medium'}`} data-testid={`text-preassigned-email-${preassigned.id}`}>
                          {preassigned.email}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getRoleBadgeColor(preassigned.role)} data-testid={`badge-preassigned-role-${preassigned.id}`}>
                            {preassigned.role === "client" ? "Cliente" :
                             preassigned.role === "employee" ? "Funcionário" :
                             preassigned.role === "admin" ? "Administrador" : preassigned.role}
                          </Badge>
                          {preassigned.consumed && (
                            <Badge variant="outline" className="text-xs">
                              Aplicado
                            </Badge>
                          )}
                          {!preassigned.consumed && (
                            <span className="text-xs text-muted-foreground">
                              Aguardando primeiro login
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => deletePreassignedRoleMutation.mutate(preassigned.id)}
                      disabled={deletePreassignedRoleMutation.isPending}
                      data-testid={`button-delete-preassigned-${preassigned.id}`}
                      title="Remover pré-cadastro"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4 text-sm" data-testid="text-no-preassigned">
                Nenhum usuário pré-cadastrado
              </p>
            )}
          </div>
        </section>

        {/* Edit User Dialog */}
        <Dialog open={editUserDialogOpen} onOpenChange={setEditUserDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Usuário</DialogTitle>
              <DialogDescription>
                Altere os dados do usuário. Um SMS será enviado se telefone fornecido.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-firstName">Nome</Label>
                <Input
                  id="edit-firstName"
                  type="text"
                  placeholder="João"
                  value={editUserFirstName}
                  onChange={(e) => setEditUserFirstName(e.target.value)}
                  data-testid="input-edit-user-firstname"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-lastName">Sobrenome</Label>
                <Input
                  id="edit-lastName"
                  type="text"
                  placeholder="Silva"
                  value={editUserLastName}
                  onChange={(e) => setEditUserLastName(e.target.value)}
                  data-testid="input-edit-user-lastname"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  placeholder="usuario@exemplo.com"
                  value={editUserEmail}
                  onChange={(e) => setEditUserEmail(e.target.value)}
                  data-testid="input-edit-user-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phoneNumber">Telefone (opcional)</Label>
                <Input
                  id="edit-phoneNumber"
                  type="tel"
                  placeholder="(11) 98765-4321"
                  value={editUserPhoneNumber}
                  onChange={(e) => setEditUserPhoneNumber(e.target.value)}
                  data-testid="input-edit-user-phone"
                />
                <p className="text-xs text-muted-foreground">
                  Se fornecido, enviará SMS notificando atualização
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-address">Endereço (opcional)</Label>
                <Input
                  id="edit-address"
                  type="text"
                  placeholder="Rua Exemplo, 123 - Bairro - Cidade/UF"
                  value={editUserAddress}
                  onChange={(e) => setEditUserAddress(e.target.value)}
                  data-testid="input-edit-user-address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">Nível de Acesso *</Label>
                <Select value={editUserRole} onValueChange={setEditUserRole}>
                  <SelectTrigger data-testid="select-edit-user-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">Cliente</SelectItem>
                    <SelectItem value="employee">Funcionário</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditUserDialogOpen(false);
                    setEditingUser(null);
                  }}
                  data-testid="button-cancel-edit-user"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleUpdateUser}
                  disabled={updateUserMutation.isPending}
                  data-testid="button-save-edit-user"
                >
                  {updateUserMutation.isPending ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Existing Users Section */}
        <section>
          <h2 className="font-serif text-2xl font-semibold mb-6">Usuários Existentes</h2>
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEditUser(userItem)}
                      disabled={updateUserMutation.isPending}
                      data-testid={`button-edit-user-${userItem.id}`}
                      title="Editar usuário"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    
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
        </section>
      </main>
    </div>
  );
}
