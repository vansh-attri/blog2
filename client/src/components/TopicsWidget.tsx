import { useLocation } from "wouter";

const POPULAR_TOPICS = [
  { name: "Web Development", slug: "web-development" },
  { name: "Machine Learning", slug: "machine-learning" },
  { name: "Career Development", slug: "career-development" },
  { name: "Data Science", slug: "data-science" },
  { name: "DevOps", slug: "devops" },
  { name: "Cybersecurity", slug: "cybersecurity" },
  { name: "Mobile Development", slug: "mobile-development" },
];

export default function TopicsWidget() {
  const [, navigate] = useLocation();

  const goToTopic = (slug: string) => {
    navigate(`/topics/${slug}`);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h3 className="text-lg font-bold mb-4 text-text">Popular Topics</h3>
      <div className="flex flex-wrap gap-2">
        {POPULAR_TOPICS.map((topic) => (
          <button
            key={topic.slug} 
            onClick={() => goToTopic(topic.slug)}
            className="px-3 py-1 bg-gray-100 rounded-full text-sm text-secondary hover:bg-primary hover:text-white transition-colors duration-200"
          >
            {topic.name}
          </button>
        ))}
      </div>
    </div>
  );
}
