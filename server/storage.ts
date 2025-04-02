import { Post, InsertPost, UpdatePost, User, InsertUser, UpdateUser, Subscriber, InsertSubscriber } from "@shared/schema";
import { createId } from "@paralleldrive/cuid2";
import session from "express-session";
import { ObjectId } from "mongodb";
import memorystore from "memorystore";

// Convert string to slug
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .trim();
}

export interface IStorage {
  // User operations
  getUser(id: number | string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number | string, data: UpdateUser): Promise<User | undefined>;
  
  // Post operations
  getPost(id: number | string): Promise<Post | undefined>;
  getPostBySlug(slug: string): Promise<Post | undefined>;
  getAllPosts(options?: { status?: string, limit?: number, offset?: number }): Promise<Post[]>;
  getPostsByCategory(category: string, options?: { status?: string, limit?: number, offset?: number }): Promise<Post[]>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: number | string, post: UpdatePost): Promise<Post | undefined>;
  deletePost(id: number | string): Promise<boolean>;
  searchPosts(query: string, options?: { status?: string, limit?: number, offset?: number }): Promise<Post[]>;
  getFeaturedPost(): Promise<Post | undefined>;
  getPopularPosts(limit?: number): Promise<Post[]>;
  getPostCount(options?: { status?: string, category?: string }): Promise<number>;
  
  // Subscriber operations
  getSubscriber(id: number | string): Promise<Subscriber | undefined>;
  getSubscriberByEmail(email: string): Promise<Subscriber | undefined>;
  createSubscriber(subscriber: InsertSubscriber): Promise<Subscriber>;
  getAllSubscribers(): Promise<Subscriber[]>;
  
  // Session store
  sessionStore: session.Store; // Express session store
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private posts: Map<number, Post>;
  private subscribers: Map<number, Subscriber>;
  private userIdCounter: number;
  private postIdCounter: number;
  private subscriberIdCounter: number;
  public sessionStore: any; // Express session store

  constructor() {
    this.users = new Map();
    this.posts = new Map();
    this.subscribers = new Map();
    this.userIdCounter = 1;
    this.postIdCounter = 1;
    this.subscriberIdCounter = 1;
    
    // Initialize session store
    const MemoryStore = memorystore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Create admin user with default credentials
    this.createUser({
      username: "admin",
      password: "admin123", // Default password
      displayName: "Admin",
      isAdmin: true,
    });

    // Create some sample post content for development
    const authorId = 1;
    this.createSamplePosts(authorId);
  }

  private createSamplePosts(authorId: number) {
    const samplePosts = [
      {
        title: "The Future of AI in Tech Career Development",
        excerpt: "Artificial Intelligence is revolutionizing how tech professionals plan and develop their careers. From personalized learning paths to job matching algorithms, discover how AI tools like Nexpeer are changing the landscape.",
        content: "# The Future of AI in Tech Career Development\n\nArtificial Intelligence is revolutionizing how tech professionals plan and develop their careers. From personalized learning paths to job matching algorithms, AI tools are changing the landscape of career development in unprecedented ways.\n\n## How AI is Transforming Career Guidance\n\nTraditional career counseling relies heavily on human advisors who, despite their expertise, have limitations in processing vast amounts of data about job markets, individual skills, and potential career trajectories. AI systems, on the other hand, can analyze millions of career paths, job postings, and skill requirements to provide highly personalized guidance.",
        category: "Career Development",
        featuredImage: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1050&q=80",
        status: "published",
        readTime: 8,
      },
      {
        title: "How to Prepare for Technical Interviews in 2024",
        excerpt: "The technical interview landscape is constantly evolving. Learn the latest strategies, common questions, and preparation techniques to ace your next interview.",
        content: "# How to Prepare for Technical Interviews in 2024\n\nThe technical interview landscape is constantly evolving. This guide covers the latest strategies, common questions, and preparation techniques to help you ace your next interview.\n\n## Understanding Modern Technical Interviews\n\nToday's technical interviews go beyond just coding problems. Companies are increasingly looking for problem-solving skills, communication abilities, and cultural fit.",
        category: "Career Development",
        featuredImage: "https://images.unsplash.com/photo-1596496181871-9681eacf9764?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1050&q=80",
        status: "published",
        readTime: 6,
      },
      {
        title: "The Complete Guide to Modern Frontend Frameworks",
        excerpt: "With so many options available, choosing the right frontend framework can be overwhelming. This comprehensive comparison of React, Vue, Angular, and Svelte will help you make the right decision for your next project.",
        content: "# The Complete Guide to Modern Frontend Frameworks\n\nWith so many options available, choosing the right frontend framework can be overwhelming. This comprehensive comparison will help you make the right decision for your next project.\n\n## React: The Industry Standard\n\nReact continues to dominate the frontend landscape with its component-based architecture and robust ecosystem. Developed and maintained by Facebook, React's virtual DOM approach provides efficient rendering and state management.",
        category: "Web Development",
        featuredImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1050&q=80",
        status: "published",
        readTime: 10,
      },
      {
        title: "Getting Started with Machine Learning: A Beginner's Guide",
        excerpt: "Machine learning doesn't have to be intimidating. This step-by-step guide breaks down the fundamental concepts and provides practical examples to help you start your ML journey.",
        content: "# Getting Started with Machine Learning: A Beginner's Guide\n\nMachine learning doesn't have to be intimidating. This step-by-step guide breaks down the fundamental concepts and provides practical examples to help you start your ML journey.\n\n## What is Machine Learning?\n\nAt its core, machine learning is about teaching computers to learn from data without being explicitly programmed. Instead of writing rules for every scenario, ML systems identify patterns in data and make decisions based on what they've learned.",
        category: "Machine Learning",
        featuredImage: "https://images.unsplash.com/photo-1591453089816-0fbb971b454c?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1050&q=80",
        status: "published",
        readTime: 7,
      },
    ];

    const date = new Date();
    samplePosts.forEach((post, index) => {
      const publishedDate = new Date(date);
      publishedDate.setDate(date.getDate() - (index * 3)); // Spread out the publish dates
      
      this.createPost({
        title: post.title,
        slug: slugify(post.title),
        excerpt: post.excerpt,
        content: post.content,
        featuredImage: post.featuredImage,
        authorId,
        category: post.category,
        status: post.status,
        readTime: post.readTime,
        publishNow: true,
      });
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = {
      id,
      username: userData.username,
      password: userData.password,
      displayName: userData.displayName || userData.username,
      profileImage: userData.profileImage || "",
      isAdmin: userData.isAdmin || false,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: UpdateUser): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Post methods
  async getPost(id: number): Promise<Post | undefined> {
    return this.posts.get(id);
  }

  async getPostBySlug(slug: string): Promise<Post | undefined> {
    return Array.from(this.posts.values()).find(
      (post) => post.slug === slug,
    );
  }

  async getAllPosts(options: { status?: string, limit?: number, offset?: number } = {}): Promise<Post[]> {
    let posts = Array.from(this.posts.values());
    
    // Filter by status if provided
    if (options.status) {
      posts = posts.filter(post => post.status === options.status);
    }
    
    // Sort by published date (newest first)
    posts.sort((a, b) => {
      // If both have published dates, compare them
      if (a.publishedAt && b.publishedAt) {
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      }
      // If only one has a published date, it comes first
      if (a.publishedAt) return -1;
      if (b.publishedAt) return 1;
      // If neither has a published date, sort by created date
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    // Apply pagination if limit is provided
    if (options.limit !== undefined) {
      const offset = options.offset || 0;
      posts = posts.slice(offset, offset + options.limit);
    }
    
    return posts;
  }

  async getPostsByCategory(category: string, options: { status?: string, limit?: number, offset?: number } = {}): Promise<Post[]> {
    let posts = Array.from(this.posts.values()).filter(
      post => post.category === category
    );
    
    // Filter by status if provided
    if (options.status) {
      posts = posts.filter(post => post.status === options.status);
    }
    
    // Sort by published date (newest first)
    posts.sort((a, b) => {
      if (a.publishedAt && b.publishedAt) {
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      }
      if (a.publishedAt) return -1;
      if (b.publishedAt) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    // Apply pagination if limit is provided
    if (options.limit !== undefined) {
      const offset = options.offset || 0;
      posts = posts.slice(offset, offset + options.limit);
    }
    
    return posts;
  }

  async createPost(postData: InsertPost): Promise<Post> {
    const id = this.postIdCounter++;
    const now = new Date();
    
    // Generate slug if not provided
    const slug = postData.slug || slugify(postData.title);
    
    const post: Post = {
      id,
      title: postData.title,
      slug,
      excerpt: postData.excerpt,
      content: postData.content,
      featuredImage: postData.featuredImage || "",
      authorId: postData.authorId,
      category: postData.category,
      status: postData.status || "draft",
      createdAt: now,
      updatedAt: now,
      publishedAt: postData.publishNow ? now : undefined,
      readTime: postData.readTime || 5,
    };
    
    this.posts.set(id, post);
    return post;
  }

  async updatePost(id: number, postData: UpdatePost): Promise<Post | undefined> {
    const post = await this.getPost(id);
    if (!post) return undefined;
    
    const now = new Date();
    
    // Handle publishing the post if requested
    let publishedAt = post.publishedAt;
    if (postData.publishNow && post.status !== "published") {
      publishedAt = now;
    }
    
    // Update the post
    const updatedPost: Post = {
      ...post,
      ...postData,
      slug: postData.slug || post.slug,
      status: postData.publishNow ? "published" : (postData.status || post.status),
      updatedAt: now,
      publishedAt,
    };
    
    this.posts.set(id, updatedPost);
    return updatedPost;
  }

  async deletePost(id: number): Promise<boolean> {
    return this.posts.delete(id);
  }

  async searchPosts(query: string, options: { status?: string, limit?: number, offset?: number } = {}): Promise<Post[]> {
    query = query.toLowerCase();
    
    let posts = Array.from(this.posts.values()).filter(post => {
      return (
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query)
      );
    });
    
    // Filter by status if provided
    if (options.status) {
      posts = posts.filter(post => post.status === options.status);
    }
    
    // Sort by relevance (title match is most relevant)
    posts.sort((a, b) => {
      const aTitleMatch = a.title.toLowerCase().includes(query) ? 1 : 0;
      const bTitleMatch = b.title.toLowerCase().includes(query) ? 1 : 0;
      
      if (aTitleMatch !== bTitleMatch) {
        return bTitleMatch - aTitleMatch;
      }
      
      // If title relevance is the same, sort by date
      if (a.publishedAt && b.publishedAt) {
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      }
      if (a.publishedAt) return -1;
      if (b.publishedAt) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    // Apply pagination if limit is provided
    if (options.limit !== undefined) {
      const offset = options.offset || 0;
      posts = posts.slice(offset, offset + options.limit);
    }
    
    return posts;
  }

  async getFeaturedPost(): Promise<Post | undefined> {
    // Get the most recent published post
    const publishedPosts = Array.from(this.posts.values())
      .filter(post => post.status === "published")
      .sort((a, b) => {
        if (a.publishedAt && b.publishedAt) {
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        }
        if (a.publishedAt) return -1;
        if (b.publishedAt) return 1;
        return 0;
      });
    
    return publishedPosts[0];
  }

  async getPopularPosts(limit: number = 5): Promise<Post[]> {
    // In a real app, this would sort by view count or some other popularity metric
    // For now, we'll just return the most recent published posts
    return await this.getAllPosts({ status: "published", limit });
  }

  async getPostCount(options: { status?: string, category?: string } = {}): Promise<number> {
    let count = 0;
    
    for (const post of this.posts.values()) {
      // Check status filter if provided
      if (options.status && post.status !== options.status) {
        continue;
      }
      
      // Check category filter if provided
      if (options.category && post.category !== options.category) {
        continue;
      }
      
      // If we get here, the post matches all filters
      count++;
    }
    
    return count;
  }

  // Subscriber methods
  async getSubscriber(id: number): Promise<Subscriber | undefined> {
    return this.subscribers.get(id);
  }

  async getSubscriberByEmail(email: string): Promise<Subscriber | undefined> {
    return Array.from(this.subscribers.values()).find(
      (subscriber) => subscriber.email.toLowerCase() === email.toLowerCase(),
    );
  }

  async createSubscriber(subscriberData: InsertSubscriber): Promise<Subscriber> {
    const id = this.subscriberIdCounter++;
    const now = new Date();
    
    const subscriber: Subscriber = {
      id,
      email: subscriberData.email,
      createdAt: now,
    };
    
    this.subscribers.set(id, subscriber);
    return subscriber;
  }

  async getAllSubscribers(): Promise<Subscriber[]> {
    return Array.from(this.subscribers.values());
  }
}

import { DatabaseStorage } from "./storage.database";

// Import MongoDB and memory storage
import { MongoStorage } from './storage.mongo';
import { connectToMongoDB } from './mongo';

// Function to create appropriate storage based on environment
function createStorage(): IStorage {
  try {
    // Initialize the global variable if it doesn't exist
    if (typeof global.useMemoryStorage === 'undefined') {
      global.useMemoryStorage = false;
    }
    
    // Check if the global flag to use memory storage has been set
    // This happens if MongoDB connection fails
    if (global.useMemoryStorage) {
      console.log('Using memory storage (MongoDB connection failed or forced)');
      return new MemStorage();
    } else {
      // First check if MongoDB URI is valid
      const mongodbUri = process.env.MONGODB_URI;
      if (!mongodbUri || 
          (!mongodbUri.startsWith('mongodb://') && 
           !mongodbUri.startsWith('mongodb+srv://'))) {
        console.log('Invalid MongoDB URI, falling back to memory storage');
        global.useMemoryStorage = true;
        return new MemStorage();
      }
      
      console.log('Using MongoDB storage');
      try {
        return new MongoStorage();
      } catch (storageError) {
        console.error('Error creating MongoDB storage, falling back to memory storage', storageError);
        global.useMemoryStorage = true;
        return new MemStorage();
      }
    }
  } catch (error) {
    console.error('Error creating storage, falling back to memory storage', error);
    global.useMemoryStorage = true;
    return new MemStorage();
  }
}

// Export storage implementation with fallback
export const storage = createStorage();
