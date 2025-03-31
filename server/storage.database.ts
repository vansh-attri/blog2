import { 
  User, InsertUser, UpdateUser, 
  Post, InsertPost, UpdatePost,
  Subscriber, InsertSubscriber,
  users, posts, subscribers
} from "@shared/schema";
import session from "express-session";
import * as connectPgModule from "connect-pg-simple";
import { db } from "./db";
import { pool } from "./db";
import { eq, ilike, and, or, desc, sql, asc, isNull } from "drizzle-orm";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { IStorage } from "./storage";

// Initialize the connectPg function
const connectPg = connectPgModule.default || connectPgModule;

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')    // Replace spaces with -
    .replace(/&/g, '-and-')  // Replace & with 'and'
    .replace(/[^\w\-]+/g, '') // Remove all non-word characters
    .replace(/\-\-+/g, '-');  // Replace multiple - with single -
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  public sessionStore: any;
  
  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    } as any);
    
    // Initialize database with admin user if needed
    this.initializeDatabase();
  }
  
  private async initializeDatabase() {
    try {
      // Check if admin user exists
      const adminUser = await this.getUserByUsername("admin");
      if (!adminUser) {
        console.log("Creating default admin user...");
        // Create default admin
        await this.createUser({
          username: "admin",
          password: await hashPassword("admin123"),
          displayName: "Administrator",
          isAdmin: true
        });
      }
    } catch (error) {
      console.error("Error initializing database:", error);
    }
  }
  
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values({
      username: userData.username,
      password: userData.password,
      displayName: userData.displayName || userData.username,
      profileImage: userData.profileImage,
      isAdmin: userData.isAdmin ?? false
    }).returning();
    
    return user;
  }

  async updateUser(id: number, userData: UpdateUser): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set({
        ...userData,
        profileImage: userData.profileImage
      })
      .where(eq(users.id, id))
      .returning();
    
    return user;
  }

  async getPost(id: number): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post;
  }

  async getPostBySlug(slug: string): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.slug, slug));
    return post;
  }

  async getAllPosts(options: { status?: string, limit?: number, offset?: number } = {}): Promise<Post[]> {
    let query = db.select().from(posts);
    
    // Filter by status if provided
    if (options.status) {
      query = query.where(eq(posts.status, options.status));
    }
    
    // Sort by publishedAt or createdAt (newest first)
    query = query.orderBy(
      desc(sql`COALESCE(${posts.publishedAt}, ${posts.createdAt})`)
    );
    
    // Apply pagination
    if (options.limit !== undefined) {
      query = query.limit(options.limit);
      
      if (options.offset !== undefined) {
        query = query.offset(options.offset);
      }
    }
    
    return await query;
  }

  async getPostsByCategory(category: string, options: { status?: string, limit?: number, offset?: number } = {}): Promise<Post[]> {
    let query = db.select().from(posts).where(eq(posts.category, category));
    
    // Filter by status if provided
    if (options.status) {
      query = query.where(eq(posts.status, options.status));
    }
    
    // Sort by publishedAt or createdAt (newest first)
    query = query.orderBy(
      desc(sql`COALESCE(${posts.publishedAt}, ${posts.createdAt})`)
    );
    
    // Apply pagination
    if (options.limit !== undefined) {
      query = query.limit(options.limit);
      
      if (options.offset !== undefined) {
        query = query.offset(options.offset);
      }
    }
    
    return await query;
  }

  async createPost(postData: InsertPost): Promise<Post> {
    const now = new Date();
    const generatedSlug = postData.slug || slugify(postData.title);
    
    const [post] = await db.insert(posts).values({
      title: postData.title,
      slug: generatedSlug,
      excerpt: postData.excerpt,
      content: postData.content,
      featuredImage: postData.featuredImage || "",
      authorId: postData.authorId,
      category: postData.category,
      status: postData.status || "draft",
      readTime: postData.readTime || 5,
      createdAt: now,
      updatedAt: now,
      publishedAt: postData.publishNow ? now : undefined
    }).returning();
    
    return post;
  }

  async updatePost(id: number, postData: UpdatePost): Promise<Post | undefined> {
    const now = new Date();
    const currentPost = await this.getPost(id);
    
    if (!currentPost) return undefined;
    
    // Prepare update data
    const updateData: any = {
      ...postData,
      updatedAt: now
    };
    
    // Handle slug generation if title changed but slug not provided
    if (postData.title && !postData.slug) {
      updateData.slug = slugify(postData.title);
    }
    
    // Handle publish now flag
    if (postData.publishNow) {
      updateData.publishedAt = now;
      updateData.status = "published";
    }
    
    const [updatedPost] = await db.update(posts)
      .set(updateData)
      .where(eq(posts.id, id))
      .returning();
    
    return updatedPost;
  }

  async deletePost(id: number): Promise<boolean> {
    const result = await db.delete(posts).where(eq(posts.id, id));
    return true; // If no error was thrown, deletion was successful
  }

  async searchPosts(query: string, options: { status?: string, limit?: number, offset?: number } = {}): Promise<Post[]> {
    const searchTerm = `%${query}%`;
    let dbQuery = db.select().from(posts).where(
      or(
        ilike(posts.title, searchTerm),
        ilike(posts.excerpt, searchTerm),
        ilike(posts.content, searchTerm)
      )
    );
    
    // Filter by status if provided
    if (options.status) {
      dbQuery = dbQuery.where(eq(posts.status, options.status));
    }
    
    // Sort by relevance (title matches first)
    dbQuery = dbQuery.orderBy(
      sql`CASE WHEN ${posts.title} ILIKE ${searchTerm} THEN 0 ELSE 1 END`,
      desc(sql`COALESCE(${posts.publishedAt}, ${posts.createdAt})`)
    );
    
    // Apply pagination
    if (options.limit !== undefined) {
      dbQuery = dbQuery.limit(options.limit);
      
      if (options.offset !== undefined) {
        dbQuery = dbQuery.offset(options.offset);
      }
    }
    
    return await dbQuery;
  }

  async getFeaturedPost(): Promise<Post | undefined> {
    // Get the newest published post
    const [featuredPost] = await db.select()
      .from(posts)
      .where(eq(posts.status, "published"))
      .orderBy(desc(posts.publishedAt))
      .limit(1);
    
    return featuredPost;
  }

  async getPopularPosts(limit: number = 5): Promise<Post[]> {
    // For demo purposes, just return the most recent published posts
    // In a real app, this would factor in view counts, comments, shares, etc.
    return await db.select()
      .from(posts)
      .where(eq(posts.status, "published"))
      .orderBy(desc(posts.publishedAt))
      .limit(limit);
  }

  async getPostCount(options: { status?: string, category?: string } = {}): Promise<number> {
    let conditions = [];
    
    if (options.status) {
      conditions.push(eq(posts.status, options.status));
    }
    
    if (options.category) {
      conditions.push(eq(posts.category, options.category));
    }
    
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(posts)
      .where(conditions.length > 0 ? and(...conditions) : undefined);
    
    return result[0].count;
  }

  async getSubscriber(id: number): Promise<Subscriber | undefined> {
    const [subscriber] = await db.select().from(subscribers).where(eq(subscribers.id, id));
    return subscriber;
  }

  async getSubscriberByEmail(email: string): Promise<Subscriber | undefined> {
    const [subscriber] = await db.select().from(subscribers).where(eq(subscribers.email, email));
    return subscriber;
  }

  async createSubscriber(subscriberData: InsertSubscriber): Promise<Subscriber> {
    const [subscriber] = await db.insert(subscribers)
      .values({
        email: subscriberData.email
      })
      .returning();
    
    return subscriber;
  }

  async getAllSubscribers(): Promise<Subscriber[]> {
    return await db.select().from(subscribers).orderBy(asc(subscribers.createdAt));
  }
}