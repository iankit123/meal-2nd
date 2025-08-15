import { Recipe } from "../types/recipe";
import RecipeCard from "./RecipeCard";
import EmptyState from "./EmptyState";

interface RecipeGridProps {
  recipes: Recipe[];
  loading?: boolean;
  onBookmarkToggle: (recipeId: string) => void;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  emptyStateAction?: {
    label: string;
    onClick: () => void;
  };
}

export default function RecipeGrid({
  recipes,
  loading,
  onBookmarkToggle,
  emptyStateTitle = "No recipes found",
  emptyStateDescription = "Try adjusting your search or filters to find what you're looking for.",
  emptyStateAction
}: RecipeGridProps) {
  if (loading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="meal-card animate-pulse">
            <div className="w-full h-48 bg-gray-200"></div>
            <div className="p-4">
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <EmptyState
        title={emptyStateTitle}
        description={emptyStateDescription}
        action={emptyStateAction}
      />
    );
  }

  return (
    <div>
      {recipes.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          recipe={recipe}
          onBookmarkToggle={onBookmarkToggle}
        />
      ))}
    </div>
  );
}
