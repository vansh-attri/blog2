import { useRoute } from "wouter";
import BlogLayout from "@/components/BlogLayout";
import BlogPostsList from "@/components/BlogPostsList";
import PopularPostsWidget from "@/components/PopularPostsWidget";
import TopicsWidget from "@/components/TopicsWidget";
import NewsletterWidget from "@/components/NewsletterWidget";

export default function TopicPage() {
  const [, params] = useRoute<{ category: string }>("/topics/:category");
  const category = params?.category || "";

  // Format category for display
  const formatCategory = (slug: string) => {
    return slug
      .split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const displayCategory = formatCategory(category);

  return (
    <BlogLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text">{displayCategory}</h1>
          <p className="text-secondary mt-2">Explore our articles about {displayCategory.toLowerCase()}</p>
        </div>
        
        <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6">
          <main className="md:w-2/3">
            <BlogPostsList category={displayCategory} />
          </main>
          
          <aside className="md:w-1/3 space-y-8">
            <TopicsWidget />
            <PopularPostsWidget />
            <NewsletterWidget />
          </aside>
        </div>
      </div>
    </BlogLayout>
  );
}
