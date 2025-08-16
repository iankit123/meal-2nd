import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "./firebase";
import { WeekPlan, WeekPlanSlot } from "../types/recipe";

const WEEK_PLANS_COLLECTION = "weekPlans";

export const getWeekPlan = async (): Promise<WeekPlan | null> => {
  if (!auth.currentUser) {
    throw new Error("User must be authenticated");
  }

  const docRef = doc(db, WEEK_PLANS_COLLECTION, auth.currentUser.uid);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      uid: docSnap.id,
      ...data,
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as WeekPlan;
  }
  
  // Return empty week plan if doesn't exist
  return {
    uid: auth.currentUser.uid,
    slots: {
      monday: {},
      tuesday: {},
      wednesday: {},
      thursday: {},
      friday: {},
      saturday: {},
      sunday: {},
    },
    updatedAt: new Date(),
  };
};

export const updateWeekPlan = async (slots: WeekPlan['slots']): Promise<void> => {
  if (!auth.currentUser) {
    throw new Error("User must be authenticated");
  }

  const weekPlanData = {
    uid: auth.currentUser.uid,
    slots,
    updatedAt: serverTimestamp(),
  };

  const docRef = doc(db, WEEK_PLANS_COLLECTION, auth.currentUser.uid);
  await setDoc(docRef, weekPlanData, { merge: true });
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
