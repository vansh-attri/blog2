import BlogLayout from "@/components/BlogLayout";
import PopularPostsWidget from "@/components/PopularPostsWidget";
import NewsletterWidget from "@/components/NewsletterWidget";

export default function AboutPage() {
  return (
    <BlogLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6">
          <main className="md:w-2/3">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h1 className="text-3xl font-bold text-text mb-6">About Nexpeer Tech Blog</h1>
              
              <div className="prose prose-lg max-w-none">
                <p>
                  Welcome to the Nexpeer Tech Blog, your trusted source for in-depth tech articles, career guidance, 
                  and insights on the latest trends in technology. Our mission is to provide valuable content that helps 
                  tech professionals grow their skills and advance their careers.
                </p>
                
                <h2>Our Mission</h2>
                <p>
                  At Nexpeer, we believe that technology is a powerful force for positive change. Our blog aims to democratize 
                  access to high-quality tech knowledge and career guidance, enabling professionals at all stages of their 
                  careers to thrive in the rapidly evolving tech landscape.
                </p>
                
                <h2>What We Cover</h2>
                <p>
                  Our content spans a wide range of topics in the technology space, including:
                </p>
                <ul>
                  <li>
                    <strong>Web Development</strong> — Frontend frameworks, backend systems, APIs, and modern web technologies
                  </li>
                  <li>
                    <strong>Machine Learning & AI</strong> — Algorithms, models, practical applications, and ethical considerations
                  </li>
                  <li>
                    <strong>Career Development</strong> — Interview preparation, resume building, and professional growth strategies
                  </li>
                  <li>
                    <strong>Data Science</strong> — Analysis, visualization, and extracting insights from complex datasets
                  </li>
                  <li>
                    <strong>DevOps</strong> — CI/CD pipelines, infrastructure as code, and operational excellence
                  </li>
                  <li>
                    <strong>Cybersecurity</strong> — Best practices, threat detection, and defensive strategies
                  </li>
                  <li>
                    <strong>Mobile Development</strong> — Native and cross-platform approaches for iOS and Android
                  </li>
                </ul>
                
                <h2>Our Team</h2>
                <p>
                  Our articles are written by a team of experienced tech professionals, educators, and industry experts 
                  who are passionate about sharing their knowledge. Each contributor brings their unique expertise and 
                  perspective to provide you with well-rounded, practical content.
                </p>
                
                <h2>Publishing Standards</h2>
                <p>
                  We maintain high editorial standards for all our content. Each article undergoes a thorough review 
                  process to ensure accuracy, clarity, and relevance. We strive to provide content that is:
                </p>
                <ul>
                  <li>Technically accurate and up-to-date</li>
                  <li>Practical and applicable to real-world scenarios</li>
                  <li>Clear and accessible, regardless of your experience level</li>
                  <li>Comprehensive yet concise</li>
                </ul>
                
                <h2>Connect With Us</h2>
                <p>
                  We're always looking to improve our content and provide value to our readers. If you have suggestions, 
                  feedback, or would like to contribute to our blog, please don't hesitate to reach out.
                </p>
                <p>
                  Thank you for being part of our community. We hope our content helps you advance your tech career and 
                  stay at the forefront of industry developments.
                </p>
              </div>
            </div>
          </main>
          
          <aside className="md:w-1/3 space-y-8">
            <div className="bg-white shadow-md rounded-lg p-6">
              <h3 className="text-lg font-bold mb-4 text-text">Contact Us</h3>
              <p className="text-secondary mb-4">
                Have questions, feedback, or want to contribute to our blog? We'd love to hear from you!
              </p>
              <p className="text-secondary mb-2">
                <strong>Email:</strong> <a href="mailto:blog@nexpeer.com" className="text-primary hover:underline">blog@nexpeer.com</a>
              </p>
              <p className="text-secondary mb-2">
                <strong>Twitter:</strong> <a href="https://twitter.com/nexpeer" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">@nexpeer</a>
              </p>
              <p className="text-secondary">
                <strong>LinkedIn:</strong> <a href="https://linkedin.com/company/nexpeer" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Nexpeer</a>
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
