import { IStorage } from './storage';
import { 
  User, Post, Subscriber, 
  InsertUser, UpdateUser, 
  InsertPost, UpdatePost, 
  InsertSubscriber,
  getNextSequence
} from '../shared/models';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import ConnectMongo from 'connect-mongo';
import session from 'express-session';
import { connection } from './mongo';

const scryptAsync = promisify(scrypt);

// Helper function to slugify text
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

// MongoDB implementation of storage interface
export class MongoStorage implements IStorage {
  public sessionStore: session.Store;

  constructor() {
    try {
      // Create session store using MongoDB, but only if we're not in memory mode
      if (!global.useMemoryStorage) {
        this.sessionStore = ConnectMongo.create({
          mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/nexpeer-blog',
          ttl: 14 * 24 * 60 * 60, // 14 days
        });
      } else {
        // Create a memory store as fallback
        const MemoryStore = require('memorystore')(session);
        this.sessionStore = new MemoryStore({
          checkPeriod: 86400000, // prune expired entries every 24h
        });
      }
    } catch (error) {
      console.error('Error creating MongoDB session store, falling back to memory store', error);
      // Create a memory store as fallback
      const MemoryStore = require('memorystore')(session);
      this.sessionStore = new MemoryStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      });
    }
    
    // Initialize the database
    this.initializeDatabase();
  }

  private async initializeDatabase() {
    // Skip initialization if we're using memory storage instead
    if (global.useMemoryStorage) {
      console.log('Using memory storage, skipping MongoDB initialization');
      return;
    }

    try {
      // Check if we have an admin user
      const adminExists = await User.findOne({ isAdmin: true });
      
      if (!adminExists) {
        console.log('Creating admin user...');
        const hashedPassword = await this.hashPassword('admin123');
        
        // Create admin user
        await User.create({
          id: await getNextSequence('users'),
          username: 'admin',
          password: hashedPassword,
          displayName: 'Admin User',
          isAdmin: true,
        });
        
        console.log('Admin user created');
        
        // Create sample content if database is empty
        const postsCount = await Post.countDocuments();
        
        if (postsCount === 0) {
          console.log('Creating sample blog posts...');
          
          const adminUser = await User.findOne({ isAdmin: true });
          
          if (adminUser) {
            // Create sample post categories
            const categories = ['Technology', 'Career', 'AI', 'Development', 'Data Science'];
            
            // Create a sample post for each category
            for (let i = 0; i < categories.length; i++) {
              const title = `Sample ${categories[i]} Post`;
              const slug = slugify(title);
              
              await Post.create({
                id: await getNextSequence('posts'),
                title,
                slug,
                content: `# ${title}\n\nThis is a sample blog post in the ${categories[i]} category. It demonstrates how content is formatted and displayed in the Nexpeer Tech Blog platform.\n\n## Features\n\n- Rich text editing\n- Categories and tags\n- Author information\n\n## Getting Started\n\nTo create your own posts, log in as an administrator and use the admin dashboard.`,
                excerpt: `This is a sample blog post in the ${categories[i]} category. It demonstrates how content is formatted and displayed.`,
                category: categories[i],
                status: 'published',
                authorId: adminUser.id,
                publishedAt: new Date(),
              });
            }
            
            console.log('Sample blog posts created');
          }
        }
      }
    } catch (error) {
      console.error('Database initialization error:', error);
      console.warn('Falling back to memory storage due to MongoDB initialization error');
      global.useMemoryStorage = true;
    }
  }

  // Helper method to hash passwords
  async hashPassword(password: string) {
    const salt = randomBytes(16).toString('hex');
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString('hex')}.${salt}`;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    try {
      if (global.useMemoryStorage) {
        throw new Error('Using memory storage');
      }
      const user = await User.findOne({ id });
      return user || undefined;
    } catch (error) {
      console.error('MongoDB operation failed, falling back to MemStorage. Error:', error);
      global.useMemoryStorage = true;
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      if (global.useMemoryStorage) {
        throw new Error('Using memory storage');
      }
      const user = await User.findOne({ username });
      return user || undefined;
    } catch (error) {
      console.error('MongoDB operation failed, falling back to MemStorage. Error:', error);
      global.useMemoryStorage = true;
      return undefined;
    }
  }

  async createUser(userData: InsertUser): Promise<User> {
    try {
      if (global.useMemoryStorage) {
        throw new Error('Using memory storage');
      }
      const userId = await getNextSequence('users');
      
      const user = new User({
        id: userId,
        ...userData,
      });
      
      await user.save();
      return user;
    } catch (error) {
      console.error('MongoDB operation failed, falling back to MemStorage. Error:', error);
      global.useMemoryStorage = true;
      // Return a minimal user object to prevent errors, the actual save will be handled by MemStorage
      return {
        id: 1,
        username: userData.username,
        password: userData.password,
        displayName: userData.displayName || userData.username,
        isAdmin: userData.isAdmin || false,
      } as User;
    }
  }

  async updateUser(id: number, userData: UpdateUser): Promise<User | undefined> {
    try {
      if (global.useMemoryStorage) {
        throw new Error('Using memory storage');
      }
      const user = await User.findOneAndUpdate({ id }, userData, { new: true });
      return user || undefined;
    } catch (error) {
      console.error('MongoDB operation failed, falling back to MemStorage. Error:', error);
      global.useMemoryStorage = true;
      return undefined;
    }
  }

  // Post operations
  async getPost(id: number): Promise<Post | undefined> {
    try {
      if (global.useMemoryStorage) {
        throw new Error('Using memory storage');
      }
      const post = await Post.findOne({ id });
      return post || undefined;
    } catch (error) {
      console.error('MongoDB operation failed, falling back to MemStorage. Error:', error);
      global.useMemoryStorage = true;
      return undefined;
    }
  }

  async getPostBySlug(slug: string): Promise<Post | undefined> {
    const post = await Post.findOne({ slug });
    return post || undefined;
  }

  async getAllPosts(options: { status?: string, limit?: number, offset?: number } = {}): Promise<Post[]> {
    const { status, limit = 10, offset = 0 } = options;
    
    // Build query
    const query: Record<string, any> = {};
    if (status) query.status = status;
    
    // Execute query with pagination
    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);
      
    return posts;
  }

  async getPostsByCategory(category: string, options: { status?: string, limit?: number, offset?: number } = {}): Promise<Post[]> {
    const { status, limit = 10, offset = 0 } = options;
    
    // Build query
    const query: Record<string, any> = { category };
    if (status) query.status = status;
    
    // Execute query with pagination
    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);
      
    return posts;
  }

  async createPost(postData: InsertPost): Promise<Post> {
    const postId = await getNextSequence('posts');
    const slug = slugify(postData.title);
    
    // Check if slug exists
    let uniqueSlug = slug;
    let counter = 1;
    
    while (await Post.findOne({ slug: uniqueSlug })) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }
    
    const post = new Post({
      id: postId,
      slug: uniqueSlug,
      ...postData,
    });
    
    await post.save();
    return post;
  }

  async updatePost(id: number, postData: UpdatePost): Promise<Post | undefined> {
    // If title is updated, update slug too
    if (postData.title) {
      const slug = slugify(postData.title);
      
      // Check if slug exists and belongs to another post
      const existingPost = await Post.findOne({ slug });
      
      if (existingPost && existingPost.id !== id) {
        let uniqueSlug = slug;
        let counter = 1;
        
        while (await Post.findOne({ slug: uniqueSlug, id: { $ne: id } })) {
          uniqueSlug = `${slug}-${counter}`;
          counter++;
        }
        
        postData = { ...postData, slug: uniqueSlug };
      } else {
        postData = { ...postData, slug };
      }
    }
    
    const post = await Post.findOneAndUpdate({ id }, postData, { new: true });
    return post || undefined;
  }

  async deletePost(id: number): Promise<boolean> {
    const result = await Post.deleteOne({ id });
    return result.deletedCount === 1;
  }

  async searchPosts(query: string, options: { status?: string, limit?: number, offset?: number } = {}): Promise<Post[]> {
    const { status, limit = 10, offset = 0 } = options;
    
    // Build search query
    const searchQuery: Record<string, any> = {
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } },
        { excerpt: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ]
    };
    
    if (status) searchQuery.status = status;
    
    // Execute query with pagination
    const posts = await Post.find(searchQuery)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);
      
    return posts;
  }

  async getFeaturedPost(): Promise<Post | undefined> {
    // Get latest published post
    const post = await Post.findOne({ status: 'published' })
      .sort({ publishedAt: -1 });
      
    return post || undefined;
  }

  async getPopularPosts(limit: number = 5): Promise<Post[]> {
    // For simplicity, just return the latest posts as "popular"
    const posts = await Post.find({ status: 'published' })
      .sort({ publishedAt: -1 })
      .limit(limit);
      
    return posts;
  }

  async getPostCount(options: { status?: string, category?: string } = {}): Promise<number> {
    const { status, category } = options;
    
    // Build query
    const query: Record<string, any> = {};
    if (status) query.status = status;
    if (category) query.category = category;
    
    return await Post.countDocuments(query);
  }

  // Subscriber operations
  async getSubscriber(id: number): Promise<Subscriber | undefined> {
    const subscriber = await Subscriber.findOne({ id });
    return subscriber || undefined;
  }

  async getSubscriberByEmail(email: string): Promise<Subscriber | undefined> {
    const subscriber = await Subscriber.findOne({ email });
    return subscriber || undefined;
  }

  async createSubscriber(subscriberData: InsertSubscriber): Promise<Subscriber> {
    const subscriberId = await getNextSequence('subscribers');
    
    const subscriber = new Subscriber({
      id: subscriberId,
      ...subscriberData,
    });
    
    await subscriber.save();
    return subscriber;
  }

  async getAllSubscribers(): Promise<Subscriber[]> {
    return await Subscriber.find().sort({ createdAt: -1 });
  }
}