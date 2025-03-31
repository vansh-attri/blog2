import { useQuery } from "@tanstack/react-query";
import { Post } from "@shared/schema";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FeaturedPost() {
  const { data: featuredPost, isLoading: featuredLoading } = useQuery<Post>({
    queryKey: ["/api/featured-post"],
  });
  
  const { data: popularPosts, isLoading: popularLoading } = useQuery<Post[]>({
    queryKey: ["/api/popular-posts"],
  });
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [posts, setPosts] = useState<Post[]>([]);
  const [, navigate] = useLocation();
  
  useEffect(() => {
    // Combine featured post with popular posts for the carousel
    // Remove duplicates if featured post is also in popular posts
    if (featuredPost && popularPosts) {
      const allPosts = [featuredPost];
      popularPosts.forEach(post => {
        if (post.id !== featuredPost.id) {
          allPosts.push(post);
        }
      });
      setPosts(allPosts.slice(0, 5)); // Limit to 5 posts for the carousel
    }
  }, [featuredPost, popularPosts]);
  
  const isLoading = featuredLoading || popularLoading;
  
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === posts.length - 1 ? 0 : prev + 1));
  };
  
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? posts.length - 1 : prev - 1));
  };
  
  const goToPost = (slug: string) => {
    navigate(`/blog/${slug}`);
  };
  
  useEffect(() => {
    // Auto-advance slides every 5 seconds
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    
    return () => {
      clearInterval(timer);
    };
  }, [currentSlide, posts.length]);

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

  if (!posts || posts.length === 0) {
    return (
      <div className="mb-12 bg-white rounded-lg p-6 shadow-md text-center">
        <p className="text-secondary">No posts available at the moment.</p>
      </div>
    );
  }

  const post = posts[currentSlide];

  return (
    <div className="mb-12 relative">
      <div className="relative rounded-lg overflow-hidden bg-white shadow-md">
        <div className="lg:flex">
          <div className="lg:w-1/2 relative">
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
            <div className="uppercase tracking-wide text-xs font-semibold text-accent">
              {currentSlide === 0 ? "Featured" : `Popular Post ${currentSlide}`}
            </div>
            <div className="block mt-2 cursor-pointer" onClick={() => goToPost(post.slug)}>
              <p className="text-2xl font-bold text-text hover:text-primary transition-colors duration-200">
                {post.title}
              </p>
              <p className="mt-3 text-secondary line-clamp-3">
                {post.excerpt}
              </p>
            </div>
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
      
      {/* Navigation arrows */}
      <Button 
        variant="outline" 
        size="icon" 
        className="absolute left-2 top-1/2 transform -translate-y-1/2 rounded-full bg-white shadow-md hover:bg-gray-100 z-10"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <Button 
        variant="outline" 
        size="icon" 
        className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full bg-white shadow-md hover:bg-gray-100 z-10"
        onClick={nextSlide}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>
      
      {/* Slide indicators */}
      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
        {posts.map((_, index) => (
          <button
            key={index}
            className={`h-2 w-2 rounded-full ${
              currentSlide === index ? "bg-primary" : "bg-gray-300"
            }`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </div>
  );
}
