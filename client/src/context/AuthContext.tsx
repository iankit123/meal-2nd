import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth, initializeAuth } from "../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  authError: boolean;
  isAnonymous: boolean;
  username: string | null;
  isAuthenticated: boolean;
  createUser: (username: string) => Promise<void>;
  loginUser: (username: string) => Promise<void>;
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

      // For development/demo purposes, use localStorage to check username uniqueness
      const existingUsernames = JSON.parse(localStorage.getItem('mealplanner-usernames') || '[]');
      if (existingUsernames.includes(newUsername)) {
        throw new Error('Username already exists');
      }

      // Store username locally for demo
      existingUsernames.push(newUsername);
      localStorage.setItem('mealplanner-usernames', JSON.stringify(existingUsernames));

      // Try Firebase first, but fall back to local storage if it fails
      try {
        // Check if username already exists in Firebase
        const usernameDoc = await getDoc(doc(db, 'usernames', newUsername));
        if (usernameDoc.exists()) {
          throw new Error('Username already exists');
        }

        // Create username document
        await setDoc(doc(db, 'usernames', newUsername), {
          userId: authUser.uid,
          createdAt: new Date(),
        });

        // Create user profile
        await setDoc(doc(db, 'users', authUser.uid), {
          username: newUsername,
          createdAt: new Date(),
        });
      } catch (firebaseError) {
        console.warn('Firebase not available, using local storage:', firebaseError);
      }

      setUsername(newUsername);
      setIsAuthenticated(true);
      localStorage.setItem('mealplanner-username', newUsername);
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

      // Check localStorage first for demo purposes
      const existingUsernames = JSON.parse(localStorage.getItem('mealplanner-usernames') || '[]');
      if (!existingUsernames.includes(existingUsername)) {
        // Try Firebase as fallback
        try {
          const usernameDoc = await getDoc(doc(db, 'usernames', existingUsername));
          if (!usernameDoc.exists()) {
            throw new Error('Username not found');
          }
          
          const userData = usernameDoc.data();
          
          // Update current user to match the username's user ID
          await setDoc(doc(db, 'users', authUser.uid), {
            username: existingUsername,
            originalUserId: userData.userId,
            loginAt: new Date(),
          });
        } catch (firebaseError) {
          // If not in localStorage and Firebase fails, username doesn't exist
          throw new Error('Username not found');
        }
      }

      setUsername(existingUsername);
      setIsAuthenticated(true);
      localStorage.setItem('mealplanner-username', existingUsername);
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

  const value = {
    user,
    loading,
    authError,
    isAnonymous,
    username,
    isAuthenticated,
    createUser,
    loginUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
