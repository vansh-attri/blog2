import { Link } from "wouter";
import BlogLayout from "@/components/BlogLayout";
import PopularPostsWidget from "@/components/PopularPostsWidget";
import NewsletterWidget from "@/components/NewsletterWidget";
import { motion } from "framer-motion";

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
              {CATEGORIES.map((category, index) => (
                <motion.div
                  key={category.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ 
                    y: -5,
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                  }}
                  className="overflow-hidden rounded-lg bg-white shadow-md"
                >
                  <Link href={`/topics/${category.slug}`}>
                    <a className="block h-full">
                      <div className={`h-2 w-full ${category.color.split(' ')[0]}`}></div>
                      <div className="p-6">
                        <div className="flex items-center mb-4">
                          <div className={`flex h-12 w-12 items-center justify-center rounded-full ${category.color} mr-4`}>
                            <span className="text-2xl">{category.icon}</span>
                          </div>
                          <h2 className="text-xl font-bold text-text">{category.name}</h2>
                        </div>
                        <p className="text-secondary mb-6 line-clamp-3">{category.description}</p>
                        <motion.div 
                          className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${category.color} cursor-pointer`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Explore articles
                        </motion.div>
                      </div>
                    </a>
                  </Link>
                </motion.div>
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
