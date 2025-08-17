import { Link, useLocation } from "wouter";
import { Utensils, Calendar, Bookmark, Star, LogOut, TestTube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../context/AuthContext";
import { runUsernameTests } from "../utils/testUsername";
import catMascotImage from "@assets/generated_images/Cute_cat_food_mascot_23ee73be.png";

export default function Header() {
  const [location] = useLocation();
  const { username, logout } = useAuth();

  const handleRunTests = async () => {
    console.log('🧪 Running Username System Tests...');
    try {
      const results = await runUsernameTests();
      console.log('📊 Test Results:', results);
      console.log('Server Test:', results.serverTest ? '✅ PASS' : '❌ FAIL');
      console.log('Firebase Test:', results.firebaseTest ? '✅ PASS' : '❌ FAIL');
      console.log('LocalStorage Test:', results.localStorageTest ? '✅ PASS' : '❌ FAIL');
      alert(`Test Results:\nServer Test: ${results.serverTest ? 'PASS' : 'FAIL'}\nFirebase Test: ${results.firebaseTest ? 'PASS' : 'FAIL'}\nLocalStorage Test: ${results.localStorageTest ? 'PASS' : 'FAIL'}\n\nCheck console for detailed logs.`);
    } catch (error) {
      console.error('❌ Test execution failed:', error);
      alert('Test execution failed. Check console for details.');
    }
  };

  const navItems = [
    {
      path: "/week-plan",
      label: "Week Plan",
      icon: Calendar,
      active: location === "/week-plan",
    },
    { path: "/", label: "All Meals", icon: Utensils, active: location === "/" },
    {
      path: "/bookmarks",
      label: "Bookmarks",
      icon: Bookmark,
      active: location === "/bookmarks",
    },
  ];

  const NavButton = ({ item }: { item: (typeof navItems)[0] }) => (
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
      >
        <item.icon className="w-4 h-4" />
        <span>{item.label}</span>
      </Button>
    </Link>
  );

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background:
          "linear-gradient(135deg, var(--theme-100) 0%, var(--theme-50) 100%)",
        borderBottom: "3px solid var(--theme-200)",
      }}
    >
      <div className="max-w-md mx-auto px-6 py-6">
        {/* Top Header Section - Inspired by the reference image */}
        <div className="flex items-center justify-between mb-6">
          {/* Left Star Icon */}
          <div className="transform rotate-12">
            <Star
              className="w-8 h-8"
              style={{ color: "var(--theme-500)" }}
              fill="currentColor"
            />
          </div>

          {/* Centered Title */}
          <Link href="/" className="flex-1 text-center">
            <h1
              className="text-3xl font-handwritten font-bold transform -rotate-1"
              style={{ color: "var(--theme-900)" }}
            >
              Meal planner
            </h1>
          </Link>

          {/* Right Controls and Cat Mascot */}
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleRunTests}
              variant="ghost"
              size="sm"
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
              title="Run Tests"
            >
              <TestTube className="w-4 h-4" style={{ color: "var(--theme-600)" }} />
            </Button>
            <Button
              onClick={logout}
              variant="ghost"
              size="sm"
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
              title={`Logout ${username}`}
            >
              <LogOut className="w-4 h-4" style={{ color: "var(--theme-600)" }} />
            </Button>
            <div className="transform rotate-6">
              <img
                src={catMascotImage}
                alt="Cute cat mascot"
                className={`rounded-2xl shadow-lg ${location === "/" ? "w-16 h-16" : "w-12 h-12"}`}
                style={{
                  border: "3px solid var(--theme-200)",
                  background: "white",
                }}
              />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex justify-center space-x-2">
          {navItems.map((item) => (
            <NavButton key={item.path} item={item} />
          ))}
        </nav>
      </div>
    </header>
  );
}
