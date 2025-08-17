import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Plus, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";

import SearchBar from "../components/SearchBar";
import CategoryChips from "../components/CategoryChips";
import RecipeGrid from "../components/RecipeGrid";
import EmptyState from "../components/EmptyState";
import AuthSetupNotice from "../components/AuthSetupNotice";
import { getAllRecipes, toggleBookmark, searchRecipes, filterRecipesByMealType } from "../lib/recipes";
import { CategoryFilter, Recipe } from "../types/recipe";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "../context/AuthContext";
import { auth } from "../lib/firebase";

export default function AllMeals() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { authError } = useAuth();

  const { data: recipes = [], isLoading } = useQuery({
    queryKey: ['/api/recipes'],
    queryFn: getAllRecipes,
  });

  const toggleBookmarkMutation = useMutation({
    mutationFn: ({ recipeId, isCurrentlyBookmarked }: { recipeId: string; isCurrentlyBookmarked: boolean }) =>
      toggleBookmark(recipeId, isCurrentlyBookmarked),
    onMutate: async ({ recipeId, isCurrentlyBookmarked }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['/api/recipes'] });
      
      // Snapshot the previous value
      const previousRecipes = queryClient.getQueryData(['/api/recipes']);
      
      // Optimistically update the cache
      queryClient.setQueryData(['/api/recipes'], (old: Recipe[]) => {
        if (!old || !auth.currentUser?.uid) return old;
        
        return old.map(recipe => {
          if (recipe.id === recipeId) {
            const bookmarkedBy = [...recipe.bookmarkedBy];
            if (isCurrentlyBookmarked) {
              // Remove bookmark
              const index = bookmarkedBy.indexOf(auth.currentUser!.uid);
              if (index > -1) bookmarkedBy.splice(index, 1);
            } else {
              // Add bookmark
              if (!bookmarkedBy.includes(auth.currentUser!.uid)) {
                bookmarkedBy.push(auth.currentUser!.uid);
              }
            }
            return { ...recipe, bookmarkedBy };
          }
          return recipe;
        });
      });
      
      return { previousRecipes };
    },
    onError: (err, variables, context) => {
      // Revert on error
      if (context?.previousRecipes) {
        queryClient.setQueryData(['/api/recipes'], context.previousRecipes);
      }
      toast({
        title: "Error",
        description: "Failed to update bookmark",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      // Optional: Show success message
      toast({
        title: "Success",
        description: "Bookmark updated",
      });
    },
  });

  const filteredRecipes = useMemo(() => {
    let filtered = filterRecipesByMealType(recipes, selectedCategory);
    return searchRecipes(filtered, searchTerm);
  }, [recipes, selectedCategory, searchTerm]);

  const handleBookmarkToggle = (recipeId: string) => {
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe || !auth.currentUser) return;
    
    const isCurrentlyBookmarked = recipe.bookmarkedBy.includes(auth.currentUser.uid);
    toggleBookmarkMutation.mutate({ recipeId, isCurrentlyBookmarked });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
  };

  return (
    <div className="space-y-4">
      <AuthSetupNotice show={authError} />
      {/* Search Bar and Add Recipe Button */}
      <div className="flex space-x-3">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search meals..."
        />
        <Link href="/add">
          <Button className="cute-button px-6 py-3 font-bold text-sm whitespace-nowrap">
            Add Recipe
          </Button>
        </Link>
      </div>

      {/* Category Filter Chips */}
      <CategoryChips
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {/* Recipe Grid */}
      <RecipeGrid
        recipes={filteredRecipes}
        loading={isLoading}
        onBookmarkToggle={handleBookmarkToggle}
        emptyStateTitle="No recipes found"
        emptyStateDescription="Try adjusting your search or filters to find what you're looking for."
        emptyStateAction={{
          label: "Clear Filters",
          onClick: clearFilters,
        }}
      />

      {/* Empty State when no recipes at all */}
      {!isLoading && recipes.length === 0 && (
        <EmptyState
          title="No recipes yet"
          description="Start building your meal collection by adding your first recipe."
          action={{
            label: "Add Your First Recipe",
            onClick: () => window.location.href = "/add",
          }}
          icon={<Utensils className="mx-auto w-16 h-16 text-gray-300" />}
        />
      )}
    </div>
  );
}
