import mongoose, { Schema, Document } from 'mongoose';
import { z } from 'zod';

// User Model
export interface IUser extends Document {
  id: number;
  username: string;
  password: string;
  displayName?: string;
  email?: string;
  bio?: string;
  profileImage?: string;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    id: { type: Number, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    displayName: { type: String },
    email: { type: String },
    bio: { type: String },
    profileImage: { type: String },
    isAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Post Model
export interface IPost extends Document {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  category: string;
  tags?: string[];
  status: string;
  authorId?: number;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    id: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    excerpt: { type: String },
    featuredImage: { type: String },
    category: { type: String, required: true },
    tags: [{ type: String }],
    status: { type: String, required: true, default: 'draft' },
    authorId: { type: Number },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

// Subscriber Model
export interface ISubscriber extends Document {
  id: number;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const subscriberSchema = new Schema<ISubscriber>(
  {
    id: { type: Number, required: true, unique: true },
    email: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

// Counter for auto-incrementing IDs (simulating SQL behavior)
interface ICounter extends Document {
  _id: string;
  seq: number;
}

const counterSchema = new Schema<ICounter>({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

// Create the models
export const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
export const Post = mongoose.models.Post || mongoose.model<IPost>('Post', postSchema);
export const Subscriber = mongoose.models.Subscriber || mongoose.model<ISubscriber>('Subscriber', subscriberSchema);
export const Counter = mongoose.models.Counter || mongoose.model<ICounter>('Counter', counterSchema);

// Helper function to get the next sequence for a collection
export async function getNextSequence(name: string): Promise<number> {
  const counter = await Counter.findByIdAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
}

// VALIDATION SCHEMAS (using Zod)

// User validation schemas
export const insertUserSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6).max(100),
  displayName: z.string().max(100).optional(),
  email: z.string().email().optional(),
  bio: z.string().max(500).optional(),
  profileImage: z.string().optional(),
  isAdmin: z.boolean().default(false),
});

export const updateUserSchema = z.object({
  displayName: z.string().max(100).optional(),
  email: z.string().email().optional(),
  bio: z.string().max(500).optional(),
  profileImage: z.string().optional(),
  password: z.string().min(6).max(100).optional(),
  isAdmin: z.boolean().optional(),
});

// Post validation schemas
export const insertPostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  excerpt: z.string().max(500).optional(),
  featuredImage: z.string().optional(),
  category: z.string().min(1).max(50),
  tags: z.array(z.string()).optional(),
  status: z.enum(['draft', 'published']).default('draft'),
  authorId: z.number().optional(),
  publishedAt: z.date().optional(),
});

export const updatePostSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  excerpt: z.string().max(500).optional(),
  featuredImage: z.string().optional(),
  category: z.string().min(1).max(50).optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['draft', 'published']).optional(),
  authorId: z.number().optional(),
  publishedAt: z.date().optional(),
});

// Subscriber validation schema
export const insertSubscriberSchema = z.object({
  email: z.string().email(),
});

// Type definitions for TypeScript
export type User = IUser;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;

export type Post = IPost;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type UpdatePost = z.infer<typeof updatePostSchema>;

export type Subscriber = ISubscriber;
export type InsertSubscriber = z.infer<typeof insertSubscriberSchema>;

// Search schema
export const searchSchema = z.object({
  query: z.string().min(1),
  limit: z.number().optional().default(10),
  page: z.number().optional().default(1),
});

export type SearchParams = z.infer<typeof searchSchema>;