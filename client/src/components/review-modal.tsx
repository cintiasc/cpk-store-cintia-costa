import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Product } from "@shared/schema";

interface ReviewModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export function ReviewModal({ product, isOpen, onClose }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const { toast } = useToast();

  const reviewMutation = useMutation({
    mutationFn: async (data: { rating: number; comment?: string }) => {
      const response = await apiRequest("POST", `/api/products/${product.id}/reviews`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Avaliação enviada",
        description: "Obrigado pela sua avaliação!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products", product.id, "reviews"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products", product.id, "can-review"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products", product.id] });
      setRating(0);
      setComment("");
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao enviar avaliação",
        description: error.message || "Tente novamente mais tarde",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast({
        title: "Avaliação obrigatória",
        description: "Por favor, selecione uma avaliação",
        variant: "destructive",
      });
      return;
    }
    reviewMutation.mutate({ rating, comment: comment || undefined });
  };

  const handleClose = () => {
    setRating(0);
    setComment("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent data-testid="dialog-review-modal">
        <DialogHeader>
          <DialogTitle data-testid="text-review-modal-title">
            Avaliar {product.name}
          </DialogTitle>
          <DialogDescription>
            Compartilhe sua opinião sobre este produto
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Sua Avaliação
            </label>
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
              Comentário (opcional)
            </label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Compartilhe sua opinião sobre este cupcake..."
              className="min-h-24"
              data-testid="input-review-comment"
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              data-testid="button-cancel-review"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={reviewMutation.isPending}
              data-testid="button-submit-review"
            >
              {reviewMutation.isPending ? "Enviando..." : "Enviar Avaliação"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
