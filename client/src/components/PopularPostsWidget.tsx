import { useQuery } from "@tanstack/react-query";
import { Post } from "@shared/schema";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

export default function PopularPostsWidget() {
  const { data: posts, isLoading, error } = useQuery<Post[]>({
    queryKey: ["/api/popular-posts?limit=5"],
  });

  if (isLoading) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((index) => (
            <div key={index} className="flex items-start">
              <Skeleton className="flex-shrink-0 h-5 w-5" />
              <Skeleton className="ml-2 h-4 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !posts || posts.length === 0) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4 text-text">Most Popular</h3>
        <p className="text-sm text-secondary">No popular posts available.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h3 className="text-lg font-bold mb-4 text-text">Most Popular</h3>
      <div className="space-y-4">
        {posts.map((post, index) => (
          <Link key={post.id} href={`/blog/${post.slug}`} className="flex items-start group">
            <span className="flex-shrink-0 text-lg font-bold text-secondary w-5">{index + 1}.</span>
            <p className="ml-2 text-sm font-medium text-text group-hover:text-primary transition-colors duration-200">
              {post.title}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
