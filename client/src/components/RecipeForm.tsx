import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { RecipeFormData } from "../lib/recipes";
import { Recipe } from "../types/recipe";
import ImageUploader from "./ImageUploader";

const recipeSchema = z.object({
  title: z.string().min(1, "Meal name is required"),
  mealType: z.enum(["breakfast", "lunchDinner", "snack"]),
  instructions: z.string().min(1, "Recipe instructions are required"),
  instagramLink: z.string().optional(),
  recipeLink: z.string().optional(),
});

type FormData = z.infer<typeof recipeSchema>;

interface RecipeFormProps {
  defaultValues?: Partial<Recipe>;
  onSubmit: (data: RecipeFormData) => Promise<void>;
  submitLabel: string;
  isLoading?: boolean;
  onClose?: () => void;
}

export default function RecipeForm({ defaultValues, onSubmit, submitLabel, isLoading, onClose }: RecipeFormProps) {
  const [selectedImage, setSelectedImage] = useState<File | undefined>();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      title: defaultValues?.title || "",
      mealType: defaultValues?.mealType || "breakfast",
      instructions: defaultValues?.instructions || "",
      instagramLink: defaultValues?.instagramLink || "",
      recipeLink: defaultValues?.recipeLink || "",
    },
  });

  const handleFormSubmit = async (data: FormData) => {
    const formData: RecipeFormData = {
      ...data,
      image: selectedImage,
    };
    await onSubmit(formData);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg max-w-md mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Add New Meal</h2>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-500" />
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Meal Name */}
        <div>
          <Label htmlFor="title" className="text-gray-700 font-medium">
            Meal Name
          </Label>
          <Input
            id="title"
            {...register("title")}
            className="mt-2 border-gray-300 rounded-lg"
            placeholder="Enter meal name"
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>

        {/* Meal Type */}
        <div>
          <Label className="text-gray-700 font-medium">Meal Type</Label>
          <Select
            value={watch("mealType")}
            onValueChange={(value: Recipe['mealType']) => setValue("mealType", value)}
          >
            <SelectTrigger className="mt-2 border-gray-300 rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="breakfast">Breakfast</SelectItem>
              <SelectItem value="lunchDinner">Lunch/Dinner</SelectItem>
              <SelectItem value="snack">Snack</SelectItem>
            </SelectContent>
          </Select>
          {errors.mealType && (
            <p className="text-red-500 text-sm mt-1">{errors.mealType.message}</p>
          )}
        </div>

        {/* Recipe Instructions */}
        <div>
          <Label htmlFor="instructions" className="text-gray-700 font-medium">
            Recipe Instructions
          </Label>
          <Textarea
            id="instructions"
            {...register("instructions")}
            className="mt-2 border-gray-300 rounded-lg h-32"
            placeholder="Enter recipe instructions..."
          />
          {errors.instructions && (
            <p className="text-red-500 text-sm mt-1">{errors.instructions.message}</p>
          )}
        </div>

        {/* Meal Image */}
        <div>
          <Label className="text-gray-700 font-medium">Meal Image</Label>
          <div className="mt-2">
            <ImageUploader
              onImageSelect={setSelectedImage}
              onImageRemove={() => setSelectedImage(undefined)}
              currentImage={defaultValues?.imageUrl}
              currentFile={selectedImage}
            />
          </div>
        </div>

        {/* Instagram Link */}
        <div>
          <Label htmlFor="instagramLink" className="text-gray-700 font-medium">
            Instagram Link (optional)
          </Label>
          <Input
            id="instagramLink"
            {...register("instagramLink")}
            className="mt-2 border-gray-300 rounded-lg"
            placeholder="Enter Instagram link"
          />
        </div>

        {/* Recipe Link */}
        <div>
          <Label htmlFor="recipeLink" className="text-gray-700 font-medium">
            Recipe Link (optional)
          </Label>
          <Input
            id="recipeLink"
            {...register("recipeLink")}
            className="mt-2 border-gray-300 rounded-lg"
            placeholder="Enter recipe link"
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full meal-primary py-3 text-lg font-medium rounded-lg"
        >
          {isLoading ? "Saving..." : submitLabel}
        </Button>
      </form>
    </div>
  );
}