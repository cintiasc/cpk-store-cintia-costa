import { Link } from "wouter";
import { Star, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ProductWithRating } from "@shared/schema";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  product: ProductWithRating;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCart((state) => state.addItem);
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product, 1);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
    });
  };

  const averageRating = product.averageRating || 0;
  const reviewCount = product.reviewCount || 0;

  return (
    <Link href={`/products/${product.id}`}>
      <Card 
        className="group overflow-hidden transition-all hover:shadow-lg" 
        data-testid={`card-product-${product.id}`}
      >
        <div className="aspect-square overflow-hidden bg-muted">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
              data-testid={`img-product-${product.id}`}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              No image
            </div>
          )}
        </div>

        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-serif text-lg font-semibold line-clamp-1" data-testid={`text-product-name-${product.id}`}>
              {product.name}
            </h3>
            {product.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {product.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-primary text-primary" />
            <span className="text-sm font-medium" data-testid={`text-rating-${product.id}`}>
              {averageRating > 0 ? averageRating.toFixed(1) : "New"}
            </span>
            {reviewCount > 0 && (
              <span className="text-sm text-muted-foreground">
                ({reviewCount})
              </span>
            )}
          </div>

          <div className="flex items-center justify-between gap-2">
            <p className="font-serif text-2xl font-bold" data-testid={`text-price-${product.id}`}>
              ${parseFloat(product.price).toFixed(2)}
            </p>
            <Button 
              size="icon" 
              onClick={handleAddToCart}
              data-testid={`button-add-to-cart-${product.id}`}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </Link>
  );
}
