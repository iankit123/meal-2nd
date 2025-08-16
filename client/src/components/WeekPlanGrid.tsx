import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ChevronDown, Check, Plus } from "lucide-react";
import { WeekPlan, WeekPlanSlot } from "../types/recipe";
import { assignMealToSlot, removeMealFromSlot } from "../lib/weekPlan";
import { useToast } from "@/hooks/use-toast";

interface WeekPlanGridProps {
  weekPlan: WeekPlan;
  onUpdate: () => void;
}

export default function WeekPlanGrid({ weekPlan, onUpdate }: WeekPlanGridProps) {
  const { toast } = useToast();
  const [hasChanges, setHasChanges] = useState(false);
  const [mealList, setMealList] = useState<string[]>([
    "Appe",
    "Guacamole toast", 
    "Moong daal chila",
    "Poha",
    "Sabodana",
    "Upma",
    "Veg paneer / sandwich",
    "Vermicelli",
    "Pasta",
    "Daal Baati",
    "Bengan bharta",
    "Dal Rice",
    "Ghiya Sabji",
    "Dal roti",
    "Paneer capsicum",
    "Paneer sabzi",
    "Black chane",
    "Mix veg rice",
    "Palak paneer",
    "Kadhi",
    "Kakdi Sabzi"
  ]);
  const [newMealName, setNewMealName] = useState("");
  const [showAddMeal, setShowAddMeal] = useState(false);

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

  const addNewMeal = () => {
    if (newMealName.trim() && !mealList.includes(newMealName.trim())) {
      setMealList([...mealList, newMealName.trim()]);
      setNewMealName("");
      setShowAddMeal(false);
      toast({
        title: "Success",
        description: "New meal added to list",
      });
    }
  };

  const handleMealChange = async (day: string, meal: keyof WeekPlanSlot, mealName: string | null) => {
    try {
      if (mealName && mealName !== "none") {
        await assignMealToSlot(day, meal, mealName);
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
              const assignedMeal = weekPlan.slots[day.key]?.[mealTime.key];

              return (
                <div key={mealTime.key} className="p-3 border-r last:border-r-0">
                  <Select
                    value={assignedMeal || "none"}
                    onValueChange={(value) => {
                      handleMealChange(day.key, mealTime.key, value === "none" ? null : value);
                    }}
                  >
                    <SelectTrigger 
                      className={`w-full ${mealTime.color} border border-gray-200 rounded-lg text-sm font-medium text-gray-800 h-12 px-3`}
                    >
                      <SelectValue placeholder="Select a meal...">
                        {assignedMeal || "Select a meal..."}
                      </SelectValue>
                      <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      <div className="px-2 py-1 text-sm text-gray-500 border-b bg-gray-50">
                        Select a meal...
                      </div>
                      {mealList.map((meal) => (
                        <SelectItem key={meal} value={meal} className="text-sm">
                          <div className="flex items-center gap-2 w-full">
                            {assignedMeal === meal && <Check className="h-4 w-4 text-green-600" />}
                            {assignedMeal !== meal && <div className="w-4" />}
                            <span>{meal}</span>
                          </div>
                        </SelectItem>
                      ))}
                      
                      <Dialog open={showAddMeal} onOpenChange={setShowAddMeal}>
                        <DialogTrigger asChild>
                          <div className="flex items-center gap-2 px-2 py-2 text-sm text-gray-600 hover:bg-gray-50 cursor-pointer border-t">
                            <Plus className="h-4 w-4" />
                            <span>Add New Meal</span>
                          </div>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Add New Meal</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Input
                              placeholder="Enter meal name"
                              value={newMealName}
                              onChange={(e) => setNewMealName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  addNewMeal();
                                }
                              }}
                            />
                            <div className="flex gap-2">
                              <Button onClick={addNewMeal} className="flex-1">
                                Add Meal
                              </Button>
                              <Button 
                                variant="outline" 
                                onClick={() => {
                                  setShowAddMeal(false);
                                  setNewMealName("");
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
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