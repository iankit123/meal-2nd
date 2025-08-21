// Unified storage layer that handles Firebase errors gracefully
// and falls back to server API when Firebase is unavailable

import { doc, setDoc, getDoc, collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "./firebase";

interface WeekPlanData {
  uid: string;
  slots: any;
  updatedAt: Date;
}

interface RecipeData {
  id?: string;
  title: string;
  instructions: string;
  mealType: string;
  createdBy: string;
  [key: string]: any;
}

// Get current username for data isolation
const getCurrentUsername = (): string => {
  return localStorage.getItem('mealplanner-username') || 'anonymous';
};

// Week Plan Storage - Firebase Primary (No fallbacks)
export const getWeekPlanData = async (): Promise<WeekPlanData | null> => {
  const username = getCurrentUsername();
  
  try {
    const docRef = doc(db, 'weekPlans', username);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log('Week plan data retrieved from Firebase:', data);
      return {
        uid: docSnap.id,
        ...data,
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    } else {
      // Return empty week plan for new users
      const emptyPlan = {
        uid: username,
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
      
      console.log('No existing week plan found, returning empty plan for:', username);
      return emptyPlan;
    }
  } catch (error) {
    console.error('Firebase error retrieving week plan:', error);
    throw new Error('Unable to retrieve meal plan. Please check your internet connection and try again.');
  }
};

export const saveWeekPlanData = async (slots: any): Promise<void> => {
  const username = getCurrentUsername();
  const weekPlanData = {
    uid: username,
    slots,
    updatedAt: new Date(),
  };

  // Use Firebase as primary storage (no fallbacks for cross-browser persistence)
  try {
    const docRef = doc(db, 'weekPlans', username);
    await setDoc(docRef, weekPlanData, { merge: true });
    console.log('Week plan saved to Firebase successfully');
  } catch (error) {
    console.error('Firebase error saving week plan:', error);
    throw new Error('Unable to save meal plan. Please check your internet connection and try again.');
  }
};

// Recipe Storage - Firebase Primary (No fallbacks)
export const getRecipesData = async (): Promise<RecipeData[]> => {
  try {
    const q = query(collection(db, 'recipes'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as RecipeData[];
  } catch (error) {
    console.error('Firebase error retrieving recipes:', error);
    throw new Error('Unable to retrieve recipes. Please check your internet connection and try again.');
  }
};