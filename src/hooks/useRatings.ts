import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface RatingStats {
  menuItemId: string;
  averageRating: number;
  totalRatings: number;
}

// Fetch average ratings for all menu items
export function useMenuItemRatings() {
  return useQuery({
    queryKey: ["menu-item-ratings"],
    queryFn: async () => {
      const stats = await api.get<Record<string, RatingStats>>("/ratings/menu");
      return stats;
    },
    staleTime: 30000,
  });
}

// Fetch user's ratings
export function useUserRatings() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-ratings", user?.id],
    queryFn: async () => {
      if (!user) return {};
      const ratings = await api.get<Record<string, number>>(`/ratings/user?userId=${user.id}`);
      return ratings;
    },
    enabled: !!user,
  });
}

// Submit or update a rating
export function useSubmitRating() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ menuItemId, rating }: { menuItemId: string; rating: number }) => {
      if (!user) throw new Error("Must be logged in to rate");
      await api.post("/ratings", {
        userId: user.id,
        menuItemId,
        rating,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-item-ratings"] });
      queryClient.invalidateQueries({ queryKey: ["user-ratings"] });
      toast.success("Rating submitted!");
    },
    onError: () => {
      toast.error("Failed to submit rating");
    },
  });
}

// Delete a rating
export function useDeleteRating() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (menuItemId: string) => {
      if (!user) throw new Error("Must be logged in");
      await api.delete("/ratings", {
        body: JSON.stringify({ userId: user.id, menuItemId }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-item-ratings"] });
      queryClient.invalidateQueries({ queryKey: ["user-ratings"] });
      toast.success("Rating removed");
    },
    onError: () => {
      toast.error("Failed to remove rating");
    },
  });
}
