import { auth } from "./firebase";
import { WeekPlan, WeekPlanSlot } from "../types/recipe";
import { getWeekPlanData, saveWeekPlanData } from "./storage";

export const getWeekPlan = async (): Promise<WeekPlan | null> => {
  if (!auth.currentUser) {
    throw new Error("User must be authenticated");
  }

  const data = await getWeekPlanData();
  return data as WeekPlan;
};

export const updateWeekPlan = async (slots: WeekPlan['slots']): Promise<void> => {
  if (!auth.currentUser) {
    throw new Error("User must be authenticated");
  }

  await saveWeekPlanData(slots);
};

export const assignMealToSlot = async (
  day: string,
  mealTime: keyof WeekPlanSlot,
  recipeId: string,
  currentPlan?: WeekPlan | null
): Promise<void> => {
  if (!currentPlan) {
    currentPlan = await getWeekPlan();
    if (!currentPlan) return;
  }

  const updatedSlots = {
    ...currentPlan.slots,
    [day]: {
      ...currentPlan.slots[day],
      [mealTime]: recipeId,
    },
  };

  await updateWeekPlan(updatedSlots);
};

export const removeMealFromSlot = async (
  day: string,
  mealTime: keyof WeekPlanSlot,
  currentPlan?: WeekPlan | null
): Promise<void> => {
  if (!currentPlan) {
    currentPlan = await getWeekPlan();
    if (!currentPlan) return;
  }

  const updatedSlots = {
    ...currentPlan.slots,
    [day]: {
      ...currentPlan.slots[day],
    },
  };

  delete updatedSlots[day][mealTime];

  await updateWeekPlan(updatedSlots);
};
