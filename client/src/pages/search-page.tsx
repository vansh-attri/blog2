import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Post } from "@shared/schema";
import BlogLayout from "@/components/BlogLayout";
import { BlogCard } from "@/components/ui/blog-card";
import { Pagination } from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import PopularPostsWidget from "@/components/PopularPostsWidget";
import NewsletterWidget from "@/components/NewsletterWidget";

export default function SearchPage() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split("?")[1]);
  const initialQuery = searchParams.get("query") || "";
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  // Update debounced query after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      // Reset to page 1 when search changes
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Query for search results
  const { data, isLoading, error } = useQuery<Post[]>({
    queryKey: [`/api/search?query=${encodeURIComponent(debouncedQuery)}&page=${currentPage}`],
    enabled: debouncedQuery.length >= 2,
  });

  // If query is too short, show a message
  if (debouncedQuery && debouncedQuery.length < 2) {
    return (
      <BlogLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <SearchHeader 
            query={searchQuery} 
            setQuery={setSearchQuery} 
          />
          
          <div className="bg-white rounded-lg p-6 shadow-md text-center my-8">
            <p className="text-secondary">Please enter at least 2 characters to search.</p>
          </div>
        </div>
      </BlogLayout>
    );
  }

  return (
    <BlogLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SearchHeader 
          query={searchQuery} 
          setQuery={setSearchQuery} 
        />
        
        <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6 mt-8">
          <main className="md:w-2/3">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-text">
                {debouncedQuery ? `Search Results for "${debouncedQuery}"` : "All Articles"}
              </h2>
            </div>

            {isLoading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden p-6">
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
            ) : error ? (
              <div className="bg-white rounded-lg p-6 shadow-md text-center">
                <p className="text-secondary">
                  Error loading search results. Please try again later.
                </p>
              </div>
            ) : data && data.length > 0 ? (
              <>
                <div className="space-y-6">
                  {data.map((post) => (
                    <BlogCard 
                      key={post.id} 
                      post={post} 
                      author={{ id: post.authorId || 1, displayName: "Admin" }} 
                    />
                  ))}
                </div>
                
                <Pagination
                  currentPage={currentPage}
                  totalPages={5} // Assuming 5 pages for simplicity
                  onPageChange={setCurrentPage}
                />
              </>
            ) : debouncedQuery ? (
              <div className="bg-white rounded-lg p-6 shadow-md text-center">
                <p className="text-secondary">
                  No results found for "{debouncedQuery}". Please try a different search term.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-lg p-6 shadow-md text-center">
                <p className="text-secondary">
                  Enter a search term to find articles.
                </p>
              </div>
            )}
          </main>
          
          <aside className="md:w-1/3 space-y-8">
            <div className="bg-white shadow-md rounded-lg p-6">
              <h3 className="text-lg font-bold mb-4 text-text">Search Tips</h3>
              <ul className="space-y-2 text-secondary">
                <li>• Use specific keywords for better results</li>
                <li>• Try searching for technologies, concepts, or career topics</li>
                <li>• Search is case-insensitive</li>
                <li>• Minimum 2 characters required</li>
              </ul>
            </div>
            <PopularPostsWidget />
            <NewsletterWidget />
          </aside>
        </div>
      </div>
    </BlogLayout>
  );
}

interface SearchHeaderProps {
  query: string;
  setQuery: (query: string) => void;
}

function SearchHeader({ query, setQuery }: SearchHeaderProps) {
  const [, navigate] = useLocation();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length >= 2) {
      navigate(`/search?query=${encodeURIComponent(query.trim())}`);
    }
  };
  
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-text mb-4">Search Articles</h1>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="text"
          placeholder="Search for articles..."
          className="max-w-xl"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button type="submit">
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </form>
    </div>
  );
}
