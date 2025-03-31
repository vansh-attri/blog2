import { useLocation } from "wouter";
import { motion } from "framer-motion";

const POPULAR_TOPICS = [
  { name: "Web Development", slug: "web-development", color: "bg-blue-100 text-blue-800", icon: "🌐" },
  { name: "Machine Learning", slug: "machine-learning", color: "bg-purple-100 text-purple-800", icon: "🧠" },
  { name: "Career Development", slug: "career-development", color: "bg-green-100 text-green-800", icon: "📈" },
  { name: "Data Science", slug: "data-science", color: "bg-yellow-100 text-yellow-800", icon: "📊" },
  { name: "DevOps", slug: "devops", color: "bg-orange-100 text-orange-800", icon: "⚙️" },
  { name: "Cybersecurity", slug: "cybersecurity", color: "bg-red-100 text-red-800", icon: "🔒" },
  { name: "Mobile Development", slug: "mobile-development", color: "bg-indigo-100 text-indigo-800", icon: "📱" },
];

export default function TopicsWidget() {
  const [, navigate] = useLocation();

  const goToTopic = (slug: string) => {
    navigate(`/topics/${slug}`);
  };

  return (
    <motion.div 
      className="bg-white shadow-md rounded-lg overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="border-b border-gray-100 px-6 py-4">
        <h3 className="text-lg font-bold text-text">Popular Topics</h3>
      </div>
      <div className="p-6">
        <div className="flex flex-wrap gap-2">
          {POPULAR_TOPICS.map((topic, index) => (
            <motion.button
              key={topic.slug} 
              onClick={() => goToTopic(topic.slug)}
              className={`flex items-center px-3 py-1.5 rounded-full text-sm ${topic.color}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="mr-1">{topic.icon}</span>
              {topic.name}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
