import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./context/AuthContext";

import Header from "./components/Header";
import AllMeals from "./pages/AllMeals";
import Bookmarks from "./pages/Bookmarks";
import RecipeDetails from "./pages/RecipeDetails";
import AddRecipe from "./pages/AddRecipe";
import EditRecipe from "./pages/EditRecipe";
import WeekPlan from "./pages/WeekPlan";
import NotFound from "./pages/not-found";

function Router() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-md mx-auto px-4 pb-8">
        <Switch>
          <Route path="/" component={AllMeals} />
          <Route path="/bookmarks" component={Bookmarks} />
          <Route path="/recipe/:id" component={RecipeDetails} />
          <Route path="/add" component={AddRecipe} />
          <Route path="/edit/:id" component={EditRecipe} />
          <Route path="/week-plan" component={WeekPlan} />
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
