import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

// Pages
import HomePage from "@/pages/home-page";
import BlogPostPage from "@/pages/blog-post-page";
import AuthPage from "@/pages/auth-page";
import TopicsPage from "@/pages/topics-page";
import TopicPage from "@/pages/topic-page";
import SearchPage from "@/pages/search-page";
import AboutPage from "@/pages/about-page";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminPostEditor from "@/pages/admin-post-editor";
import AdminPostsPage from "@/pages/admin-posts-page";
import AdminSubscribersPage from "@/pages/admin-subscribers-page";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/blog/:slug" component={BlogPostPage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/topics" component={TopicsPage} />
      <Route path="/topics/:category" component={TopicPage} />
      <Route path="/search" component={SearchPage} />
      <Route path="/about" component={AboutPage} />
      
      {/* Admin Routes - Protected */}
      <ProtectedRoute path="/admin" component={AdminDashboard} adminOnly />
      <ProtectedRoute path="/admin/posts" component={AdminPostsPage} adminOnly />
      <ProtectedRoute path="/admin/posts/new" component={AdminPostEditor} adminOnly />
      <ProtectedRoute path="/admin/posts/edit/:id" component={AdminPostEditor} adminOnly />
      <ProtectedRoute path="/admin/subscribers" component={AdminSubscribersPage} adminOnly />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
