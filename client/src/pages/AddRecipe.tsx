import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

import RecipeForm from "../components/RecipeForm";
import { createRecipe, RecipeFormData } from "../lib/recipes";
import { useToast } from "@/hooks/use-toast";

export default function AddRecipe() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const createRecipeMutation = useMutation({
    mutationFn: createRecipe,
    onSuccess: (recipeId) => {
      toast({
        title: "Success",
        description: "Recipe created successfully",
      });
      setLocation(`/recipe/${recipeId}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create recipe",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (data: RecipeFormData) => {
    await createRecipeMutation.mutateAsync(data);
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
        Back to All Meals
      </Button>

      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Add New Recipe</h1>
        <p className="text-gray-600">
          Share your favorite recipe with the community
        </p>
      </div>

      {/* Recipe Form */}
      <RecipeForm
        onSubmit={handleSubmit}
        submitLabel="Create Recipe"
        isLoading={createRecipeMutation.isPending}
      />
    </div>
  );
}
