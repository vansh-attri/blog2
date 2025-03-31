import BlogLayout from "@/components/BlogLayout";
import FeaturedPost from "@/components/FeaturedPost"; // Will be updated to FeaturedPostsCarousel
import BlogPostsList from "@/components/BlogPostsList";
import TopicsWidget from "@/components/TopicsWidget";
import PopularPostsWidget from "@/components/PopularPostsWidget";

export default function HomePage() {
  return (
    <BlogLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FeaturedPost />
        
        <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6">
          <main className="md:w-2/3">
            <BlogPostsList />
          </main>
          
          <aside className="md:w-1/3 space-y-8">
            <TopicsWidget />
            <PopularPostsWidget />
          </aside>
        </div>
      </div>
    </BlogLayout>
  );
}
