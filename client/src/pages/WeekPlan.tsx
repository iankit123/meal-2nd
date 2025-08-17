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
