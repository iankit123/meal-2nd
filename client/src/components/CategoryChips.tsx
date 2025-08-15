import { Button } from "@/components/ui/button";
import { CategoryFilter } from "../types/recipe";

interface CategoryChipsProps {
  selectedCategory: CategoryFilter;
  onCategoryChange: (category: CategoryFilter) => void;
}

export default function CategoryChips({ selectedCategory, onCategoryChange }: CategoryChipsProps) {
  const categories: { value: CategoryFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "breakfast", label: "Breakfast" },
    { value: "lunchDinner", label: "Lunch/Dinner" },
    { value: "snack", label: "Snack" },
  ];

  return (
    <div className="flex space-x-2 overflow-x-auto pb-1">
      {categories.map((category) => (
        <Button
          key={category.value}
          variant="ghost"
          size="sm"
          onClick={() => onCategoryChange(category.value)}
          className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
            selectedCategory === category.value
              ? "meal-chip-active"
              : "meal-chip-inactive"
          }`}
        >
          {category.label}
        </Button>
      ))}
    </div>
  );
}
