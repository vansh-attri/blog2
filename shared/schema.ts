import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  profileImage: text("profile_image"),
  isAdmin: boolean("is_admin").default(false).notNull(),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  featuredImage: text("featured_image"),
  authorId: integer("author_id").references(() => users.id),
  category: text("category").notNull(),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  status: text("status").default("draft").notNull(),
  readTime: integer("read_time"),
});

export const subscribers = pgTable("subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
  profileImage: true,
  isAdmin: true,
});

export const updateUserSchema = createInsertSchema(users).pick({
  displayName: true,
  profileImage: true,
}).partial();

// Post schemas
export const insertPostSchema = createInsertSchema(posts).pick({
  title: true,
  slug: true,
  excerpt: true,
  content: true,
  featuredImage: true,
  authorId: true,
  category: true,
  status: true,
  readTime: true,
}).extend({
  publishNow: z.boolean().default(false),
});

export const updatePostSchema = createInsertSchema(posts).pick({
  title: true,
  slug: true,
  excerpt: true,
  content: true,
  featuredImage: true,
  category: true,
  status: true,
  readTime: true,
}).partial().extend({
  publishNow: z.boolean().default(false),
});

// Subscriber schema
export const insertSubscriberSchema = createInsertSchema(subscribers).pick({
  email: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;

export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type UpdatePost = z.infer<typeof updatePostSchema>;

export type Subscriber = typeof subscribers.$inferSelect;
export type InsertSubscriber = z.infer<typeof insertSubscriberSchema>;

// Search schema
export const searchSchema = z.object({
  query: z.string().min(2).max(50),
});

export type SearchParams = z.infer<typeof searchSchema>;
