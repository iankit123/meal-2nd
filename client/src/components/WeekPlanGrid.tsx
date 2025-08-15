import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, X } from "lucide-react";
import { WeekPlan, WeekPlanSlot, Recipe } from "../types/recipe";
import { useQuery } from "@tanstack/react-query";
import { getAllRecipes } from "../lib/recipes";
import { assignMealToSlot, removeMealFromSlot } from "../lib/weekPlan";
import { useToast } from "@/hooks/use-toast";
import SearchBar from "./SearchBar";

interface WeekPlanGridProps {
  weekPlan: WeekPlan;
  onUpdate: () => void;
}

export default function WeekPlanGrid({ weekPlan, onUpdate }: WeekPlanGridProps) {
  const [selectedSlot, setSelectedSlot] = useState<{ day: string; meal: keyof WeekPlanSlot } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const { data: allRecipes = [] } = useQuery({
    queryKey: ['/api/recipes'],
    queryFn: getAllRecipes,
  });

  const days = [
    { key: 'monday', label: 'Mon' },
    { key: 'tuesday', label: 'Tue' },
    { key: 'wednesday', label: 'Wed' },
    { key: 'thursday', label: 'Thu' },
    { key: 'friday', label: 'Fri' },
    { key: 'saturday', label: 'Sat' },
    { key: 'sunday', label: 'Sun' },
  ];

  const mealTimes: Array<{ key: keyof WeekPlanSlot; label: string }> = [
    { key: 'breakfast', label: 'Breakfast' },
    { key: 'lunch', label: 'Lunch' },
    { key: 'dinner', label: 'Dinner' },
  ];

  const filteredRecipes = allRecipes.filter(recipe =>
    recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getRecipeById = (id: string): Recipe | undefined => {
    return allRecipes.find(recipe => recipe.id === id);
  };

  const handleAssignMeal = async (recipeId: string) => {
    if (!selectedSlot) return;

    try {
      await assignMealToSlot(selectedSlot.day, selectedSlot.meal, recipeId);
      onUpdate();
      setSelectedSlot(null);
      toast({
        title: "Success",
        description: "Meal assigned to week plan",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign meal",
        variant: "destructive",
      });
    }
  };

  const handleRemoveMeal = async (day: string, meal: keyof WeekPlanSlot) => {
    try {
      await removeMealFromSlot(day, meal);
      onUpdate();
      toast({
        title: "Success",
        description: "Meal removed from week plan",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove meal",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Week Plan</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-full grid grid-cols-7 gap-4">
            {days.map((day) => (
              <div key={day.key} className="min-w-48">
                <h3 className="font-semibold text-gray-900 text-center mb-4">
                  {day.label}
                </h3>
                
                {mealTimes.map((mealTime) => {
                  const assignedRecipeId = weekPlan.slots[day.key]?.[mealTime.key];
                  const assignedRecipe = assignedRecipeId ? getRecipeById(assignedRecipeId) : null;

                  return (
                    <div key={mealTime.key} className="mb-4">
                      <h4 className="text-sm font-medium text-gray-600 mb-2">
                        {mealTime.label}
                      </h4>
                      
                      {assignedRecipe ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          {assignedRecipe.imageUrl && (
                            <img
                              src={assignedRecipe.imageUrl}
                              alt={assignedRecipe.title}
                              className="w-full h-20 object-cover rounded mb-2"
                            />
                          )}
                          <p className="text-sm font-medium text-gray-900 mb-1">
                            {assignedRecipe.title}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMeal(day.key, mealTime.key)}
                            className="text-red-500 text-xs hover:text-red-600 p-0 h-auto"
                          >
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <Dialog>
                          <DialogTrigger asChild>
                            <div
                              className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-400 transition-colors cursor-pointer"
                              onClick={() => setSelectedSlot({ day: day.key, meal: mealTime.key })}
                            >
                              <Plus className="w-5 h-5 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-500">Add meal</p>
                            </div>
                          </DialogTrigger>
                          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>
                                Select meal for {day.label} {mealTime.label}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <SearchBar
                                value={searchTerm}
                                onChange={setSearchTerm}
                                placeholder="Search recipes..."
                              />
                              
                              <div className="space-y-2 max-h-96 overflow-y-auto">
                                {filteredRecipes.map((recipe) => (
                                  <div
                                    key={recipe.id}
                                    className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                                    onClick={() => handleAssignMeal(recipe.id)}
                                  >
                                    {recipe.imageUrl && (
                                      <img
                                        src={recipe.imageUrl}
                                        alt={recipe.title}
                                        className="w-12 h-12 object-cover rounded"
                                      />
                                    )}
                                    <div className="flex-1">
                                      <p className="font-medium text-sm">{recipe.title}</p>
                                      <p className="text-xs text-gray-500">
                                        {recipe.mealType === 'lunchDinner' ? 'Lunch/Dinner' : recipe.mealType}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                                
                                {filteredRecipes.length === 0 && (
                                  <p className="text-center text-gray-500 py-4">
                                    No recipes found
                                  </p>
                                )}
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
