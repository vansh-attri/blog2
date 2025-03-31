import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Error logging out",
        description: "There was a problem logging out",
        variant: "destructive",
      });
    }
  };

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  const goTo = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <div 
                onClick={() => navigate("/")} 
                className="flex items-center cursor-pointer"
              >
                <span className="text-primary font-bold text-xl">Nexpeer</span>
                <span className="text-secondary font-medium ml-1">Tech Blog</span>
              </div>
            </div>
            <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <button 
                onClick={() => navigate("/")} 
                className={`${isActive("/") ? "border-primary text-gray-900" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Home
              </button>
              <button 
                onClick={() => navigate("/topics")} 
                className={`${isActive("/topics") ? "border-primary text-gray-900" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Topics
              </button>
              <button 
                onClick={() => navigate("/about")} 
                className={`${isActive("/about") ? "border-primary text-gray-900" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                About
              </button>
            </nav>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-3">
                  {user.isAdmin && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => navigate("/admin")}
                    >
                      Dashboard
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                  >
                    Sign out
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="default" 
                  size="sm" 
                  className="bg-primary text-white hover:bg-primary/90 transition-colors duration-200"
                  onClick={() => navigate("/auth")}
                >
                  Admin Login
                </Button>
              )}
            </div>
          </div>
          <div className="flex items-center sm:hidden">
            <button 
              type="button" 
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              <svg 
                className="h-6 w-6" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M4 6h16M4 12h16M4 18h16" 
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <button 
              onClick={() => goTo("/")} 
              className={`${isActive("/") ? "bg-primary text-white" : "text-gray-500 hover:bg-gray-100"} block w-full text-left pl-3 pr-4 py-2 text-base font-medium`}
            >
              Home
            </button>
            <button 
              onClick={() => goTo("/topics")} 
              className={`${isActive("/topics") ? "bg-primary text-white" : "text-gray-500 hover:bg-gray-100"} block w-full text-left pl-3 pr-4 py-2 text-base font-medium`}
            >
              Topics
            </button>
            <button 
              onClick={() => goTo("/about")} 
              className={`${isActive("/about") ? "bg-primary text-white" : "text-gray-500 hover:bg-gray-100"} block w-full text-left pl-3 pr-4 py-2 text-base font-medium`}
            >
              About
            </button>
            
            {user ? (
              <div className="px-3 py-3 flex flex-col space-y-2">
                {user.isAdmin && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => goTo("/admin")}
                  >
                    Dashboard
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  className="w-full" 
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  disabled={logoutMutation.isPending}
                >
                  Sign out
                </Button>
              </div>
            ) : (
              <div className="px-3 py-3">
                <Button 
                  variant="default" 
                  className="w-full bg-primary text-white hover:bg-primary/90 transition-colors duration-200"
                  onClick={() => goTo("/auth")}
                >
                  Admin Login
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}