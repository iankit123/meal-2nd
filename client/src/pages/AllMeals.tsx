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
import { CategoryFilter } from "../types/recipe";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "../context/AuthContext";

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
    mutationFn: toggleBookmark,
    onSuccess: () => {
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
    let filtered = filterRecipesByMealType(recipes, selectedCategory);
    return searchRecipes(filtered, searchTerm);
  }, [recipes, selectedCategory, searchTerm]);

  const handleBookmarkToggle = (recipeId: string) => {
    toggleBookmarkMutation.mutate(recipeId);
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
          <Button className="meal-primary px-6 py-3 rounded-lg font-medium text-sm whitespace-nowrap shadow-lg">
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
