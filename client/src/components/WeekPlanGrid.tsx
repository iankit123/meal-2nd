import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ChevronDown, Check, Plus } from "lucide-react";
import { WeekPlan, WeekPlanSlot } from "../types/recipe";
import { saveWeekPlanData } from "../lib/storage";
import { useToast } from "@/hooks/use-toast";

interface WeekPlanGridProps {
  weekPlan: WeekPlan;
  onUpdate: () => void;
}

export default function WeekPlanGrid({
  weekPlan,
  onUpdate,
}: WeekPlanGridProps) {
  const { toast } = useToast();
  const [localWeekPlan, setLocalWeekPlan] = useState<WeekPlan>(weekPlan);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [mealList, setMealList] = useState<string[]>(
    [
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
      "Kakdi Sabzi",
    ].sort(),
  );
  const [newMealName, setNewMealName] = useState("");
  const [showAddMeal, setShowAddMeal] = useState(false);

  const days = [
    { key: "sunday", label: "Sun" },
    { key: "monday", label: "Mon" },
    { key: "tuesday", label: "Tue" },
    { key: "wednesday", label: "Wed" },
    { key: "thursday", label: "Thu" },
    { key: "friday", label: "Fri" },
    { key: "saturday", label: "Sat" },
  ];

  const mealTimes: Array<{
    key: keyof WeekPlanSlot;
    label: string;
    colorVar: string;
  }> = [
    { key: "breakfast", label: "Breakfast", colorVar: "var(--theme-100)" },
    { key: "lunch", label: "Lunch", colorVar: "var(--theme-200)" },
    { key: "dinner", label: "Dinner", colorVar: "var(--theme-300)" },
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

  // Update local state when weekPlan prop changes
  React.useEffect(() => {
    setLocalWeekPlan(weekPlan);
    setHasChanges(false);
  }, [weekPlan]);

  const handleMealChange = (
    day: string,
    meal: keyof WeekPlanSlot,
    mealName: string | null,
  ) => {
    console.log(`Locally updating ${day} ${meal} to:`, mealName);

    // Update local state immediately (no server call)
    const updatedSlots = {
      ...localWeekPlan.slots,
      [day]: {
        ...localWeekPlan.slots[day],
      },
    };

    if (mealName && mealName !== "none") {
      updatedSlots[day][meal] = mealName;
    } else {
      delete updatedSlots[day][meal];
    }

    const updatedWeekPlan = {
      ...localWeekPlan,
      slots: updatedSlots,
    };

    setLocalWeekPlan(updatedWeekPlan);
    setHasChanges(true);
  };

  const handleSaveChanges = async () => {
    if (!hasChanges) return;

    setIsSaving(true);
    try {
      console.log("Saving meal plan changes to server...");
      await saveWeekPlanData(localWeekPlan.slots);

      // Trigger refetch to sync with server
      onUpdate();
      setHasChanges(false);

      toast({
        title: "Success",
        description: "Meal plan saved successfully!",
      });

      console.log("Meal plan saved successfully");
    } catch (error) {
      console.error("Failed to save meal plan:", error);
      toast({
        title: "Error",
        description: "Failed to save meal plan",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-full overflow-x-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1
            className="text-2xl font-handwritten font-bold transform -rotate-1"
            style={{ color: "var(--theme-900)" }}
          >
            Create Week's Plan
          </h1>
          {hasChanges && (
            <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-600 font-medium">
              Unsaved changes
            </span>
          )}
        </div>
        <Button
          onClick={handleSaveChanges}
          className="cute-button"
          disabled={!hasChanges || isSaving}
          style={{
            backgroundColor: hasChanges
              ? "var(--theme-600)"
              : "var(--theme-300)",
            color: "white",
          }}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
      {/* Week Plan Grid */}
      <div className="cute-card overflow-hidden w-full p-0 pl-[6px] pr-[6px]">
        {/* Strict Grid Container with Fixed Columns */}
        <div
          className="grid gap-2"
          style={{
            gridTemplateColumns: "40px repeat(3, 1fr)",
            gridTemplateRows: "auto",
          }}
        >
          {/* Header Row */}
          <div className="week-plan-header">Day</div>
          {mealTimes.map((mealTime) => (
            <div key={mealTime.key} className="week-plan-header">
              {mealTime.label}
            </div>
          ))}

          {/* All Grid Cells */}
          {days.flatMap((day) => [
            /* Day Label */
            <div key={`${day.key}-label`} className="week-plan-day">
              {day.label}
            </div>,

            /* Meal Columns for this day */
            ...mealTimes.map((mealTime) => {
              const assignedMeal = localWeekPlan.slots[day.key]?.[mealTime.key];

              return (
                <div
                  key={`${day.key}-${mealTime.key}`}
                  className="week-plan-cell"
                >
                  <Select
                    value={assignedMeal || "none"}
                    onValueChange={(value) => {
                      handleMealChange(
                        day.key,
                        mealTime.key,
                        value === "none" ? null : value,
                      );
                    }}
                  >
                    <SelectTrigger
                      className="w-full h-full rounded-2xl text-xs font-medium px-3 py-2 bg-white border-2 hover:shadow-md transition-shadow relative [&>svg]:hidden pl-[3px] pr-[3px]"
                      style={{
                        border: "2px solid var(--theme-200)",
                        color: "var(--theme-900)",
                        minHeight: "56px",
                        maxWidth: "100%",
                        overflow: "hidden",
                      }}
                    >
                      <SelectValue asChild>
                        <div
                          className="text-left leading-tight break-words overflow-hidden w-full flex items-center justify-start pr-6"
                          style={{
                            wordWrap: "break-word",
                            overflowWrap: "break-word",
                            hyphens: "auto",
                            whiteSpace: "normal",
                            lineHeight: "1.2",
                            color: assignedMeal ? "var(--theme-900)" : "red", // 👈 highlight empty
                            fontWeight: assignedMeal ? "normal" : "600", // optional: bold when empty
                          }}
                        >
                          {assignedMeal || "Add meal"}
                        </div>
                      </SelectValue>

                      <ChevronDown
                        className="h-3 w-3 absolute bottom-1 right-1 pointer-events-none"
                        style={{ color: "var(--theme-600)" }}
                      />
                    </SelectTrigger>

                    <SelectContent
                      className="max-h-60 rounded-2xl"
                      style={{ border: "2px solid var(--theme-200)" }}
                    >
                      <div
                        className="px-2 py-1 text-sm border-b rounded-t-2xl"
                        style={{
                          color: "var(--theme-700)",
                          backgroundColor: "var(--theme-50)",
                        }}
                      >
                        Select a meal...
                      </div>
                      {mealList.map((meal) => (
                        <SelectItem
                          key={meal}
                          value={meal}
                          className="text-sm rounded-xl mx-1 hover:shadow-sm"
                          style={
                            {
                              "--hover-bg": "var(--theme-50)",
                            } as React.CSSProperties
                          }
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "var(--theme-50)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "transparent")
                          }
                        >
                          <div className="flex items-left gap-2 w-full">
                            {/* {assignedMeal === meal && (
                                <Check
                                  className="h-4 w-4"
                                  style={{ color: "var(--theme-600)" }}
                                />
                              )} */}
                            {assignedMeal !== meal && <div className="w-4" />}
                            <span style={{ color: "var(--theme-900)" }}>
                              {meal}
                            </span>
                          </div>
                        </SelectItem>
                      ))}

                      <Dialog open={showAddMeal} onOpenChange={setShowAddMeal}>
                        <DialogTrigger asChild>
                          <div
                            className="flex items-left gap-2 px-2 py-2 text-sm cursor-pointer border-t rounded-b-2xl transition-colors"
                            style={{ color: "var(--theme-600)" }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "var(--theme-50)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "transparent")
                            }
                          >
                            <Plus className="h-4 w-4" />
                            <span>Add New Meal</span>
                          </div>
                        </DialogTrigger>
                        <DialogContent
                          className="sm:max-w-md cute-card"
                          style={{ border: "4px solid var(--theme-300)" }}
                        >
                          <DialogHeader>
                            <DialogTitle
                              className="font-handwritten text-xl"
                              style={{ color: "var(--theme-900)" }}
                            >
                              Add New Meal
                            </DialogTitle>
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
                              className="cute-input"
                            />
                            <div className="flex gap-2">
                              <Button
                                onClick={addNewMeal}
                                className="cute-button flex-1"
                              >
                                Add Meal
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setShowAddMeal(false);
                                  setNewMealName("");
                                }}
                                className="rounded-2xl font-medium transition-colors hover:shadow-sm"
                                style={{
                                  border: "2px solid var(--theme-200)",
                                  color: "var(--theme-700)",
                                }}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.backgroundColor =
                                    "var(--theme-50)")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.backgroundColor =
                                    "transparent")
                                }
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
            }),
          ])}
        </div>
      </div>
    </div>
  );
}
