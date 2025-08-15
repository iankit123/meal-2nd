import { Recipe } from "../types/recipe";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "../context/AuthContext";

interface RecipeCardProps {
  recipe: Recipe;
  onBookmarkToggle: (recipeId: string) => void;
}

export default function RecipeCard({ recipe, onBookmarkToggle }: RecipeCardProps) {
  const { user } = useAuth();
  const isBookmarked = user ? recipe.bookmarkedBy.includes(user.uid) : false;

  const getMealTypeColor = (mealType: Recipe['mealType']) => {
    switch (mealType) {
      case 'breakfast':
        return 'bg-green-100 text-green-800';
      case 'lunchDinner':
        return 'bg-orange-100 text-orange-800';
      case 'snack':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMealTypeLabel = (mealType: Recipe['mealType']) => {
    switch (mealType) {
      case 'lunchDinner':
        return 'Lunch/dinner';
      default:
        return mealType.charAt(0).toUpperCase() + mealType.slice(1);
    }
  };

  return (
    <Card className="meal-card mb-6">
      {/* Recipe Image */}
      <div className="relative">
        {recipe.imageUrl ? (
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No image</span>
          </div>
        )}
      </div>
      
      {/* Card Content */}
      <CardContent className="p-4">
        {/* Recipe Title and Category */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-lg mb-2">
              {recipe.title}
            </h3>
            <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${getMealTypeColor(recipe.mealType)}`}>
              {getMealTypeLabel(recipe.mealType)}
            </span>
          </div>
          
          {/* Bookmark Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onBookmarkToggle(recipe.id)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Heart 
              className={`w-5 h-5 transition-colors ${
                isBookmarked 
                  ? "fill-red-500 text-red-500" 
                  : "text-gray-400 hover:text-red-500"
              }`}
            />
          </Button>
        </div>
        
        {/* View Recipe Button */}
        <Link href={`/recipe/${recipe.id}`}>
          <Button className="w-full meal-primary py-3 rounded-lg font-medium transition-colors">
            View Recipe
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
