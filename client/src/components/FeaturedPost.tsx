import { useQuery } from "@tanstack/react-query";
import { Post } from "@shared/schema";
import { Link } from "wouter";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function FeaturedPost() {
  const { data: post, isLoading, error } = useQuery<Post>({
    queryKey: ["/api/featured-post"],
  });

  if (isLoading) {
    return (
      <div className="mb-12">
        <div className="relative rounded-lg overflow-hidden bg-white shadow-md">
          <div className="lg:flex">
            <div className="lg:w-1/2">
              <Skeleton className="h-64 w-full object-cover lg:h-full" />
            </div>
            <div className="lg:w-1/2 p-6 lg:p-8">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-full mb-3" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-6" />
              <div className="flex items-center">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="ml-3">
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="mb-12 bg-white rounded-lg p-6 shadow-md text-center">
        <p className="text-secondary">No featured post available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="mb-12">
      <div className="relative rounded-lg overflow-hidden bg-white shadow-md">
        <div className="lg:flex">
          <div className="lg:w-1/2">
            {post.featuredImage ? (
              <img 
                className="h-64 w-full object-cover lg:h-full" 
                src={post.featuredImage} 
                alt={`Featured post about ${post.title}`} 
              />
            ) : (
              <div className="h-64 w-full bg-gray-200 flex items-center justify-center lg:h-full">
                <span className="text-gray-400">No image available</span>
              </div>
            )}
          </div>
          <div className="lg:w-1/2 p-6 lg:p-8">
            <div className="uppercase tracking-wide text-xs font-semibold text-accent">Featured</div>
            <Link href={`/blog/${post.slug}`} className="block mt-2">
              <p className="text-2xl font-bold text-text hover:text-primary transition-colors duration-200">{post.title}</p>
              <p className="mt-3 text-secondary line-clamp-3">
                {post.excerpt}
              </p>
            </Link>
            <div className="mt-6 flex items-center">
              <div className="flex-shrink-0">
                <img 
                  className="h-10 w-10 rounded-full" 
                  src="https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                  alt="Author profile" 
                />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-text">Admin</p>
                <div className="flex space-x-1 text-xs text-secondary">
                  <time dateTime={post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined}>
                    {post.publishedAt ? format(new Date(post.publishedAt), 'MMM d, yyyy') : 'Draft'}
                  </time>
                  <span>&middot;</span>
                  <span>{post.readTime || 5} min read</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
