import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  orderBy,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage, auth } from "./firebase";
import { Recipe } from "../types/recipe";
import { v4 as uuidv4 } from "uuid";

const RECIPES_COLLECTION = "recipes";

export interface RecipeFormData {
  title: string;
  instructions: string;
  mealType: Recipe['mealType'];
  instagramLink?: string;
  recipeLink?: string;
  image?: File;
}

export const createRecipe = async (formData: RecipeFormData): Promise<string> => {
  if (!auth.currentUser) {
    throw new Error("User must be authenticated");
  }

  let imageUrl = "";
  let imagePath = "";

  // Upload image if provided
  if (formData.image) {
    const imageId = uuidv4();
    imagePath = `recipes/${auth.currentUser.uid}/${imageId}_${formData.image.name}`;
    const imageRef = ref(storage, imagePath);
    
    const snapshot = await uploadBytes(imageRef, formData.image);
    imageUrl = await getDownloadURL(snapshot.ref);
  }

  const recipeData = {
    title: formData.title,
    instructions: formData.instructions,
    mealType: formData.mealType,
    instagramLink: formData.instagramLink || "",
    recipeLink: formData.recipeLink || "",
    imageUrl,
    imagePath,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: auth.currentUser.uid,
    bookmarkedBy: [],
  };

  const docRef = await addDoc(collection(db, RECIPES_COLLECTION), recipeData);
  return docRef.id;
};

export const updateRecipe = async (id: string, formData: RecipeFormData, existingImagePath?: string): Promise<void> => {
  if (!auth.currentUser) {
    throw new Error("User must be authenticated");
  }

  let imageUrl = "";
  let imagePath = existingImagePath || "";

  // Handle image update
  if (formData.image) {
    // Delete old image if exists
    if (existingImagePath) {
      try {
        const oldImageRef = ref(storage, existingImagePath);
        await deleteObject(oldImageRef);
      } catch (error) {
        console.warn("Failed to delete old image:", error);
      }
    }

    // Upload new image
    const imageId = uuidv4();
    imagePath = `recipes/${auth.currentUser.uid}/${imageId}_${formData.image.name}`;
    const imageRef = ref(storage, imagePath);
    
    const snapshot = await uploadBytes(imageRef, formData.image);
    imageUrl = await getDownloadURL(snapshot.ref);
  }

  const recipeRef = doc(db, RECIPES_COLLECTION, id);
  const updateData: any = {
    title: formData.title,
    instructions: formData.instructions,
    mealType: formData.mealType,
    instagramLink: formData.instagramLink || "",
    recipeLink: formData.recipeLink || "",
    updatedAt: serverTimestamp(),
  };

  if (imageUrl) {
    updateData.imageUrl = imageUrl;
    updateData.imagePath = imagePath;
  }

  await updateDoc(recipeRef, updateData);
};

export const deleteRecipe = async (id: string): Promise<void> => {
  if (!auth.currentUser) {
    throw new Error("User must be authenticated");
  }

  // Get recipe to check ownership and get image path
  const recipeRef = doc(db, RECIPES_COLLECTION, id);
  const recipeSnap = await getDoc(recipeRef);
  
  if (!recipeSnap.exists()) {
    throw new Error("Recipe not found");
  }

  const recipe = recipeSnap.data();
  if (recipe.createdBy !== auth.currentUser.uid) {
    throw new Error("Not authorized to delete this recipe");
  }

  // Delete image from storage if exists
  if (recipe.imagePath) {
    try {
      const imageRef = ref(storage, recipe.imagePath);
      await deleteObject(imageRef);
    } catch (error) {
      console.warn("Failed to delete recipe image:", error);
    }
  }

  // Delete recipe document
  await deleteDoc(recipeRef);
};

export const getAllRecipes = async (): Promise<Recipe[]> => {
  const q = query(collection(db, RECIPES_COLLECTION), orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    updatedAt: doc.data().updatedAt?.toDate() || new Date(),
  })) as Recipe[];
};

export const getRecipeById = async (id: string): Promise<Recipe | null> => {
  const docRef = doc(db, RECIPES_COLLECTION, id);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Recipe;
  }
  
  return null;
};

export const toggleBookmark = async (recipeId: string, isCurrentlyBookmarked?: boolean): Promise<void> => {
  if (!auth.currentUser) {
    throw new Error("User must be authenticated");
  }

  const recipeRef = doc(db, RECIPES_COLLECTION, recipeId);
  
  // If we know the current state, skip the read operation
  if (isCurrentlyBookmarked !== undefined) {
    if (isCurrentlyBookmarked) {
      await updateDoc(recipeRef, {
        bookmarkedBy: arrayRemove(auth.currentUser.uid),
      });
    } else {
      await updateDoc(recipeRef, {
        bookmarkedBy: arrayUnion(auth.currentUser.uid),
      });
    }
    return;
  }

  // Fallback: read first if state unknown (backwards compatibility)
  const recipeSnap = await getDoc(recipeRef);
  
  if (!recipeSnap.exists()) {
    throw new Error("Recipe not found");
  }

  const recipe = recipeSnap.data();
  const bookmarkedBy = recipe.bookmarkedBy || [];
  const isBookmarked = bookmarkedBy.includes(auth.currentUser.uid);

  if (isBookmarked) {
    await updateDoc(recipeRef, {
      bookmarkedBy: arrayRemove(auth.currentUser.uid),
    });
  } else {
    await updateDoc(recipeRef, {
      bookmarkedBy: arrayUnion(auth.currentUser.uid),
    });
  }
};

export const getBookmarkedRecipes = async (): Promise<Recipe[]> => {
  if (!auth.currentUser) {
    return [];
  }

  const allRecipes = await getAllRecipes();
  return allRecipes.filter(recipe => 
    recipe.bookmarkedBy.includes(auth.currentUser!.uid)
  );
};

export const searchRecipes = (recipes: Recipe[], searchTerm: string): Recipe[] => {
  if (!searchTerm.trim()) return recipes;
  
  const term = searchTerm.toLowerCase();
  return recipes.filter(recipe => 
    recipe.title.toLowerCase().includes(term) ||
    recipe.instructions.toLowerCase().includes(term)
  );
};

export const filterRecipesByMealType = (recipes: Recipe[], mealType: Recipe['mealType'] | 'all'): Recipe[] => {
  if (mealType === 'all') return recipes;
  return recipes.filter(recipe => recipe.mealType === mealType);
};
