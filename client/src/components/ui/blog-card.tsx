import { Post } from "@shared/schema";
import { Link } from "wouter";
import { format } from "date-fns";
import { motion } from "framer-motion";

interface BlogCardProps {
  post: Post;
  author?: {
    id: number;
    displayName: string;
    profileImage?: string;
  };
}

export function BlogCard({ post, author }: BlogCardProps) {
  return (
    <motion.div 
      className="bg-white rounded-lg shadow-md overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ 
        y: -5,
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
      }}
    >
      <Link href={`/blog/${post.slug}`} className="block hover:bg-gray-50 transition-colors duration-200">
        <div className="p-6">
          <motion.div 
            className="flex items-center mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <motion.span 
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              {post.category}
            </motion.span>
            <span className="mx-2 text-gray-300">•</span>
            <time 
              dateTime={post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined} 
              className="text-sm text-secondary"
            >
              {post.publishedAt 
                ? format(new Date(post.publishedAt), 'MMM dd, yyyy') 
                : 'Draft'}
            </time>
          </motion.div>
          <motion.div 
            className="block mt-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <motion.p 
              className="text-xl font-semibold text-text"
              whileHover={{ color: '#2563EB' }}
              transition={{ duration: 0.2 }}
            >
              {post.title}
            </motion.p>
            <motion.p 
              className="mt-3 text-secondary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {post.excerpt}
            </motion.p>
          </motion.div>
          {author && (
            <motion.div 
              className="mt-4 flex items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <motion.div 
                className="flex-shrink-0"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
              >
                <img 
                  className="h-8 w-8 rounded-full" 
                  src={author.profileImage || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"} 
                  alt={`${author.displayName}'s profile`} 
                />
              </motion.div>
              <div className="ml-3">
                <p className="text-sm font-medium text-text">{author.displayName}</p>
              </div>
            </motion.div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
