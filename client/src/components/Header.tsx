import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

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
    <motion.header 
      className="bg-white shadow-sm sticky top-0 z-10"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <motion.div 
              className="flex-shrink-0 flex items-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div 
                onClick={() => navigate("/")} 
                className="flex items-center cursor-pointer"
              >
                <motion.span 
                  className="text-primary font-bold text-xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  Nexpeer
                </motion.span>
                <motion.span 
                  className="text-secondary font-medium ml-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  Tech Blog
                </motion.span>
              </div>
            </motion.div>
            <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <motion.button 
                onClick={() => navigate("/")} 
                className={`${isActive("/") ? "border-primary text-gray-900" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                Home
              </motion.button>
              <motion.button 
                onClick={() => navigate("/topics")} 
                className={`${isActive("/topics") ? "border-primary text-gray-900" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                Topics
              </motion.button>
              <motion.button 
                onClick={() => navigate("/about")} 
                className={`${isActive("/about") ? "border-primary text-gray-900" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                About
              </motion.button>
            </nav>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <motion.div 
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {user ? (
                <div className="flex items-center space-x-3">
                  {user.isAdmin && (
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => navigate("/admin")}
                      >
                        Dashboard
                      </Button>
                    </motion.div>
                  )}
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleLogout}
                      disabled={logoutMutation.isPending}
                    >
                      Sign out
                    </Button>
                  </motion.div>
                </div>
              ) : (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="bg-primary text-white hover:bg-primary/90 transition-colors duration-200"
                    onClick={() => navigate("/auth")}
                  >
                    Admin Login
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </div>
          <motion.div 
            className="flex items-center sm:hidden"
            whileTap={{ scale: 0.9 }}
          >
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
          </motion.div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            className="sm:hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="pt-2 pb-3 space-y-1">
              <motion.button 
                onClick={() => goTo("/")} 
                className={`${isActive("/") ? "bg-primary text-white" : "text-gray-500 hover:bg-gray-100"} block w-full text-left pl-3 pr-4 py-2 text-base font-medium`}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                whileTap={{ scale: 0.95 }}
              >
                Home
              </motion.button>
              <motion.button 
                onClick={() => goTo("/topics")} 
                className={`${isActive("/topics") ? "bg-primary text-white" : "text-gray-500 hover:bg-gray-100"} block w-full text-left pl-3 pr-4 py-2 text-base font-medium`}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                whileTap={{ scale: 0.95 }}
              >
                Topics
              </motion.button>
              <motion.button 
                onClick={() => goTo("/about")} 
                className={`${isActive("/about") ? "bg-primary text-white" : "text-gray-500 hover:bg-gray-100"} block w-full text-left pl-3 pr-4 py-2 text-base font-medium`}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                whileTap={{ scale: 0.95 }}
              >
                About
              </motion.button>
              
              {user ? (
                <motion.div 
                  className="px-3 py-3 flex flex-col space-y-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                >
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
                </motion.div>
              ) : (
                <motion.div 
                  className="px-3 py-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                >
                  <Button 
                    variant="default" 
                    className="w-full bg-primary text-white hover:bg-primary/90 transition-colors duration-200"
                    onClick={() => goTo("/auth")}
                  >
                    Admin Login
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}