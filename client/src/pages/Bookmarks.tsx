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
import { CategoryFilter } from "../types/recipe";
import { useToast } from "@/hooks/use-toast";

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
    mutationFn: toggleBookmark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookmarks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/recipes'] });
      toast({
        title: "Success",
        description: "Bookmark updated",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update bookmark",
        variant: "destructive",
      });
    },
  });

  const filteredRecipes = useMemo(() => {
    let filtered = filterRecipesByMealType(bookmarkedRecipes, selectedCategory);
    return searchRecipes(filtered, searchTerm);
  }, [bookmarkedRecipes, selectedCategory, searchTerm]);

  const handleBookmarkToggle = (recipeId: string) => {
    toggleBookmarkMutation.mutate(recipeId);
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
