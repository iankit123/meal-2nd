
export interface Recipe {
  id: string;
  title: string;
  instructions: string;
  mealType: "breakfast" | "lunchDinner" | "snack";
  imageUrl: string;
  imagePath: string;
  instagramLink?: string;
  recipeLink?: string;
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
