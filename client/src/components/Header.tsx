import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Menu, X, Utensils, Calendar, Bookmark, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Header() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: "/", label: "All Meals", icon: Utensils, active: location === "/" },
    { path: "/week-plan", label: "Week Plan", icon: Calendar, hasNew: true, active: location === "/week-plan" },
    { path: "/bookmarks", label: "Bookmarks", icon: Bookmark, active: location === "/bookmarks" },
  ];

  const NavButton = ({ item, onClick }: { item: typeof navItems[0]; onClick?: () => void }) => (
    <Link href={item.path}>
      <Button
        variant="ghost"
        size="sm"
        className={`flex items-center space-x-2 px-4 py-2 rounded-2xl text-sm font-medium relative transition-all duration-200 transform hover:scale-105 ${
          item.active
            ? "bg-pink-200 text-pink-900 hover:bg-pink-200 shadow-md"
            : "text-pink-700 hover:bg-pink-50 hover:shadow-sm"
        }`}
        onClick={onClick}
      >
        <item.icon className="w-4 h-4" />
        <span>{item.label}</span>
        {item.hasNew && (
          <span className="bg-pink-500 text-white text-xs px-2 py-0.5 rounded-full font-medium shadow-sm">
            New
          </span>
        )}
      </Button>
    </Link>
  );

  return (
    <header className="bg-white shadow-xl border-b-4 border-pink-200 sticky top-0 z-50">
      <div className="max-w-md mx-auto px-4 py-4">
        {/* Header Content */}
        <div className="flex items-center justify-between mb-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-pink-400 rounded-2xl flex items-center justify-center shadow-lg transform rotate-12">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-handwritten font-bold text-pink-900 transform -rotate-2">
              Meal planner
            </h1>
          </Link>
          
          {/* Mobile Menu Button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden p-2 rounded-2xl hover:bg-pink-50 hover:shadow-md transition-all duration-200">
                <Menu className="w-5 h-5 text-pink-700" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64 bg-pink-50 border-l-4 border-pink-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-handwritten font-bold text-pink-900">Menu</h2>
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
