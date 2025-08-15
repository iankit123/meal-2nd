import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

import RecipeForm from "../components/RecipeForm";
import { getRecipeById, updateRecipe, RecipeFormData } from "../lib/recipes";
import { useAuth } from "../context/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function EditRecipe() {
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

  const updateRecipeMutation = useMutation({
    mutationFn: (data: RecipeFormData) => updateRecipe(recipeId, data, recipe?.imagePath),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/recipes', recipeId] });
      queryClient.invalidateQueries({ queryKey: ['/api/recipes'] });
      toast({
        title: "Success",
        description: "Recipe updated successfully",
      });
      setLocation(`/recipe/${recipeId}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update recipe",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (data: RecipeFormData) => {
    await updateRecipeMutation.mutateAsync(data);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="space-y-4">
          <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-24 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
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

  // Check if user can edit this recipe
  if (user?.uid !== recipe.createdBy) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Not authorized</h2>
        <p className="text-gray-600 mb-4">You can only edit recipes that you created.</p>
        <Button onClick={() => setLocation(`/recipe/${recipeId}`)} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Recipe
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        onClick={() => setLocation(`/recipe/${recipeId}`)}
        variant="outline"
        size="sm"
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Recipe
      </Button>

      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Edit Recipe</h1>
        <p className="text-gray-600">
          Update your recipe details
        </p>
      </div>

      {/* Recipe Form */}
      <RecipeForm
        defaultValues={recipe}
        onSubmit={handleSubmit}
        submitLabel="Update Recipe"
        isLoading={updateRecipeMutation.isPending}
      />
    </div>
  );
}
