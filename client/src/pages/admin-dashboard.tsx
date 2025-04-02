import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/AdminLayout";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  PlusCircle, 
  FileText, 
  Users, 
  TrendingUp, 
  Database, 
  AlertCircle, 
  Info,
  HardDrive,
  Server
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
      <DatabaseStatus />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-4">
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

// Database status component to show the current storage mode and connection status
function DatabaseStatus() {
  // Interface for the system status response
  interface SystemStatus {
    database: {
      type: 'memory' | 'mongodb';
      connected: boolean;
      connectionState: number;
      readyStates: {
        [key: string]: string;
      }
    };
    server: {
      environment: string;
      uptime: string;
    };
    memory: {
      usage: string;
      total: string;
    };
  }

  const { data, isLoading, error, refetch } = useQuery<SystemStatus>({
    queryKey: ['/api/admin/system/status'],
    queryFn: async () => {
      const res = await fetch('/api/admin/system/status', { credentials: 'include' });
      
      if (!res.ok) {
        throw new Error('Failed to fetch system status');
      }
      
      return res.json();
    },
    // Refresh every 30 seconds to monitor connection status
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-40" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>System Status Error</AlertTitle>
        <AlertDescription>
          Unable to fetch system status information. The server may be experiencing issues.
        </AlertDescription>
      </Alert>
    );
  }

  if (!data) {
    return null;
  }

  // Determine the status styling based on the database type and connection state
  const isMemoryMode = data.database.type === 'memory';
  const isConnected = data.database.connected;
  
  const statusColor = isMemoryMode 
    ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
    : (isConnected ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200');
  
  const statusIcon = isMemoryMode 
    ? <HardDrive className="h-4 w-4" /> 
    : (isConnected ? <Database className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />);
  
  const statusText = isMemoryMode 
    ? 'Using Memory Storage' 
    : (isConnected ? 'MongoDB Connected' : 'MongoDB Disconnected');
  
  const readyStateDesc = data.database.readyStates[data.database.connectionState] || 'Unknown';

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className={`px-3 py-1 flex items-center gap-1 ${statusColor}`}>
                    {statusIcon}
                    {statusText}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent className="max-w-md">
                  <div className="space-y-2 p-1">
                    <p className="font-semibold">Database Information</p>
                    <div className="text-xs space-y-1">
                      <p><span className="font-medium">Type:</span> {data.database.type}</p>
                      <p><span className="font-medium">Connected:</span> {data.database.connected ? 'Yes' : 'No'}</p>
                      <p><span className="font-medium">State:</span> {readyStateDesc} ({data.database.connectionState})</p>
                      {isMemoryMode && (
                        <p className="italic text-muted-foreground mt-1">
                          Memory storage does not persist data between server restarts.
                        </p>
                      )}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <div className="flex items-center text-sm text-muted-foreground">
              <Server className="h-4 w-4 mr-1" />
              <span>Server uptime: {data.server.uptime}</span>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => refetch()}
            className="h-8 w-8 p-0"
          >
            <span className="sr-only">Refresh Status</span>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </Button>
        </div>
      </CardContent>
    </Card>
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
