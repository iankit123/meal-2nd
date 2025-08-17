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

      // Try server API first for reliable cross-browser username storage
      try {
        const response = await fetch('/api/usernames', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username: newUsername }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create username');
        }

        console.log('Username stored on server successfully');
      } catch (serverError: any) {
        console.warn('Server not available, trying Firebase...', serverError);
        
        // Try Firebase as fallback
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
          console.warn('Firebase not available, using local storage:', firebaseError);
          
          // Final fallback to localStorage for demo purposes
          const existingUsernames = JSON.parse(localStorage.getItem('mealplanner-usernames') || '[]');
          if (existingUsernames.includes(newUsername)) {
            throw new Error('Username already exists');
          }

          // Store username locally for demo
          existingUsernames.push(newUsername);
          localStorage.setItem('mealplanner-usernames', JSON.stringify(existingUsernames));
        }
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

      // Try server API first for reliable cross-browser username lookup
      try {
        const response = await fetch(`/api/usernames/${existingUsername}`);
        if (!response.ok) {
          throw new Error('Server API failed');
        }
        
        const data = await response.json();
        if (!data.exists) {
          throw new Error('Username not found');
        }
        
        console.log('Username found on server:', existingUsername);
      } catch (serverError: any) {
        console.warn('Server not available, trying Firebase...', serverError);
        
        // Try Firebase as fallback
        try {
          const usernameDoc = await getDoc(doc(db, 'usernames', existingUsername));
          if (!usernameDoc.exists()) {
            throw new Error('Username not found');
          }
          
          console.log('Username found in Firebase:', existingUsername);
        } catch (firebaseError: any) {
          console.warn('Firebase not available, checking local storage:', firebaseError);
          
          // Final fallback to localStorage for demo purposes
          const existingUsernames = JSON.parse(localStorage.getItem('mealplanner-usernames') || '[]');
          if (!existingUsernames.includes(existingUsername)) {
            throw new Error('Username not found');
          }
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

  const logout = () => {
    setUsername(null);
    setIsAuthenticated(false);
    localStorage.removeItem('mealplanner-username');
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
