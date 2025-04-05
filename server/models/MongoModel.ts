
import { IStorage } from "./storage";
import { Post, InsertPost, UpdatePost, User, InsertUser, UpdateUser, Subscriber, InsertSubscriber } from "@shared/schema";
import session from "express-session";
import MongoStore from "connect-mongo";
import { connection } from "./mongo";
import { UserModel, PostModel, SubscriberModel } from "./mongodb";

export class MongoStorage implements IStorage {
  public sessionStore: session.Store;

  constructor() {
    this.sessionStore = MongoStore.create({
      client: connection.getClient(),
      collectionName: "sessions",
      ttl: 24 * 60 * 60, // 1 day
    });
  }

  // User operations
  async getUser(id: number | string): Promise<User | undefined> {
    const user = await UserModel.findById(id);
    return user ? user.toObject() : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ username: username.toLowerCase() });
    return user ? user.toObject() : undefined;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const user = new UserModel({
      ...userData,
      username: userData.username.toLowerCase(),
    });
    await user.save();
    return user.toObject();
  }

  async updateUser(id: number | string, userData: UpdateUser): Promise<User | undefined> {
    const user = await UserModel.findByIdAndUpdate(
      id,
      { ...userData },
      { new: true }
    );
    return user ? user.toObject() : undefined;
  }

  // Post operations
  async getPost(id: number | string): Promise<Post | undefined> {
    const post = await PostModel.findById(id);
    return post ? post.toObject() : undefined;
  }

  async getPostBySlug(slug: string): Promise<Post | undefined> {
    const post = await PostModel.findOne({ slug });
    return post ? post.toObject() : undefined;
  }

  async getAllPosts(options: { status?: string; limit?: number; offset?: number } = {}): Promise<Post[]> {
    let query = PostModel.find();
    
    if (options.status) {
      query = query.where('status').equals(options.status);
    }
    
    query = query.sort('-publishedAt');
    
    if (options.limit !== undefined) {
      query = query.skip(options.offset || 0).limit(options.limit);
    }
    
    const posts = await query.exec();
    return posts.map(post => post.toObject());
  }

  async getPostsByCategory(category: string, options: { status?: string; limit?: number; offset?: number } = {}): Promise<Post[]> {
    let query = PostModel.find({ category });
    
    if (options.status) {
      query = query.where('status').equals(options.status);
    }
    
    query = query.sort('-publishedAt');
    
    if (options.limit !== undefined) {
      query = query.skip(options.offset || 0).limit(options.limit);
    }
    
    const posts = await query.exec();
    return posts.map(post => post.toObject());
  }

  async createPost(postData: InsertPost): Promise<Post> {
    const post = new PostModel(postData);
    await post.save();
    return post.toObject();
  }

  async updatePost(id: number | string, postData: UpdatePost): Promise<Post | undefined> {
    const post = await PostModel.findByIdAndUpdate(
      id,
      { ...postData },
      { new: true }
    );
    return post ? post.toObject() : undefined;
  }

  async deletePost(id: number | string): Promise<boolean> {
    const result = await PostModel.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  async searchPosts(query: string, options: { status?: string; limit?: number; offset?: number } = {}): Promise<Post[]> {
    const searchRegex = new RegExp(query, 'i');
    
    let mongoQuery = PostModel.find({
      $or: [
        { title: searchRegex },
        { content: searchRegex },
        { excerpt: searchRegex }
      ]
    });
    
    if (options.status) {
      mongoQuery = mongoQuery.where('status').equals(options.status);
    }
    
    if (options.limit !== undefined) {
      mongoQuery = mongoQuery.skip(options.offset || 0).limit(options.limit);
    }
    
    const posts = await mongoQuery.exec();
    return posts.map(post => post.toObject());
  }

  async getFeaturedPost(): Promise<Post | undefined> {
    const post = await PostModel.findOne({ status: 'published' })
      .sort('-publishedAt')
      .exec();
    return post ? post.toObject() : undefined;
  }

  async getPopularPosts(limit: number = 5): Promise<Post[]> {
    const posts = await PostModel.find({ status: 'published' })
      .sort('-publishedAt')
      .limit(limit)
      .exec();
    return posts.map(post => post.toObject());
  }

  async getPostCount(options: { status?: string; category?: string } = {}): Promise<number> {
    const query: any = {};
    if (options.status) {
      query.status = options.status;
    }
    if (options.category) {
      query.category = options.category;
    }
    return await PostModel.countDocuments(query);
  }

  // Subscriber operations
  async getSubscriber(id: number | string): Promise<Subscriber | undefined> {
    const subscriber = await SubscriberModel.findById(id);
    return subscriber ? subscriber.toObject() : undefined;
  }

  async getSubscriberByEmail(email: string): Promise<Subscriber | undefined> {
    const subscriber = await SubscriberModel.findOne({ email: email.toLowerCase() });
    return subscriber ? subscriber.toObject() : undefined;
  }

  async createSubscriber(subscriberData: InsertSubscriber): Promise<Subscriber> {
    const subscriber = new SubscriberModel({
      ...subscriberData,
      email: subscriberData.email.toLowerCase()
    });
    await subscriber.save();
    return subscriber.toObject();
  }

  async getAllSubscribers(): Promise<Subscriber[]> {
    const subscribers = await SubscriberModel.find();
    return subscribers.map(sub => sub.toObject());
  }
}
