import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Heart, Edit, Trash2, ExternalLink, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { getRecipeById, deleteRecipe, toggleBookmark } from "../lib/recipes";
import { useAuth } from "../context/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function RecipeDetails() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const recipeId = params.id as string;

  const { data: recipe, isLoading } = useQuery({
    queryKey: ['/api/recipes', recipeId],
    queryFn: () => getRecipeById(recipeId),
  });

  const toggleBookmarkMutation = useMutation({
    mutationFn: toggleBookmark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/recipes', recipeId] });
      queryClient.invalidateQueries({ queryKey: ['/api/recipes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bookmarks'] });
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

  const deleteRecipeMutation = useMutation({
    mutationFn: deleteRecipe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/recipes'] });
      toast({
        title: "Success",
        description: "Recipe deleted successfully",
      });
      setLocation("/");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete recipe",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="w-full h-64 bg-gray-200 rounded-xl animate-pulse"></div>
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
          <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Recipe not found</h2>
        <Button onClick={() => setLocation("/")} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to All Meals
        </Button>
      </div>
    );
  }

  const isBookmarked = user ? recipe.bookmarkedBy.includes(user.uid) : false;
  const canEdit = user?.uid === recipe.createdBy;

  const getMealTypeColor = (mealType: string) => {
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

  const getMealTypeLabel = (mealType: string) => {
    switch (mealType) {
      case 'lunchDinner':
        return 'Lunch/dinner';
      default:
        return mealType.charAt(0).toUpperCase() + mealType.slice(1);
    }
  };

  const handleBookmarkToggle = () => {
    toggleBookmarkMutation.mutate(recipeId);
  };

  const handleDelete = () => {
    deleteRecipeMutation.mutate(recipeId);
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        onClick={() => setLocation("/")}
        variant="outline"
        size="sm"
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      {/* Hero Image */}
      <div className="relative">
        {recipe.imageUrl ? (
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            className="w-full h-64 object-cover rounded-xl"
          />
        ) : (
          <div className="w-full h-64 bg-gray-200 rounded-xl flex items-center justify-center">
            <span className="text-gray-400">No image</span>
          </div>
        )}
      </div>

      {/* Recipe Info */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {recipe.title}
            </h1>
            <Badge className={getMealTypeColor(recipe.mealType)}>
              {getMealTypeLabel(recipe.mealType)}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBookmarkToggle}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Heart
              className={`w-6 h-6 transition-colors ${
                isBookmarked
                  ? "fill-red-500 text-red-500"
                  : "text-gray-400 hover:text-red-500"
              }`}
            />
          </Button>
        </div>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Recipe Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {recipe.instructions}
          </p>
        </CardContent>
      </Card>

      {/* Links */}
      {(recipe.instagramLink || recipe.recipeLink) && (
        <Card>
          <CardHeader>
            <CardTitle>Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recipe.instagramLink && (
              <a
                href={recipe.instagramLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors"
              >
                <Instagram className="w-5 h-5" />
                <span className="font-medium">View on Instagram</span>
                <ExternalLink className="w-4 h-4 ml-auto" />
              </a>
            )}
            {recipe.recipeLink && (
              <a
                href={recipe.recipeLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <ExternalLink className="w-5 h-5" />
                <span className="font-medium">View Original Recipe</span>
                <ExternalLink className="w-4 h-4 ml-auto" />
              </a>
            )}
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      {canEdit && (
        <div className="flex space-x-3">
          <Button
            onClick={() => setLocation(`/edit/${recipe.id}`)}
            className="flex-1 bg-green-400 hover:bg-green-500 text-white py-3 rounded-lg font-medium transition-colors"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Recipe
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="flex-1 py-3 rounded-lg font-medium"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Recipe</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{recipe.title}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-500 hover:bg-red-600"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
}