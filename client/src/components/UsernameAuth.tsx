import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, UserPlus, AlertCircle, Check } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function UsernameAuth() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { createUser, loginUser } = useAuth();

  const validateUsername = (username: string) => {
    const alphanumeric = /^[a-zA-Z0-9]+$/;
    if (!username.trim()) {
      return "Username is required";
    }
    if (username.length < 3) {
      return "Username must be at least 3 characters";
    }
    if (username.length > 50) {
      return "Username must be less than 50 characters";
    }
    if (!alphanumeric.test(username)) {
      return "Username can only contain letters and numbers";
    }
    return null;
  };

  const handleCreateUser = async () => {
    setError("");
    setSuccess("");

    const validationError = validateUsername(username);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    try {
      await createUser(username.trim());
      setSuccess(`Welcome ${username}! Your account has been created.`);
      // Auto-login will happen in the auth context
    } catch (err: any) {
      console.log("Create user error:", err);
      if (
        err.message?.includes("already exists") ||
        err.message?.includes("Username already exists")
      ) {
        setError("Username already exists. Please choose a different one.");
      } else {
        setError("Failed to create account. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginUser = async () => {
    setError("");
    setSuccess("");

    const validationError = validateUsername(username);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    try {
      await loginUser(username.trim());
      setSuccess(`Welcome back ${username}!`);
    } catch (err: any) {
      if (err.message?.includes("not found")) {
        setError(
          "Username not found. Please create an account or check spelling.",
        );
      } else {
        setError("Failed to login. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background:
          "linear-gradient(135deg, var(--theme-50) 0%, var(--theme-100) 100%)",
      }}
    >
      <Card
        className="w-full max-w-md shadow-xl"
        style={{
          borderColor: "var(--theme-200)",
          borderWidth: "3px",
        }}
      >
        <CardHeader className="text-center">
          <CardTitle
            className="text-2xl font-handwritten font-bold"
            style={{ color: "var(--theme-900)" }}
          >
            Welcome to Meal Planner
          </CardTitle>
          <CardDescription style={{ color: "var(--theme-700)" }}>
            No Password Required. Just a Username.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="create" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger
                value="create"
                className="flex items-center space-x-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create Username</span>
              </TabsTrigger>
              <TabsTrigger
                value="login"
                className="flex items-center space-x-2"
              >
                <User className="w-4 h-4" />
                <span>Existing user</span>
              </TabsTrigger>
            </TabsList>

            <div className="space-y-4">
              <Input
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    const activeTab = document
                      .querySelector('[data-state="active"]')
                      ?.getAttribute("value");
                    if (activeTab === "create") {
                      handleCreateUser();
                    } else {
                      handleLoginUser();
                    }
                  }
                }}
                disabled={isLoading}
                className="text-center font-medium"
                style={
                  {
                    borderColor: "var(--theme-300)",
                    "--focus-ring-color": "var(--theme-500)",
                  } as React.CSSProperties
                }
              />

              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <Check className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    {success}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <TabsContent value="create" className="mt-4">
              <Button
                onClick={handleCreateUser}
                disabled={isLoading}
                className="w-full font-medium"
                style={{
                  backgroundColor: "var(--theme-600)",
                  color: "white",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--theme-700)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--theme-600)";
                }}
              >
                {isLoading ? "Creating Account..." : "Create Username"}
              </Button>
              <p
                className="text-xs text-center mt-2"
                style={{ color: "var(--theme-600)" }}
              >
                Username must be 3-50 characters, letters and numbers only
              </p>
            </TabsContent>

            <TabsContent value="login" className="mt-4">
              <Button
                onClick={handleLoginUser}
                disabled={isLoading}
                className="w-full font-medium"
                style={{
                  backgroundColor: "var(--theme-600)",
                  color: "white",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--theme-700)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--theme-600)";
                }}
              >
                {isLoading ? "Logging In..." : "Access My Meals"}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
