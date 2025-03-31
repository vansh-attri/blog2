import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/AdminLayout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface Subscriber {
  id: number;
  email: string;
  createdAt: string;
}

export default function AdminSubscribersPage() {
  const { data: subscribers, isLoading, error } = useQuery<Subscriber[]>({
    queryKey: ['/api/admin/subscribers'],
  });

  return (
    <AdminLayout title="Newsletter Subscribers">
      <Card>
        <CardHeader>
          <CardTitle>Subscribers</CardTitle>
          <CardDescription>
            Manage your newsletter subscribers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : error ? (
            <div className="text-center py-4 text-red-500">
              Error loading subscribers. Please try again.
            </div>
          ) : subscribers && subscribers.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Subscribed On</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscribers.map((subscriber) => (
                    <TableRow key={subscriber.id}>
                      <TableCell>{subscriber.id}</TableCell>
                      <TableCell className="font-medium">{subscriber.email}</TableCell>
                      <TableCell>
                        {format(new Date(subscriber.createdAt), 'MMM d, yyyy')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No subscribers yet. Promote your newsletter to get subscribers.
            </div>
          )}

          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Export Options</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Export your subscriber list for use in email marketing platforms.
            </p>
            <div className="flex gap-2">
              <button
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                onClick={() => {
                  if (subscribers) {
                    const csvContent = "data:text/csv;charset=utf-8," + 
                      "Email,Subscribed On\n" + 
                      subscribers.map(s => 
                        `${s.email},${format(new Date(s.createdAt), 'yyyy-MM-dd')}`
                      ).join("\n");
                    
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement("a");
                    link.setAttribute("href", encodedUri);
                    link.setAttribute("download", "nexpeer-subscribers.csv");
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }
                }}
              >
                Export CSV
              </button>
              <button
                className="px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                onClick={() => {
                  if (subscribers) {
                    // Simple plain text export
                    const textContent = subscribers.map(s => s.email).join("\n");
                    const blob = new Blob([textContent], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.setAttribute("href", url);
                    link.setAttribute("download", "nexpeer-subscribers.txt");
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                  }
                }}
              >
                Export Plain Text
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
