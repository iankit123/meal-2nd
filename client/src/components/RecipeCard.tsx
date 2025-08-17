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
        return { backgroundColor: 'var(--theme-100)', color: 'var(--theme-800)' };
      case 'lunchDinner':
        return { backgroundColor: 'var(--theme-200)', color: 'var(--theme-900)' };
      case 'snack':
        return { backgroundColor: 'var(--theme-300)', color: 'var(--theme-900)' };
      default:
        return { backgroundColor: 'var(--theme-100)', color: 'var(--theme-800)' };
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
          <div className="w-full h-48 flex items-center justify-center" style={{ backgroundColor: 'var(--theme-100)' }}>
            <span className="font-handwritten text-xl" style={{ color: 'var(--theme-400)' }}>No image</span>
          </div>
        )}
      </div>
      
      {/* Card Content */}
      <CardContent className="p-4">
        {/* Recipe Title and Category */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-handwritten font-bold text-xl mb-2 transform -rotate-1" style={{ color: 'var(--theme-900)' }}>
              {recipe.title}
            </h3>
            <span 
              className="inline-block text-xs font-bold px-3 py-1.5 rounded-2xl shadow-sm"
              style={getMealTypeColor(recipe.mealType)}
            >
              {getMealTypeLabel(recipe.mealType)}
            </span>
          </div>
          
          {/* Bookmark Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onBookmarkToggle(recipe.id)}
            className="p-2 rounded-2xl transition-all duration-200 transform hover:scale-110"
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--theme-50)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Heart 
              className="w-6 h-6 transition-all duration-200 hover:scale-110"
              style={{
                fill: isBookmarked ? 'var(--theme-500)' : 'transparent',
                color: isBookmarked ? 'var(--theme-500)' : 'var(--theme-400)',
                animation: isBookmarked ? 'pulse 2s infinite' : 'none'
              }}
              onMouseEnter={(e) => {
                if (!isBookmarked) {
                  e.currentTarget.style.color = 'var(--theme-500)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isBookmarked) {
                  e.currentTarget.style.color = 'var(--theme-400)';
                }
              }}
            />
          </Button>
        </div>
        
        {/* View Recipe Button */}
        <Link href={`/recipe/${recipe.id}`}>
          <Button className="w-full cute-button py-3 font-bold">
            View Recipe
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
