import { Post } from "@shared/schema";
import { Link } from "wouter";
import { format } from "date-fns";

interface BlogCardProps {
  post: Post;
  author?: {
    id: number;
    displayName: string;
    profileImage?: string;
  };
}

export function BlogCard({ post, author }: BlogCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <Link href={`/blog/${post.slug}`} className="block hover:bg-gray-50 transition-colors duration-200">
        <div className="p-6">
          <div className="flex items-center mb-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {post.category}
            </span>
            <span className="mx-2 text-gray-300">•</span>
            <time 
              dateTime={post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined} 
              className="text-sm text-secondary"
            >
              {post.publishedAt 
                ? format(new Date(post.publishedAt), 'MMM dd, yyyy') 
                : 'Draft'}
            </time>
          </div>
          <div className="block mt-2">
            <p className="text-xl font-semibold text-text">{post.title}</p>
            <p className="mt-3 text-secondary">
              {post.excerpt}
            </p>
          </div>
          {author && (
            <div className="mt-4 flex items-center">
              <div className="flex-shrink-0">
                <img 
                  className="h-8 w-8 rounded-full" 
                  src={author.profileImage || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"} 
                  alt={`${author.displayName}'s profile`} 
                />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-text">{author.displayName}</p>
              </div>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}
