import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/AdminLayout";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileText, Users, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStats {
  posts: number;
  publishedPosts: number;
  draftPosts: number;
  subscribers: number;
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/admin/stats'],
    queryFn: async () => {
      // Fetch total posts
      const postsRes = await fetch('/api/admin/posts', { credentials: 'include' });
      const postsData = await postsRes.json();
      
      // Fetch published posts
      const publishedRes = await fetch('/api/admin/posts?status=published', { credentials: 'include' });
      const publishedData = await publishedRes.json();
      
      // Fetch draft posts
      const draftRes = await fetch('/api/admin/posts?status=draft', { credentials: 'include' });
      const draftData = await draftRes.json();
      
      return {
        posts: postsData.pagination.total,
        publishedPosts: publishedData.pagination.total,
        draftPosts: draftData.pagination.total,
        subscribers: 0, // Keeping the field for type compatibility but not fetching data
      };
    }
  });

  return (
    <AdminLayout title="Dashboard">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-12" />
            ) : (
              <div className="text-2xl font-bold">{stats?.posts || 0}</div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published Posts</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-12" />
            ) : (
              <div className="text-2xl font-bold">{stats?.publishedPosts || 0}</div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-12" />
            ) : (
              <div className="text-2xl font-bold">{stats?.draftPosts || 0}</div>
            )}
          </CardContent>
        </Card>
        

      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Link href="/admin/posts/new">
              <Button className="w-full sm:w-auto">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New Post
              </Button>
            </Link>
            <Link href="/admin/posts">
              <Button variant="outline" className="w-full sm:w-auto">
                <FileText className="mr-2 h-4 w-4" />
                Manage All Posts
              </Button>
            </Link>

          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentPosts />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

function RecentPosts() {
  const { data, isLoading } = useQuery({
    queryKey: ['/api/admin/posts?limit=5'],
    queryFn: async () => {
      const res = await fetch('/api/admin/posts?limit=5', { credentials: 'include' });
      return res.json();
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex justify-between items-center p-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (!data?.posts || data.posts.length === 0) {
    return <p className="text-muted-foreground">No posts yet. Create your first post!</p>;
  }

  return (
    <div className="space-y-2">
      {data.posts.map((post: any) => (
        <div key={post.id} className="flex justify-between items-center p-2 hover:bg-muted rounded">
          <Link href={`/admin/posts/edit/${post.id}`} className="text-sm font-medium hover:text-primary truncate flex-1">
            {post.title}
          </Link>
          <span className={`text-xs px-2 py-1 rounded-full ${
            post.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {post.status}
          </span>
        </div>
      ))}
    </div>
  );
}
