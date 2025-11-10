import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { User, Mail, Phone, MapPin } from "lucide-react";

export default function Profile() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");

  // Update state when user data loads
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setPhoneNumber(user.phoneNumber || "");
      setAddress(user.address || "");
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { firstName?: string; lastName?: string; phoneNumber?: string; address?: string }) => {
      return await apiRequest("PATCH", "/api/user/profile", data);
    },
    onSuccess: () => {
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao atualizar perfil",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    updateProfileMutation.mutate({
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      phoneNumber: phoneNumber || undefined,
      address: address || undefined,
    });
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            <div className="h-64 bg-muted animate-pulse rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-serif text-4xl font-bold mb-8" data-testid="text-profile-title">
            Meu Perfil
          </h1>

          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>
                Atualize suas informações pessoais e de contato
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">
                    <Mail className="h-4 w-4 inline mr-2" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={user.email}
                    disabled
                    data-testid="input-profile-email"
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    O email não pode ser alterado
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">
                      <User className="h-4 w-4 inline mr-2" />
                      Nome
                    </Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="João"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      data-testid="input-profile-firstname"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">
                      <User className="h-4 w-4 inline mr-2" />
                      Sobrenome
                    </Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Silva"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      data-testid="input-profile-lastname"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">
                    <Phone className="h-4 w-4 inline mr-2" />
                    Telefone
                  </Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="(11) 98765-4321"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    data-testid="input-profile-phone"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">
                    <MapPin className="h-4 w-4 inline mr-2" />
                    Endereço
                  </Label>
                  <Input
                    id="address"
                    type="text"
                    placeholder="Rua Exemplo, 123 - Bairro - Cidade/UF"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    data-testid="input-profile-address"
                  />
                  <p className="text-xs text-muted-foreground">
                    Endereço completo para entregas
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    data-testid="button-save-profile"
                  >
                    {updateProfileMutation.isPending ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Informações da Conta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Nível de acesso:</span>
                <span className="font-medium capitalize" data-testid="text-profile-role">
                  {user.role === "client" ? "Cliente" :
                   user.role === "employee" ? "Funcionário" :
                   user.role === "admin" ? "Administrador" : user.role}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Membro desde:</span>
                <span className="font-medium" data-testid="text-profile-created">
                  {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
