import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown } from "lucide-react";
import { WeekPlan, WeekPlanSlot, Recipe } from "../types/recipe";
import { useQuery } from "@tanstack/react-query";
import { getAllRecipes } from "../lib/recipes";
import { assignMealToSlot, removeMealFromSlot } from "../lib/weekPlan";
import { useToast } from "@/hooks/use-toast";

interface WeekPlanGridProps {
  weekPlan: WeekPlan;
  onUpdate: () => void;
}

export default function WeekPlanGrid({ weekPlan, onUpdate }: WeekPlanGridProps) {
  const { toast } = useToast();
  const [hasChanges, setHasChanges] = useState(false);

  const { data: allRecipes = [] } = useQuery({
    queryKey: ['/api/recipes'],
    queryFn: getAllRecipes,
  });

  const days = [
    { key: 'sunday', label: 'Sun' },
    { key: 'monday', label: 'Mon' },
    { key: 'tuesday', label: 'Tue' },
    { key: 'wednesday', label: 'Wed' },
    { key: 'thursday', label: 'Thu' },
    { key: 'friday', label: 'Fri' },
    { key: 'saturday', label: 'Sat' },
  ];

  const mealTimes: Array<{ key: keyof WeekPlanSlot; label: string; color: string }> = [
    { key: 'breakfast', label: 'Breakfast', color: 'bg-green-100' },
    { key: 'lunch', label: 'Lunch', color: 'bg-orange-100' },
    { key: 'dinner', label: 'Dinner', color: 'bg-purple-100' },
  ];

  const getRecipeById = (id: string): Recipe | undefined => {
    return allRecipes.find(recipe => recipe.id === id);
  };

  const handleMealChange = async (day: string, meal: keyof WeekPlanSlot, recipeId: string | null) => {
    try {
      if (recipeId) {
        await assignMealToSlot(day, meal, recipeId);
      } else {
        await removeMealFromSlot(day, meal);
      }
      onUpdate();
      setHasChanges(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update meal plan",
        variant: "destructive",
      });
    }
  };

  const handleSaveChanges = () => {
    setHasChanges(false);
    toast({
      title: "Success",
      description: "Week plan saved successfully!",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Weekly Meal Plan</h1>
        <Button 
          onClick={handleSaveChanges}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6"
          disabled={!hasChanges}
        >
          Save Changes
        </Button>
      </div>

      {/* Week Plan Grid */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {/* Header Row */}
        <div className="grid grid-cols-4 border-b bg-gray-50">
          <div className="p-4 font-semibold text-purple-600">Day</div>
          {mealTimes.map((mealTime) => (
            <div key={mealTime.key} className="p-4 font-semibold text-purple-600 text-center">
              {mealTime.label}
            </div>
          ))}
        </div>

        {/* Day Rows */}
        {days.map((day) => (
          <div key={day.key} className="grid grid-cols-4 border-b last:border-b-0 hover:bg-gray-25">
            {/* Day Label */}
            <div className="p-4 font-medium text-purple-600 border-r">
              {day.label}
            </div>

            {/* Meal Columns */}
            {mealTimes.map((mealTime) => {
              const assignedRecipeId = weekPlan.slots[day.key]?.[mealTime.key];
              const assignedRecipe = assignedRecipeId ? getRecipeById(assignedRecipeId) : null;

              return (
                <div key={mealTime.key} className="p-3 border-r last:border-r-0">
                  <Select
                    value={assignedRecipeId || "none"}
                    onValueChange={(value) => {
                      handleMealChange(day.key, mealTime.key, value === "none" ? null : value);
                    }}
                  >
                    <SelectTrigger 
                      className={`w-full ${mealTime.color} border border-gray-200 rounded-lg text-sm font-medium text-gray-800 h-12 px-3`}
                    >
                      <SelectValue placeholder="Select meal">
                        {assignedRecipe ? assignedRecipe.title : "Select meal"}
                      </SelectValue>
                      <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No meal</SelectItem>
                      {allRecipes.map((recipe) => (
                        <SelectItem key={recipe.id} value={recipe.id}>
                          {recipe.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}