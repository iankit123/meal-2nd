import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
}

export default function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className="mb-4">
        {icon || <Search className="mx-auto w-16 h-16 text-gray-300" />}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6">{description}</p>
      {action && (
        <Button
          onClick={action.onClick}
          className="meal-primary px-6 py-3 rounded-lg font-medium transition-colors"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
