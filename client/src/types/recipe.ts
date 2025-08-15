export interface Ingredient {
  name: string;
  qty?: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  mealType: "breakfast" | "lunchDinner" | "snack";
  tags: string[];
  ingredients: Ingredient[];
  steps: string[];
  imageUrl: string;
  imagePath: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  bookmarkedBy: string[];
}

export interface WeekPlanSlot {
  breakfast?: string;
  lunch?: string;
  dinner?: string;
}

export interface WeekPlan {
  uid: string;
  slots: {
    [day: string]: WeekPlanSlot;
  };
  updatedAt: Date;
}

export type MealType = Recipe['mealType'];
export type CategoryFilter = MealType | 'all';
