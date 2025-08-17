import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import catMascotImage from "@assets/generated_images/Cute_cat_food_mascot_23ee73be.png";

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
    <div className="text-center py-12 cute-card">
      <div className="mb-6">
        {icon || (
          <div className="flex flex-col items-center">
            <img 
              src={catMascotImage} 
              alt="Cute cat mascot" 
              className="w-24 h-24 mx-auto mb-2 rounded-2xl shadow-lg"
            />
            <div className="text-3xl font-handwritten transform -rotate-2" style={{ color: 'var(--theme-700)' }}>
              A great ♥ way to organise your day
            </div>
          </div>
        )}
      </div>
      <h3 className="text-xl font-handwritten font-bold mb-3 transform rotate-1" style={{ color: 'var(--theme-900)' }}>{title}</h3>
      <p className="mb-8 font-medium" style={{ color: 'var(--theme-600)' }}>{description}</p>
      {action && (
        <Button
          onClick={action.onClick}
          className="cute-button px-8 py-3 font-bold"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
