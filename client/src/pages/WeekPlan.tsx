import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

import WeekPlanGrid from "../components/WeekPlanGrid";
import EmptyState from "../components/EmptyState";
import { getWeekPlan } from "../lib/weekPlan";
import { getAllRecipes } from "../lib/recipes";

export default function WeekPlan() {
  const [, setLocation] = useLocation();

  const { data: weekPlan, isLoading: weekPlanLoading, refetch: refetchWeekPlan } = useQuery({
    queryKey: ['/api/week-plan'],
    queryFn: getWeekPlan,
  });

  const { data: recipes = [] } = useQuery({
    queryKey: ['/api/recipes'],
    queryFn: getAllRecipes,
  });

  if (weekPlanLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-96 bg-gray-200 rounded-xl animate-pulse"></div>
      </div>
    );
  }

  const hasRecipes = recipes.length > 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back Button - only show on mobile */}
      <Button
        onClick={() => setLocation("/")}
        variant="outline"
        size="sm"
        className="mb-4 md:hidden"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Week Plan</h1>
        <p className="text-gray-600">
          Plan your meals for the week by assigning recipes to specific days and meal times.
        </p>
      </div>

      {hasRecipes ? (
        weekPlan && (
          <WeekPlanGrid
            weekPlan={weekPlan}
            onUpdate={refetchWeekPlan}
          />
        )
      ) : (
        <EmptyState
          title="No recipes available"
          description="You need to create some recipes before you can plan your week. Start by adding your first recipe."
          action={{
            label: "Add Your First Recipe",
            onClick: () => setLocation("/add"),
          }}
          icon={<Calendar className="mx-auto w-16 h-16 text-gray-300" />}
        />
      )}
    </div>
  );
}
