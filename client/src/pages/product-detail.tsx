import { useEffect } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Star, Minus, Plus } from "lucide-react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ProductWithRating, ReviewWithUser } from "@shared/schema";
import { useState } from "react";

export default function ProductDetail() {
  const [, params] = useRoute("/products/:id");
  const productId = parseInt(params?.id || "0");
  const { user } = useAuth();
  const { toast } = useToast();
  const addItem = useCart((state) => state.addItem);
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const { data: product, isLoading } = useQuery<ProductWithRating>({
    queryKey: ["/api/products", productId],
    enabled: !!productId,
  });

  const { data: reviews } = useQuery<ReviewWithUser[]>({
    queryKey: ["/api/products", productId, "reviews"],
    enabled: !!productId,
  });

  const { data: canReview } = useQuery<{ canReview: boolean }>({
    queryKey: ["/api/products", productId, "can-review"],
    enabled: !!productId && !!user,
  });

  const reviewMutation = useMutation({
    mutationFn: async (data: { rating: number; comment?: string }) => {
      return await apiRequest("POST", `/api/products/${productId}/reviews`, data);
    },
    onSuccess: () => {
      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      });
      setRating(0);
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["/api/products", productId, "reviews"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products", productId, "can-review"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
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
        description: error.message || "Failed to submit review",
        variant: "destructive",
      });
    },
  });

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
      toast({
        title: "Added to cart",
        description: `${quantity} ${product.name}${quantity > 1 ? 's' : ''} added to your cart`,
      });
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a rating",
        variant: "destructive",
      });
      return;
    }
    reviewMutation.mutate({ rating, comment: comment || undefined });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="h-96 bg-muted animate-pulse rounded-xl" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground" data-testid="text-not-found">Product not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="aspect-square rounded-xl overflow-hidden bg-muted">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
                data-testid="img-product-detail"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                No image
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="font-serif text-4xl font-bold mb-2" data-testid="text-product-name">
                {product.name}
              </h1>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-primary text-primary" />
                  <span className="font-medium" data-testid="text-average-rating">
                    {product.averageRating ? product.averageRating.toFixed(1) : "New"}
                  </span>
                </div>
                {product.reviewCount && product.reviewCount > 0 && (
                  <span className="text-muted-foreground">
                    ({product.reviewCount} {product.reviewCount === 1 ? 'review' : 'reviews'})
                  </span>
                )}
              </div>
            </div>

            {product.description && (
              <p className="text-muted-foreground text-lg" data-testid="text-product-description">
                {product.description}
              </p>
            )}

            <div className="border-t pt-6">
              <p className="font-serif text-4xl font-bold mb-6" data-testid="text-product-price">
                ${parseFloat(product.price).toFixed(2)}
              </p>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    data-testid="button-decrease-quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium" data-testid="text-quantity">
                    {quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                    data-testid="button-increase-quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <Button 
                  className="flex-1" 
                  size="lg" 
                  onClick={handleAddToCart}
                  data-testid="button-add-to-cart-detail"
                >
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
          <h2 className="font-serif text-3xl font-bold mb-8">Customer Reviews</h2>

          {/* Review Form */}
          {user && canReview?.canReview && (
            <Card className="p-6 mb-8">
              <h3 className="font-semibold text-lg mb-4">Write a Review</h3>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="focus:outline-none"
                        data-testid={`button-rating-${star}`}
                      >
                        <Star
                          className={`h-8 w-8 transition-colors ${
                            star <= rating
                              ? "fill-primary text-primary"
                              : "text-muted-foreground"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="comment" className="block text-sm font-medium mb-2">
                    Comment (optional)
                  </label>
                  <Textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your thoughts about this cupcake..."
                    className="min-h-24"
                    data-testid="input-review-comment"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={reviewMutation.isPending}
                  data-testid="button-submit-review"
                >
                  {reviewMutation.isPending ? "Submitting..." : "Submit Review"}
                </Button>
              </form>
            </Card>
          )}

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews && reviews.length > 0 ? (
              reviews.map((review) => (
                <Card key={review.id} className="p-6" data-testid={`card-review-${review.id}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium" data-testid={`text-reviewer-${review.id}`}>
                        {review.user.firstName} {review.user.lastName}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? "fill-primary text-primary"
                                : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-muted-foreground" data-testid={`text-review-comment-${review.id}`}>
                      {review.comment}
                    </p>
                  )}
                </Card>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8" data-testid="text-no-reviews">
                No reviews yet. Be the first to review this product!
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
