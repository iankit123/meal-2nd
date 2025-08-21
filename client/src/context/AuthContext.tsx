import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth, initializeAuth } from "../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useQueryClient } from "@tanstack/react-query";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  authError: boolean;
  isAnonymous: boolean;
  username: string | null;
  isAuthenticated: boolean;
  createUser: (username: string) => Promise<void>;
  loginUser: (username: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  authError: false,
  isAnonymous: false,
  username: null,
  isAuthenticated: false,
  createUser: async () => {},
  loginUser: async () => {},
  logout: () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Initialize anonymous authentication
        const authUser = await initializeAuth();
        if (!authUser) {
          setAuthError(true);
          // Create a temporary fake user for development
          setUser({ uid: 'temp-user-' + Date.now() } as User);
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);
        setAuthError(true);
        // Create a temporary fake user for development
        setUser({ uid: 'temp-user-' + Date.now() } as User);
      }
      setLoading(false);
    };

    initAuth();

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setAuthError(false);
        setIsAnonymous(user.isAnonymous || false);
        console.log('Firebase Auth working! User ID:', user.uid);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const createUser = async (newUsername: string) => {
    try {
      // Initialize anonymous auth if not already done
      let authUser = user;
      if (!authUser) {
        authUser = await initializeAuth();
      }

      if (!authUser) {
        throw new Error('Failed to initialize authentication');
      }

      // Use Firebase as primary storage (no fallbacks for cross-browser persistence)
      try {
        // Check if username already exists in Firebase
        const usernameDoc = await getDoc(doc(db, 'usernames', newUsername));
        if (usernameDoc.exists()) {
          throw new Error('Username already exists');
        }

        // Create username document in Firebase
        await setDoc(doc(db, 'usernames', newUsername), {
          userId: authUser.uid,
          createdAt: new Date(),
        });

        console.log('Username stored in Firebase successfully');
      } catch (firebaseError: any) {
        console.error('Firebase error:', firebaseError);
        if (firebaseError.message?.includes('Username already exists')) {
          throw new Error('Username already exists');
        }
        throw new Error('Unable to save username. Please check your internet connection and try again.');
      }

      setUsername(newUsername);
      setIsAuthenticated(true);
      localStorage.setItem('mealplanner-username', newUsername);
      
      // Clear React Query cache when user changes
      queryClient.clear();
    } catch (error: any) {
      console.error('Failed to create user:', error);
      throw error;
    }
  };

  const loginUser = async (existingUsername: string) => {
    try {
      // Initialize anonymous auth if not already done
      let authUser = user;
      if (!authUser) {
        authUser = await initializeAuth();
      }

      if (!authUser) {
        throw new Error('Failed to initialize authentication');
      }

      // Use Firebase as primary storage (no fallbacks for cross-browser persistence)
      try {
        const usernameDoc = await getDoc(doc(db, 'usernames', existingUsername));
        if (!usernameDoc.exists()) {
          throw new Error('Username not found');
        }
        
        console.log('Username found in Firebase:', existingUsername);
      } catch (firebaseError: any) {
        console.error('Firebase error:', firebaseError);
        if (firebaseError.message?.includes('Username not found')) {
          throw new Error('Username not found');
        }
        throw new Error('Unable to verify username. Please check your internet connection and try again.');
      }

      setUsername(existingUsername);
      setIsAuthenticated(true);
      localStorage.setItem('mealplanner-username', existingUsername);
      
      // Clear React Query cache when user changes
      queryClient.clear();
    } catch (error: any) {
      console.error('Failed to login user:', error);
      throw error;
    }
  };

  // Check for saved username on app start
  useEffect(() => {
    const savedUsername = localStorage.getItem('mealplanner-username');
    if (savedUsername) {
      setUsername(savedUsername);
      setIsAuthenticated(true);
    }
  }, []);

  const logout = () => {
    setUsername(null);
    setIsAuthenticated(false);
    localStorage.removeItem('mealplanner-username');
    
    // Clear React Query cache on logout
    queryClient.clear();
    console.log('User logged out');
  };

  const value = {
    user,
    loading,
    authError,
    isAnonymous,
    username,
    isAuthenticated,
    createUser,
    loginUser,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
