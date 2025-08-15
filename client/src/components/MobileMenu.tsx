import { Link, useLocation } from "wouter";
import { X, Utensils, Calendar, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface MobileMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MobileMenu({ open, onOpenChange }: MobileMenuProps) {
  const [location] = useLocation();

  const navItems = [
    { 
      path: "/", 
      label: "All Meals", 
      icon: Utensils, 
      active: location === "/" 
    },
    { 
      path: "/week-plan", 
      label: "Week Plan", 
      icon: Calendar, 
      hasNew: true, 
      active: location === "/week-plan" 
    },
    { 
      path: "/bookmarks", 
      label: "Bookmarks", 
      icon: Bookmark, 
      active: location === "/bookmarks" 
    },
  ];

  const handleNavClick = () => {
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-64">
        <SheetHeader className="text-left">
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <nav className="space-y-2 mt-6">
          {navItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <Button
                variant="ghost"
                className={`w-full justify-start px-3 py-2 rounded-lg transition-colors ${
                  item.active
                    ? "bg-green-50 text-green-700 hover:bg-green-50"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                onClick={handleNavClick}
              >
                <item.icon className="w-5 h-5 mr-3" />
                <span>{item.label}</span>
                {item.hasNew && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-medium ml-auto">
                    New
                  </span>
                )}
              </Button>
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
