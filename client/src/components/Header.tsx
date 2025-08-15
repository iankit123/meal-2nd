import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Menu, X, Utensils, Calendar, Bookmark } from "lucide-react";
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
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium relative ${
          item.active
            ? "bg-green-50 text-green-700 hover:bg-green-50"
            : "text-gray-600 hover:bg-gray-100"
        }`}
        onClick={onClick}
      >
        <item.icon className="w-4 h-4" />
        <span>{item.label}</span>
        {item.hasNew && (
          <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
            New
          </span>
        )}
      </Button>
    </Link>
  );

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-md mx-auto px-4 py-3">
        {/* Header Content */}
        <div className="flex items-center justify-between mb-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-400 rounded-lg flex items-center justify-center">
              <Utensils className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Meal Book</h1>
          </Link>
          
          {/* Mobile Menu Button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden p-2 rounded-lg hover:bg-gray-100">
                <Menu className="w-5 h-5 text-gray-600" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
              </div>
              <nav className="space-y-2">
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
