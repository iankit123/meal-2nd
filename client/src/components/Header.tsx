import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Menu, X, Utensils, Calendar, Bookmark, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import catMascotImage from "@assets/generated_images/Cute_cat_food_mascot_23ee73be.png";

export default function Header() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: "/", label: "All Meals", icon: Utensils, active: location === "/" },
    {
      path: "/week-plan",
      label: "Week Plan",
      icon: Calendar,
      active: location === "/week-plan",
    },
    {
      path: "/bookmarks",
      label: "Bookmarks",
      icon: Bookmark,
      active: location === "/bookmarks",
    },
  ];

  const NavButton = ({
    item,
    onClick,
  }: {
    item: (typeof navItems)[0];
    onClick?: () => void;
  }) => (
    <Link href={item.path}>
      <Button
        variant="ghost"
        size="sm"
        className={`flex items-center space-x-2 px-4 py-2 rounded-2xl text-sm font-medium relative transition-all duration-200 transform hover:scale-105 ${
          item.active ? "shadow-md" : "hover:shadow-sm"
        }`}
        style={{
          backgroundColor: item.active ? "var(--theme-200)" : "transparent",
          color: item.active ? "var(--theme-900)" : "var(--theme-700)",
        }}
        onMouseEnter={(e) => {
          if (!item.active) {
            e.currentTarget.style.backgroundColor = "var(--theme-50)";
          }
        }}
        onMouseLeave={(e) => {
          if (!item.active) {
            e.currentTarget.style.backgroundColor = "transparent";
          }
        }}
        onClick={onClick}
      >
        <item.icon className="w-4 h-4" />
        <span>{item.label}</span>
      </Button>
    </Link>
  );

  return (
    <header
      className="bg-white shadow-xl sticky top-0 z-50"
      style={{ borderBottom: "4px solid var(--theme-200)" }}
    >
      <div className="max-w-md mx-auto px-4 py-4">
        {/* Header Content */}
        <div className="flex items-center justify-between mb-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg transform rotate-12"
              style={{ backgroundColor: "var(--theme-400)" }}
            >
              <Heart className="w-5 h-5 text-white" />
            </div>
            <h1
              className="text-2xl font-handwritten font-bold transform -rotate-2"
              style={{ color: "var(--theme-900)" }}
            >
              Meal planner
            </h1>
            <img
              src={catMascotImage}
              alt="Cute cat mascot"
              className="rounded-xl shadow-md transform w-14 h-14 ml-[41px] mr-[41px]"
            />
          </Link>

          {/* Mobile Menu Button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden p-2 rounded-2xl hover:shadow-md transition-all duration-200"
                style={
                  { "--hover-bg": "var(--theme-50)" } as React.CSSProperties
                }
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "var(--theme-50)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <Menu
                  className="w-5 h-5"
                  style={{ color: "var(--theme-700)" }}
                />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-64"
              style={{
                backgroundColor: "var(--theme-50)",
                borderLeft: "4px solid var(--theme-200)",
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2
                  className="text-lg font-handwritten font-bold"
                  style={{ color: "var(--theme-900)" }}
                >
                  Menu
                </h2>
              </div>
              <nav className="space-y-3">
                {navItems.map((item) => (
                  <NavButton
                    key={item.path}
                    item={item}
                    onClick={() => setMobileMenuOpen(false)}
                  />
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 overflow-x-auto">
          {navItems.map((item) => (
            <NavButton key={item.path} item={item} />
          ))}
        </nav>
      </div>
    </header>
  );
}
