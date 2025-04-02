import { ObjectId } from 'mongodb';
import session from 'express-session';
import MongoDBStore from 'connect-mongodb-session';
import { usersCollection, postsCollection, subscribersCollection } from './mongodb';
import {
  User, InsertUser, UpdateUser,
  Post, InsertPost, UpdatePost,
  Subscriber, InsertSubscriber
} from '@shared/schema';
import { IStorage } from './storage';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
}

export class MongoDBStorage implements IStorage {
  public sessionStore: session.Store;
  
  constructor() {
    const MongoStore = MongoDBStore(session);
    
    this.sessionStore = new MongoStore({
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/nexpeer_tech_blog',
      collection: 'sessions',
      connectionOptions: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    });
  }

  // User operations
  async getUser(id: number | string): Promise<User | undefined> {
    let query = {};
    
    if (typeof id === 'string' && ObjectId.isValid(id)) {
      query = { _id: new ObjectId(id) };
    } else if (typeof id === 'number') {
      // For backward compatibility with existing code that expects numeric IDs
      // Convert numeric ID to string and try to find by legacy ID field if it exists
      query = { id };
    }
    
    const user = await usersCollection.findOne(query);
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const user = await usersCollection.findOne({ username });
    return user || undefined;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const result = await usersCollection.insertOne({ 
      ...userData,
      createdAt: new Date() 
    });
    
    return {
      _id: result.insertedId,
      ...userData
    } as User;
  }

  async updateUser(id: number | string, userData: UpdateUser): Promise<User | undefined> {
    let query = {};
    
    if (typeof id === 'string' && ObjectId.isValid(id)) {
      query = { _id: new ObjectId(id) };
    } else if (typeof id === 'number') {
      query = { id };
    }
    
    const result = await usersCollection.findOneAndUpdate(
      query,
      { $set: { ...userData, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    
    return result || undefined;
  }

  // Post operations
  async getPost(id: number | string): Promise<Post | undefined> {
    let query = {};
    
    if (typeof id === 'string' && ObjectId.isValid(id)) {
      query = { _id: new ObjectId(id) };
    } else if (typeof id === 'number') {
      query = { id };
    }
    
    const post = await postsCollection.findOne(query);
    return post || undefined;
  }

  async getPostBySlug(slug: string): Promise<Post | undefined> {
    const post = await postsCollection.findOne({ slug });
    return post || undefined;
  }

  async getAllPosts(options: { status?: string, limit?: number, offset?: number } = {}): Promise<Post[]> {
    const { status, limit = 10, offset = 0 } = options;
    
    const query = status ? { status } : {};
    
    const posts = await postsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();
    
    return posts;
  }

  async getPostsByCategory(category: string, options: { status?: string, limit?: number, offset?: number } = {}): Promise<Post[]> {
    const { status, limit = 10, offset = 0 } = options;
    
    const query = { 
      category,
      ...(status ? { status } : {})
    };
    
    const posts = await postsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();
    
    return posts;
  }

  async createPost(postData: InsertPost): Promise<Post> {
    // Generate slug if not provided
    if (!postData.slug) {
      postData.slug = slugify(postData.title);
    }
    
    // Set publishedAt if publishNow is true
    const { publishNow, ...postDataWithoutPublishNow } = postData;
    if (publishNow) {
      postDataWithoutPublishNow.publishedAt = new Date();
      postDataWithoutPublishNow.status = 'published';
    }
    
    const now = new Date();
    const result = await postsCollection.insertOne({
      ...postDataWithoutPublishNow,
      createdAt: now,
      updatedAt: now
    });
    
    return {
      _id: result.insertedId,
      ...postDataWithoutPublishNow,
      createdAt: now,
      updatedAt: now
    } as Post;
  }

  async updatePost(id: number | string, postData: UpdatePost): Promise<Post | undefined> {
    let query = {};
    
    if (typeof id === 'string' && ObjectId.isValid(id)) {
      query = { _id: new ObjectId(id) };
    } else if (typeof id === 'number') {
      query = { id };
    }

    // Extract publishNow from postData
    const { publishNow, ...postDataWithoutPublishNow } = postData;
    
    // If publishNow is true, set publishedAt and status
    if (publishNow) {
      postDataWithoutPublishNow.publishedAt = new Date();
      postDataWithoutPublishNow.status = 'published';
    }
    
    const result = await postsCollection.findOneAndUpdate(
      query,
      { 
        $set: { 
          ...postDataWithoutPublishNow,
          updatedAt: new Date()
        } 
      },
      { returnDocument: 'after' }
    );
    
    return result || undefined;
  }

  async deletePost(id: number | string): Promise<boolean> {
    let query = {};
    
    if (typeof id === 'string' && ObjectId.isValid(id)) {
      query = { _id: new ObjectId(id) };
    } else if (typeof id === 'number') {
      query = { id };
    }
    
    const result = await postsCollection.deleteOne(query);
    return result.deletedCount === 1;
  }

  async searchPosts(query: string, options: { status?: string, limit?: number, offset?: number } = {}): Promise<Post[]> {
    const { status, limit = 10, offset = 0 } = options;
    
    const searchQuery = {
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } },
        { excerpt: { $regex: query, $options: 'i' } }
      ],
      ...(status ? { status } : {})
    };
    
    const posts = await postsCollection
      .find(searchQuery)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();
    
    return posts;
  }

  async getFeaturedPost(): Promise<Post | undefined> {
    const post = await postsCollection
      .find({ status: 'published' })
      .sort({ publishedAt: -1 })
      .limit(1)
      .toArray();
    
    return post[0] || undefined;
  }

  async getPopularPosts(limit: number = 5): Promise<Post[]> {
    // In a real app, we would have some metrics for popularity
    // For now, just return the most recently published posts
    const posts = await postsCollection
      .find({ status: 'published' })
      .sort({ publishedAt: -1 })
      .limit(limit)
      .toArray();
    
    return posts;
  }

  async getPostCount(options: { status?: string, category?: string } = {}): Promise<number> {
    const { status, category } = options;
    
    const query = {
      ...(status ? { status } : {}),
      ...(category ? { category } : {})
    };
    
    return await postsCollection.countDocuments(query);
  }

  // Subscriber operations
  async getSubscriber(id: number | string): Promise<Subscriber | undefined> {
    let query = {};
    
    if (typeof id === 'string' && ObjectId.isValid(id)) {
      query = { _id: new ObjectId(id) };
    } else if (typeof id === 'number') {
      query = { id };
    }
    
    const subscriber = await subscribersCollection.findOne(query);
    return subscriber || undefined;
  }

  async getSubscriberByEmail(email: string): Promise<Subscriber | undefined> {
    const subscriber = await subscribersCollection.findOne({ email });
    return subscriber || undefined;
  }

  async createSubscriber(subscriberData: InsertSubscriber): Promise<Subscriber> {
    const result = await subscribersCollection.insertOne({
      ...subscriberData,
      createdAt: new Date()
    });
    
    return {
      _id: result.insertedId,
      ...subscriberData,
      createdAt: new Date()
    } as Subscriber;
  }

  async getAllSubscribers(): Promise<Subscriber[]> {
    const subscribers = await subscribersCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    return subscribers;
  }
}

// Create a singleton instance
export const mongoDbStorage = new MongoDBStorage();