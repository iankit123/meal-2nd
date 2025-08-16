import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Bookmark, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

import SearchBar from "../components/SearchBar";
import CategoryChips from "../components/CategoryChips";
import RecipeGrid from "../components/RecipeGrid";
import EmptyState from "../components/EmptyState";
import { getBookmarkedRecipes, toggleBookmark, searchRecipes, filterRecipesByMealType } from "../lib/recipes";
import { CategoryFilter, Recipe } from "../types/recipe";
import { useToast } from "@/hooks/use-toast";
import { auth } from "../lib/firebase";

export default function Bookmarks() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: bookmarkedRecipes = [], isLoading } = useQuery({
    queryKey: ['/api/bookmarks'],
    queryFn: getBookmarkedRecipes,
  });

  const toggleBookmarkMutation = useMutation({
    mutationFn: ({ recipeId, isCurrentlyBookmarked }: { recipeId: string; isCurrentlyBookmarked: boolean }) =>
      toggleBookmark(recipeId, isCurrentlyBookmarked),
    onMutate: async ({ recipeId, isCurrentlyBookmarked }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['/api/bookmarks'] });
      await queryClient.cancelQueries({ queryKey: ['/api/recipes'] });
      
      // Snapshot the previous values
      const previousBookmarks = queryClient.getQueryData(['/api/bookmarks']);
      const previousRecipes = queryClient.getQueryData(['/api/recipes']);
      
      // Optimistically update both caches
      queryClient.setQueryData(['/api/bookmarks'], (old: Recipe[]) => {
        if (!old || !auth.currentUser?.uid) return old;
        
        if (isCurrentlyBookmarked) {
          // Remove from bookmarks (it's being unbookmarked)
          return old.filter(recipe => recipe.id !== recipeId);
        }
        return old; // Recipe wasn't in bookmarks, so no change
      });
      
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
      
      return { previousBookmarks, previousRecipes };
    },
    onError: (err, variables, context) => {
      // Revert on error
      if (context?.previousBookmarks) {
        queryClient.setQueryData(['/api/bookmarks'], context.previousBookmarks);
      }
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
      toast({
        title: "Success",
        description: "Bookmark updated",
      });
    },
  });

  const filteredRecipes = useMemo(() => {
    let filtered = filterRecipesByMealType(bookmarkedRecipes, selectedCategory);
    return searchRecipes(filtered, searchTerm);
  }, [bookmarkedRecipes, selectedCategory, searchTerm]);

  const handleBookmarkToggle = (recipeId: string) => {
    const recipe = bookmarkedRecipes.find(r => r.id === recipeId);
    if (!recipe || !auth.currentUser?.uid) return;
    
    const isCurrentlyBookmarked = recipe.bookmarkedBy.includes(auth.currentUser.uid);
    toggleBookmarkMutation.mutate({ recipeId, isCurrentlyBookmarked });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex space-x-3">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search bookmarks..."
        />
      </div>

      {/* Category Filter Chips */}
      {bookmarkedRecipes.length > 0 && (
        <CategoryChips
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
      )}

      {/* Recipe Grid */}
      <RecipeGrid
        recipes={filteredRecipes}
        loading={isLoading}
        onBookmarkToggle={handleBookmarkToggle}
        emptyStateTitle="No bookmarked recipes found"
        emptyStateDescription="Try adjusting your search or filters to find what you're looking for."
        emptyStateAction={{
          label: "Clear Filters",
          onClick: clearFilters,
        }}
      />

      {/* Empty State when no bookmarks at all */}
      {!isLoading && bookmarkedRecipes.length === 0 && (
        <EmptyState
          title="No bookmarked recipes yet"
          description="Start bookmarking your favorite recipes by clicking the heart icon on recipe cards."
          action={{
            label: "Browse All Recipes",
            onClick: () => window.location.href = "/",
          }}
          icon={<Bookmark className="mx-auto w-16 h-16 text-gray-300" />}
        />
      )}
    </div>
  );
}
