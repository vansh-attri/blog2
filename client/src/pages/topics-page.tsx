import { Link } from "wouter";
import BlogLayout from "@/components/BlogLayout";
import PopularPostsWidget from "@/components/PopularPostsWidget";
import NewsletterWidget from "@/components/NewsletterWidget";

// Categories with icons and descriptions
const CATEGORIES = [
  {
    name: "Web Development",
    slug: "web-development",
    description: "Frontend, backend, and everything in between. Explore the latest web development trends, frameworks, and best practices.",
    icon: "🌐",
    color: "bg-blue-100 text-blue-800",
  },
  {
    name: "Machine Learning",
    slug: "machine-learning",
    description: "Artificial intelligence, neural networks, and data science applications. Learn how ML is transforming industries.",
    icon: "🧠",
    color: "bg-purple-100 text-purple-800",
  },
  {
    name: "Career Development",
    slug: "career-development",
    description: "Resume building, interview preparation, and career growth strategies for tech professionals at all levels.",
    icon: "📈",
    color: "bg-green-100 text-green-800",
  },
  {
    name: "Data Science",
    slug: "data-science",
    description: "Big data, analytics, and visualization techniques to extract meaningful insights from complex datasets.",
    icon: "📊",
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    name: "DevOps",
    slug: "devops",
    description: "Continuous integration, deployment pipelines, and infrastructure automation for modern development teams.",
    icon: "⚙️",
    color: "bg-orange-100 text-orange-800",
  },
  {
    name: "Cybersecurity",
    slug: "cybersecurity",
    description: "Threat detection, prevention strategies, and security best practices to protect digital assets and information.",
    icon: "🔒",
    color: "bg-red-100 text-red-800",
  },
  {
    name: "Mobile Development",
    slug: "mobile-development",
    description: "Native and cross-platform app development for iOS, Android, and emerging mobile technologies.",
    icon: "📱",
    color: "bg-indigo-100 text-indigo-800",
  },
];

export default function TopicsPage() {
  return (
    <BlogLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-text mb-2">Topics</h1>
          <p className="text-secondary">Explore articles by topic to find the content most relevant to your interests</p>
        </div>
        
        <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6">
          <main className="md:w-2/3">
            <div className="grid gap-6 md:grid-cols-2">
              {CATEGORIES.map((category) => (
                <Link key={category.slug} href={`/topics/${category.slug}`}>
                  <a className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
                    <div className="flex items-center mb-4">
                      <span className="text-2xl mr-2">{category.icon}</span>
                      <h2 className="text-xl font-bold text-text">{category.name}</h2>
                    </div>
                    <p className="text-secondary mb-4">{category.description}</p>
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${category.color}`}>
                      Explore articles
                    </div>
                  </a>
                </Link>
              ))}
            </div>
          </main>
          
          <aside className="md:w-1/3 space-y-8">
            <div className="bg-white shadow-md rounded-lg p-6">
              <h3 className="text-lg font-bold mb-4 text-text">About Our Topics</h3>
              <p className="text-secondary mb-4">
                Our topics cover a wide range of technology subjects, from development and design to career growth and industry trends.
              </p>
              <p className="text-secondary">
                Each topic features curated content written by experienced professionals in the field, ensuring you get accurate and valuable information.
              </p>
            </div>
            <PopularPostsWidget />
            <NewsletterWidget />
          </aside>
        </div>
      </div>
    </BlogLayout>
  );
}
