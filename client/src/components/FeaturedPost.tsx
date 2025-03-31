import { useQuery } from "@tanstack/react-query";
import { Post } from "@shared/schema";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

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
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentSlide}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="lg:flex"
          >
            <motion.div 
              className="lg:w-1/2 relative overflow-hidden"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              {post.featuredImage ? (
                <motion.img 
                  className="h-64 w-full object-cover lg:h-full" 
                  src={post.featuredImage} 
                  alt={`Featured post about ${post.title}`}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.8 }}
                />
              ) : (
                <div className="h-64 w-full bg-gray-200 flex items-center justify-center lg:h-full">
                  <span className="text-gray-400">No image available</span>
                </div>
              )}
            </motion.div>
            <motion.div 
              className="lg:w-1/2 p-6 lg:p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <motion.div 
                className="uppercase tracking-wide text-xs font-semibold text-accent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                {currentSlide === 0 ? "Featured" : `Popular Post ${currentSlide}`}
              </motion.div>
              <motion.div 
                className="block mt-2 cursor-pointer" 
                onClick={() => goToPost(post.slug)}
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
              >
                <motion.p 
                  className="text-2xl font-bold text-text hover:text-primary transition-colors duration-200"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  {post.title}
                </motion.p>
                <motion.p 
                  className="mt-3 text-secondary line-clamp-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  {post.excerpt}
                </motion.p>
              </motion.div>
              <motion.div 
                className="mt-6 flex items-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
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
              </motion.div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Navigation arrows */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10"
      >
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full bg-white shadow-md hover:bg-gray-100"
          onClick={prevSlide}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
      </motion.div>
      
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10"
      >
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full bg-white shadow-md hover:bg-gray-100"
          onClick={nextSlide}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </motion.div>
      
      {/* Slide indicators */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10"
      >
        {posts.map((_, index) => (
          <motion.button
            key={index}
            className={`h-2 w-2 rounded-full ${
              currentSlide === index ? "bg-primary" : "bg-gray-300"
            }`}
            onClick={() => setCurrentSlide(index)}
            whileHover={{ scale: 1.5 }}
            whileTap={{ scale: 0.9 }}
            animate={currentSlide === index ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.5 }}
          />
        ))}
      </motion.div>
    </div>
  );
}
