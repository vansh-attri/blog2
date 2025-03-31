import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Post } from "@shared/schema";
import BlogLayout from "@/components/BlogLayout";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, Twitter, Linkedin, Facebook } from "lucide-react";
import PopularPostsWidget from "@/components/PopularPostsWidget";

export default function BlogPostPage() {
  const [, params] = useRoute<{ slug: string }>("/blog/:slug");
  
  const { data: post, isLoading, error } = useQuery<Post>({
    queryKey: [`/api/posts/${params?.slug}`],
    enabled: !!params?.slug,
  });

  // Scroll to top when post changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [params?.slug]);

  if (isLoading) {
    return (
      <BlogLayout>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-10">
            <div className="flex items-center space-x-2 mb-4">
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-6 w-24 mb-4" />
            <Skeleton className="h-12 w-full mb-4" />
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex items-center">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="ml-3">
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            </div>
            <Skeleton className="w-full h-80 rounded-lg mb-8" />
          </div>
          
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-8 w-1/2 my-6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      </BlogLayout>
    );
  }

  if (error || !post) {
    return (
      <BlogLayout>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg p-8 shadow-md text-center">
            <h1 className="text-2xl font-bold text-text mb-4">Post Not Found</h1>
            <p className="text-secondary mb-6">The post you're looking for doesn't exist or has been removed.</p>
            <Link href="/">
              <a className="text-primary hover:text-primary-dark flex items-center justify-center">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to articles
              </a>
            </Link>
          </div>
        </div>
      </BlogLayout>
    );
  }
  
  // A function to generate a formatted date string
  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return 'Draft';
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  // Function to render markdown-like content
  const renderContent = () => {
    return { __html: post.content };
  };

  return (
    <BlogLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article>
          <div className="mb-10">
            <div className="flex items-center space-x-2 mb-4">
              <Link href="/">
                <a className="text-primary hover:text-primary-dark flex items-center space-x-1">
                  <ChevronLeft className="h-4 w-4" />
                  <span className="text-sm font-medium">Back to articles</span>
                </a>
              </Link>
            </div>
            
            <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mb-4">
              {post.category}
            </span>
            
            <h1 className="text-3xl sm:text-4xl font-bold text-text mb-4">{post.title}</h1>
            
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex items-center">
                <img 
                  className="h-10 w-10 rounded-full" 
                  src="https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                  alt="Author profile" 
                />
                <div className="ml-3">
                  <p className="text-sm font-medium text-text">Admin</p>
                  <div className="flex space-x-1 text-xs text-secondary">
                    <time dateTime={post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined}>
                      {formatDate(post.publishedAt)}
                    </time>
                    <span>&middot;</span>
                    <span>{post.readTime || 5} min read</span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.title)}`} target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-primary">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-primary">
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-primary">
                  <Facebook className="h-5 w-5" />
                </a>
              </div>
            </div>
            
            {post.featuredImage && (
              <img 
                src={post.featuredImage} 
                alt={post.title} 
                className="w-full h-80 object-cover rounded-lg mb-8" 
              />
            )}
          </div>

          <div className="article-content prose prose-lg max-w-none font-serif">
            <div dangerouslySetInnerHTML={renderContent()} />
          </div>

          <div className="mt-12 border-t border-gray-200 pt-8">
            <div className="flex items-center space-x-4 mb-6">
              <img 
                className="h-12 w-12 rounded-full" 
                src="https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                alt="Author profile" 
              />
              <div>
                <h3 className="text-lg font-bold text-text">Admin</h3>
                <p className="text-sm text-secondary">Content creator at Nexpeer. Writing about technology, career development, and the future of work.</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-xl font-bold text-text mb-6">Related Posts</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link href="/blog/how-to-prepare-for-technical-interviews-in-2024">
                  <a className="bg-white rounded-lg shadow-sm p-5 hover:shadow-md transition-shadow duration-200">
                    <h4 className="text-lg font-semibold text-text hover:text-primary mb-2">How to Prepare for Technical Interviews in 2024</h4>
                    <p className="text-secondary text-sm mb-3">Learn how to create a portfolio that showcases your skills and makes you stand out to potential employers.</p>
                    <div className="text-sm text-primary font-medium">Read more →</div>
                  </a>
                </Link>
                <Link href="/blog/the-complete-guide-to-modern-frontend-frameworks">
                  <a className="bg-white rounded-lg shadow-sm p-5 hover:shadow-md transition-shadow duration-200">
                    <h4 className="text-lg font-semibold text-text hover:text-primary mb-2">The Complete Guide to Modern Frontend Frameworks</h4>
                    <p className="text-secondary text-sm mb-3">Stay ahead of the curve with these must-have technical and soft skills for software engineers.</p>
                    <div className="text-sm text-primary font-medium">Read more →</div>
                  </a>
                </Link>
              </div>
            </div>
          </div>
        </article>
        
        <div className="mt-10">
          <PopularPostsWidget />
        </div>
      </div>
    </BlogLayout>
  );
}
