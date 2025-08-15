import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth, initializeAuth } from "../lib/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  authError: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  authError: false,
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
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    loading,
    authError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
