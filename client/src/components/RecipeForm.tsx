import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X } from "lucide-react";
import { RecipeFormData } from "../lib/recipes";
import { Recipe } from "../types/recipe";
import ImageUploader from "./ImageUploader";

const recipeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  mealType: z.enum(["breakfast", "lunchDinner", "snack"]),
  tags: z.array(z.string()).default([]),
  ingredients: z.array(z.object({
    name: z.string().min(1, "Ingredient name is required"),
    qty: z.string().optional(),
  })).min(1, "At least one ingredient is required"),
  steps: z.array(z.string().min(1, "Step cannot be empty")).min(1, "At least one step is required"),
});

type FormData = z.infer<typeof recipeSchema>;

interface RecipeFormProps {
  defaultValues?: Partial<Recipe>;
  onSubmit: (data: RecipeFormData) => Promise<void>;
  submitLabel: string;
  isLoading?: boolean;
}

export default function RecipeForm({ defaultValues, onSubmit, submitLabel, isLoading }: RecipeFormProps) {
  const [selectedImage, setSelectedImage] = useState<File | undefined>();
  const [tagsInput, setTagsInput] = useState(defaultValues?.tags?.join(", ") || "");

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      title: defaultValues?.title || "",
      description: defaultValues?.description || "",
      mealType: defaultValues?.mealType || "breakfast",
      tags: defaultValues?.tags || [],
      ingredients: defaultValues?.ingredients || [{ name: "", qty: "" }],
      steps: defaultValues?.steps || [""],
    },
  });

  const {
    fields: ingredientFields,
    append: appendIngredient,
    remove: removeIngredient,
  } = useFieldArray({
    control,
    name: "ingredients",
  });

  const {
    fields: stepFields,
    append: appendStep,
    remove: removeStep,
  } = useFieldArray({
    control,
    name: "steps",
  });

  const handleTagsChange = (value: string) => {
    setTagsInput(value);
    const tags = value.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0);
    setValue("tags", tags);
  };

  const handleFormSubmit = async (data: FormData) => {
    const formData: RecipeFormData = {
      ...data,
      image: selectedImage,
    };
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Recipe Title *</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Enter recipe title"
              className="mt-1"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Describe your recipe..."
              className="mt-1"
              rows={3}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
            )}
          </div>

          <div>
            <Label>Meal Type *</Label>
            <RadioGroup
              value={watch("mealType")}
              onValueChange={(value: Recipe['mealType']) => setValue("mealType", value)}
              className="flex space-x-6 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="breakfast" id="breakfast" />
                <Label htmlFor="breakfast">Breakfast</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="lunchDinner" id="lunchDinner" />
                <Label htmlFor="lunchDinner">Lunch/Dinner</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="snack" id="snack" />
                <Label htmlFor="snack">Snack</Label>
              </div>
            </RadioGroup>
            {errors.mealType && (
              <p className="text-red-500 text-sm mt-1">{errors.mealType.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={tagsInput}
              onChange={(e) => handleTagsChange(e.target.value)}
              placeholder="spicy, indian, quick"
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Image Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Recipe Image</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUploader
            onImageSelect={setSelectedImage}
            onImageRemove={() => setSelectedImage(undefined)}
            currentImage={defaultValues?.imageUrl}
            currentFile={selectedImage}
          />
        </CardContent>
      </Card>

      {/* Ingredients */}
      <Card>
        <CardHeader>
          <CardTitle>Ingredients *</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {ingredientFields.map((field, index) => (
            <div key={field.id} className="flex space-x-2 items-start">
              <div className="flex-1">
                <Input
                  {...register(`ingredients.${index}.name`)}
                  placeholder="Ingredient name"
                />
                {errors.ingredients?.[index]?.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.ingredients[index]?.name?.message}
                  </p>
                )}
              </div>
              <div className="w-24">
                <Input
                  {...register(`ingredients.${index}.qty`)}
                  placeholder="Qty"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeIngredient(index)}
                disabled={ingredientFields.length === 1}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => appendIngredient({ name: "", qty: "" })}
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Ingredient</span>
          </Button>
          {errors.ingredients && typeof errors.ingredients.message === 'string' && (
            <p className="text-red-500 text-sm">{errors.ingredients.message}</p>
          )}
        </CardContent>
      </Card>

      {/* Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Instructions *</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {stepFields.map((field, index) => (
            <div key={field.id} className="flex space-x-2 items-start">
              <span className="bg-green-400 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium mt-2 flex-shrink-0">
                {index + 1}
              </span>
              <div className="flex-1">
                <Textarea
                  {...register(`steps.${index}`)}
                  placeholder="Describe this step..."
                  rows={2}
                />
                {errors.steps?.[index] && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.steps[index]?.message}
                  </p>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeStep(index)}
                disabled={stepFields.length === 1}
                className="mt-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => appendStep("")}
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Step</span>
          </Button>
          {errors.steps && typeof errors.steps.message === 'string' && (
            <p className="text-red-500 text-sm">{errors.steps.message}</p>
          )}
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full meal-primary py-3 text-lg font-medium"
      >
        {isLoading ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
