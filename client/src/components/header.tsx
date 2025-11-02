import { Link, useLocation } from "wouter";
import { ShoppingCart, User, LogOut, LayoutDashboard, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function Header() {
  const [location] = useLocation();
  const { user, isEmployee, isAdmin } = useAuth();
  const itemCount = useCart((state) => state.getItemCount());

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" data-testid="link-home">
          <h1 className="font-serif text-2xl font-semibold text-foreground">
            Cupcake Store
          </h1>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/products" data-testid="link-products">
            <span className={`text-sm font-medium transition-colors hover:text-primary ${location === '/products' ? 'text-foreground' : 'text-muted-foreground'}`}>
              Produtos
            </span>
          </Link>
          {user && (
            <Link href="/orders" data-testid="link-orders">
              <span className={`text-sm font-medium transition-colors hover:text-primary ${location === '/orders' ? 'text-foreground' : 'text-muted-foreground'}`}>
                Meus Pedidos
              </span>
            </Link>
          )}
          {isEmployee && (
            <Link href="/dashboard" data-testid="link-dashboard">
              <span className={`text-sm font-medium transition-colors hover:text-primary ${location === '/dashboard' ? 'text-foreground' : 'text-muted-foreground'}`}>
                Painel
              </span>
            </Link>
          )}
          {isAdmin && (
            <Link href="/admin" data-testid="link-admin">
              <span className={`text-sm font-medium transition-colors hover:text-primary ${location === '/admin' ? 'text-foreground' : 'text-muted-foreground'}`}>
                Admin
              </span>
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative" data-testid="button-cart">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <Badge 
                  className="absolute -right-1 -top-1 h-5 min-w-5 px-1 flex items-center justify-center text-xs"
                  data-testid="badge-cart-count"
                >
                  {itemCount}
                </Badge>
              )}
            </Button>
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="button-user-menu">
                  {user.profileImageUrl ? (
                    <img 
                      src={user.profileImageUrl} 
                      alt="Perfil" 
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium" data-testid="text-user-name">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground" data-testid="text-user-email">
                    {user.email}
                  </p>
                </div>
                <DropdownMenuSeparator />
                {isEmployee && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" data-testid="menu-dashboard">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Painel
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem asChild>
                  <a href="/api/logout" data-testid="button-logout">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" data-testid="link-forgot-password">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Esqueci minha senha
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Recuperar Senha</DialogTitle>
                    <DialogDescription>
                      A recuperação de senha é gerenciada através do Replit Auth.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <p className="text-sm text-muted-foreground">
                      Para recuperar sua senha, siga estes passos:
                    </p>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>Clique no botão "Entrar" para ir à tela de login</li>
                      <li>Na tela de login do Replit, clique em <strong>"Forgot password?"</strong></li>
                      <li>Siga as instruções enviadas para seu email</li>
                    </ol>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button asChild data-testid="button-goto-login">
                        <a href="/api/login">Ir para Login</a>
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button asChild data-testid="button-login">
                <a href="/api/login">Entrar</a>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
