import { Link, useLocation } from "wouter";
import { ShoppingCart, User, LogOut, LayoutDashboard } from "lucide-react";
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
              Products
            </span>
          </Link>
          {user && (
            <Link href="/orders" data-testid="link-orders">
              <span className={`text-sm font-medium transition-colors hover:text-primary ${location === '/orders' ? 'text-foreground' : 'text-muted-foreground'}`}>
                My Orders
              </span>
            </Link>
          )}
          {isEmployee && (
            <Link href="/dashboard" data-testid="link-dashboard">
              <span className={`text-sm font-medium transition-colors hover:text-primary ${location === '/dashboard' ? 'text-foreground' : 'text-muted-foreground'}`}>
                Dashboard
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
                      alt="Profile" 
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
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem asChild>
                  <a href="/api/logout" data-testid="button-logout">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log Out
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild data-testid="button-login">
              <a href="/api/login">Log In</a>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
