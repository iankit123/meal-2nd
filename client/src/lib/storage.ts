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

// Week Plan Storage
export const getWeekPlanData = async (): Promise<WeekPlanData | null> => {
  const username = getCurrentUsername();
  
  // Try server API first (more reliable)
  try {
    const response = await fetch(`/api/weekplan/${username}`);
    if (response.ok) {
      const data = await response.json();
      console.log('Week plan data retrieved from server:', data);
      return data;
    }
  } catch (serverError) {
    console.warn('Server API unavailable for week plan retrieval:', serverError);
  }

  // Fallback to Firebase
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
    }
  } catch (error) {
    console.warn('Firebase unavailable for week plan retrieval:', error);
  }
  
  // Return empty week plan structure
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
  
  console.log('Returning empty week plan for username:', username);
  return emptyPlan;
};

export const saveWeekPlanData = async (slots: any): Promise<void> => {
  const username = getCurrentUsername();
  const weekPlanData = {
    uid: username,
    slots,
    updatedAt: new Date(),
  };

  // Try Firebase first
  try {
    const docRef = doc(db, 'weekPlans', username);
    await setDoc(docRef, { ...weekPlanData, updatedAt: new Date() }, { merge: true });
    return;
  } catch (error) {
    console.warn('Firebase unavailable for week plan save:', error);
  }

  // Fallback to server API
  try {
    await fetch(`/api/weekplan/${username}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(weekPlanData),
    });
  } catch (serverError) {
    console.error('Both Firebase and server unavailable for week plan save:', serverError);
    throw new Error('Unable to save week plan - all storage methods failed');
  }
};

// Recipe Storage
export const getRecipesData = async (): Promise<RecipeData[]> => {
  try {
    const q = query(collection(db, 'recipes'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    }));
  } catch (error) {
    console.warn('Firebase unavailable for recipes:', error);
    // For now, return empty array since recipes are less critical for testing isolation
    return [];
  }
};