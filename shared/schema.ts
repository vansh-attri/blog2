import { z } from "zod";
import { ObjectId } from "mongodb";

// Define Zod schemas for MongoDB models
export const userSchema = z.object({
  _id: z.any().optional(), // MongoDB ObjectId
  username: z.string(),
  password: z.string(),
  displayName: z.string().optional(),
  profileImage: z.string().optional(),
  isAdmin: z.boolean().default(false),
});

export const postSchema = z.object({
  _id: z.any().optional(), // MongoDB ObjectId
  title: z.string(),
  slug: z.string(),
  excerpt: z.string(),
  content: z.string(),
  featuredImage: z.string().optional(),
  authorId: z.any().optional(), // Reference to user _id
  category: z.string(),
  publishedAt: z.date().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  status: z.string().default("draft"),
  readTime: z.number().optional(),
});

export const subscriberSchema = z.object({
  _id: z.any().optional(), // MongoDB ObjectId
  email: z.string().email(),
  createdAt: z.date().default(() => new Date()),
});

// User schemas
export const insertUserSchema = userSchema.omit({ _id: true });

export const updateUserSchema = userSchema.pick({
  displayName: true,
  profileImage: true,
}).partial();

// Post schemas
export const insertPostSchema = postSchema.omit({ _id: true, createdAt: true, updatedAt: true }).extend({
  publishNow: z.boolean().default(false),
});

export const updatePostSchema = postSchema.omit({ _id: true, createdAt: true }).partial().extend({
  publishNow: z.boolean().default(false),
});

// Subscriber schema
export const insertSubscriberSchema = subscriberSchema.omit({ _id: true, createdAt: true });

// Types
export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;

export type Post = z.infer<typeof postSchema>;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type UpdatePost = z.infer<typeof updatePostSchema>;

export type Subscriber = z.infer<typeof subscriberSchema>;
export type InsertSubscriber = z.infer<typeof insertSubscriberSchema>;

// Search schema
export const searchSchema = z.object({
  query: z.string().min(2).max(50),
});

export type SearchParams = z.infer<typeof searchSchema>;
