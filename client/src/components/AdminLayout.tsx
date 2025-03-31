import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { User, Home, FileText, Users, LogOut, Menu, X } from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logoutMutation } = useAuth();
  const [location, navigate] = useLocation();
  const { toast } = useToast();

  if (!user || !user.isAdmin) {
    navigate("/auth");
    return null;
  }

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
    return location.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Top navigation */}
      <nav className="bg-primary shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/admin" className="flex items-center">
                  <span className="text-white font-bold text-xl">Nexpeer</span>
                  <span className="text-white text-opacity-80 font-medium ml-1">Admin</span>
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <Link href="/">
                <Button variant="ghost" className="text-white hover:bg-primary-dark">
                  <Home className="h-4 w-4 mr-2" />
                  View Blog
                </Button>
              </Link>
              <div className="ml-3">
                <Button 
                  variant="ghost" 
                  className="text-white hover:bg-primary-dark flex items-center" 
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
              <div className="md:hidden ml-2">
                <Button
                  variant="ghost"
                  className="text-white hover:bg-primary-dark"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  {sidebarOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex flex-1">
        {/* Sidebar for larger screens */}
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:pt-16 bg-white shadow">
          <div className="flex-1 flex flex-col pt-5 overflow-y-auto">
            <nav className="flex-1 px-2 space-y-1">
              <Link href="/admin">
                <a className={`${isActive("/admin") && !isActive("/admin/posts") && !isActive("/admin/subscribers") ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-50"} group flex items-center px-2 py-2 text-sm font-medium rounded-md`}>
                  <Home className="h-5 w-5 mr-3" />
                  Dashboard
                </a>
              </Link>
              <Link href="/admin/posts">
                <a className={`${isActive("/admin/posts") ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-50"} group flex items-center px-2 py-2 text-sm font-medium rounded-md`}>
                  <FileText className="h-5 w-5 mr-3" />
                  Posts
                </a>
              </Link>
              <Link href="/admin/subscribers">
                <a className={`${isActive("/admin/subscribers") ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-50"} group flex items-center px-2 py-2 text-sm font-medium rounded-md`}>
                  <Users className="h-5 w-5 mr-3" />
                  Subscribers
                </a>
              </Link>
            </nav>
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <User className="h-8 w-8 rounded-full bg-gray-200 p-1" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">{user.displayName || user.username}</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile sidebar */}
        {sidebarOpen && (
          <div className="md:hidden fixed inset-0 flex z-40">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <nav className="mt-5 px-2 space-y-1">
                  <Link href="/admin">
                    <a className={`${isActive("/admin") && !isActive("/admin/posts") && !isActive("/admin/subscribers") ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-50"} group flex items-center px-2 py-2 text-base font-medium rounded-md`} onClick={() => setSidebarOpen(false)}>
                      <Home className="h-5 w-5 mr-3" />
                      Dashboard
                    </a>
                  </Link>
                  <Link href="/admin/posts">
                    <a className={`${isActive("/admin/posts") ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-50"} group flex items-center px-2 py-2 text-base font-medium rounded-md`} onClick={() => setSidebarOpen(false)}>
                      <FileText className="h-5 w-5 mr-3" />
                      Posts
                    </a>
                  </Link>
                  <Link href="/admin/subscribers">
                    <a className={`${isActive("/admin/subscribers") ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-50"} group flex items-center px-2 py-2 text-base font-medium rounded-md`} onClick={() => setSidebarOpen(false)}>
                      <Users className="h-5 w-5 mr-3" />
                      Subscribers
                    </a>
                  </Link>
                </nav>
              </div>
              <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <User className="h-8 w-8 rounded-full bg-gray-200 p-1" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700">{user.displayName || user.username}</p>
                    <p className="text-xs text-gray-500">Administrator</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="md:pl-64 flex flex-col flex-1">
          <header className="bg-white shadow">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
              <h1 className="text-2xl font-bold text-text">{title}</h1>
            </div>
          </header>
          <main className="flex-1 relative overflow-y-auto focus:outline-none">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
