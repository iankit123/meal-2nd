import { Switch, Route, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { useTheme } from "./hooks/useTheme";

import Header from "./components/Header";
import UsernameAuth from "./components/UsernameAuth";
import AllMeals from "./pages/AllMeals";
import Bookmarks from "./pages/Bookmarks";
import RecipeDetails from "./pages/RecipeDetails";
import AddRecipe from "./pages/AddRecipe";
import EditRecipe from "./pages/EditRecipe";
import WeekPlan from "./pages/WeekPlan";
import NotFound from "./pages/not-found";

function Router() {
  // Apply theme colors dynamically from colors.ts
  useTheme();

  const { isAuthenticated, loading } = useAuth();

  // Show loading while checking auth
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background:
            "linear-gradient(135deg, var(--theme-50) 0%, var(--theme-100) 100%)",
        }}
      >
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4"
            style={{ borderColor: "var(--theme-600)" }}
          ></div>
          <p style={{ color: "var(--theme-700)" }}>Loading...</p>
        </div>
      </div>
    );
  }

  // Show username auth if not authenticated
  if (!isAuthenticated) {
    return <UsernameAuth />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-md mx-auto px-4 pb-8 mt-[12px] mb-[12px]">
        <Switch>
          {/* Redirect root "/" → "/week-plan" */}
          <Route path="/" component={() => <Redirect to="/week-plan" />} />

          <Route path="/week-plan" component={WeekPlan} />
          <Route path="/all-meals" component={AllMeals} />
          <Route path="/bookmarks" component={Bookmarks} />
          <Route path="/recipe/:id" component={RecipeDetails} />
          <Route path="/add" component={AddRecipe} />
          <Route path="/edit/:id" component={EditRecipe} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
