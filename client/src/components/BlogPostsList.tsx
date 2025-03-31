import { useQuery } from "@tanstack/react-query";
import { Post } from "@shared/schema";
import { BlogCard } from "@/components/ui/blog-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface BlogPostsListProps {
  category?: string;
}

interface PostsResponse {
  posts: Post[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function BlogPostsList({ category }: BlogPostsListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<"newest" | "popular">("newest");

  const queryUrl = category 
    ? `/api/posts?category=${encodeURIComponent(category)}&page=${currentPage}`
    : `/api/posts?page=${currentPage}`;

  const { data, isLoading, error } = useQuery<PostsResponse>({
    queryKey: [queryUrl],
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-8 w-40" />
          <div className="flex space-x-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>

        <div className="space-y-6">
          {[1, 2, 3].map((index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden p-6">
              <div className="flex items-center mb-2">
                <Skeleton className="h-5 w-24 rounded-full" />
                <span className="mx-2">•</span>
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="mt-2">
                <Skeleton className="h-6 w-full mb-3" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-3/4 mb-4" />
              </div>
              <div className="flex items-center">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-24 ml-3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-md text-center">
        <p className="text-secondary">Failed to load blog posts. Please try again later.</p>
      </div>
    );
  }

  const { posts, pagination } = data;

  if (posts.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-md text-center">
        <p className="text-secondary">No posts found{category ? ` in ${category}` : ''}.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-text">Latest Articles{category ? ` in ${category}` : ''}</h2>
        <div className="flex space-x-2">
          <Button
            onClick={() => setSortBy("newest")}
            variant={sortBy === "newest" ? "default" : "outline"}
            size="sm"
          >
            Newest
          </Button>
          <Button
            onClick={() => setSortBy("popular")}
            variant={sortBy === "popular" ? "default" : "outline"}
            size="sm"
          >
            Popular
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {posts.map((post) => (
          <BlogCard key={post.id} post={post} author={{ id: post.authorId || 1, displayName: "Admin" }} />
        ))}
      </div>

      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
