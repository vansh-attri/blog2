import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertPostSchema, updatePostSchema, searchSchema, insertSubscriberSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  const { isAdmin } = setupAuth(app);
  
  // Get all posts with pagination
  app.get("/api/posts", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;
      const category = req.query.category as string | undefined;
      
      let posts;
      let total;
      
      if (category) {
        posts = await storage.getPostsByCategory(category, { 
          status: "published", 
          limit, 
          offset 
        });
        total = await storage.getPostCount({ status: "published", category });
      } else {
        posts = await storage.getAllPosts({ 
          status: "published", 
          limit, 
          offset 
        });
        total = await storage.getPostCount({ status: "published" });
      }
      
      const totalPages = Math.ceil(total / limit);
      
      res.json({
        posts,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      });
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });
  
  // Get a single post by slug
  app.get("/api/posts/:slug", async (req, res) => {
    try {
      const post = await storage.getPostBySlug(req.params.slug);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      if (post.status !== "published" && (!req.isAuthenticated() || !(req.user as any).isAdmin)) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      res.json(post);
    } catch (error) {
      console.error("Error fetching post:", error);
      res.status(500).json({ message: "Failed to fetch post" });
    }
  });
  
  // Get featured post
  app.get("/api/featured-post", async (req, res) => {
    try {
      const featuredPost = await storage.getFeaturedPost();
      if (!featuredPost) {
        return res.status(404).json({ message: "No featured post found" });
      }
      
      res.json(featuredPost);
    } catch (error) {
      console.error("Error fetching featured post:", error);
      res.status(500).json({ message: "Failed to fetch featured post" });
    }
  });
  
  // Get popular posts
  app.get("/api/popular-posts", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const popularPosts = await storage.getPopularPosts(limit);
      
      res.json(popularPosts);
    } catch (error) {
      console.error("Error fetching popular posts:", error);
      res.status(500).json({ message: "Failed to fetch popular posts" });
    }
  });
  
  // Search posts
  app.get("/api/search", async (req, res) => {
    try {
      const validation = searchSchema.safeParse(req.query);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid search query" });
      }
      
      const { query } = validation.data;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;
      
      const posts = await storage.searchPosts(query, { 
        status: "published", 
        limit, 
        offset 
      });
      
      res.json(posts);
    } catch (error) {
      console.error("Error searching posts:", error);
      res.status(500).json({ message: "Failed to search posts" });
    }
  });
  
  // Admin routes
  // Get all posts (including drafts) for admin
  app.get("/api/admin/posts", isAdmin, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;
      const status = req.query.status as string | undefined;
      
      const posts = await storage.getAllPosts({ 
        status, 
        limit, 
        offset 
      });
      
      const total = await storage.getPostCount({ status });
      const totalPages = Math.ceil(total / limit);
      
      res.json({
        posts,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      });
    } catch (error) {
      console.error("Error fetching admin posts:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });
  
  // Create a new post
  app.post("/api/admin/posts", isAdmin, async (req, res) => {
    try {
      const validation = insertPostSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid post data", 
          errors: validation.error.errors 
        });
      }
      
      // Set the current user as the author
      const postData = validation.data;
      postData.authorId = (req.user as any).id;
      
      const post = await storage.createPost(postData);
      res.status(201).json(post);
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ message: "Failed to create post" });
    }
  });
  
  // Update a post
  app.put("/api/admin/posts/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const post = await storage.getPost(id);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      const validation = updatePostSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid post data", 
          errors: validation.error.errors 
        });
      }
      
      const updatedPost = await storage.updatePost(id, validation.data);
      res.json(updatedPost);
    } catch (error) {
      console.error("Error updating post:", error);
      res.status(500).json({ message: "Failed to update post" });
    }
  });
  
  // Delete a post
  app.delete("/api/admin/posts/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const post = await storage.getPost(id);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      await storage.deletePost(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting post:", error);
      res.status(500).json({ message: "Failed to delete post" });
    }
  });
  
  // Get a single post by ID for editing
  app.get("/api/admin/posts/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const post = await storage.getPost(id);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      res.json(post);
    } catch (error) {
      console.error("Error fetching post:", error);
      res.status(500).json({ message: "Failed to fetch post" });
    }
  });
  
  // Newsletter subscription
  app.post("/api/subscribe", async (req, res) => {
    try {
      const validation = insertSubscriberSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid email", 
          errors: validation.error.errors 
        });
      }
      
      // Check if subscriber already exists
      const existingSubscriber = await storage.getSubscriberByEmail(validation.data.email);
      if (existingSubscriber) {
        return res.status(400).json({ message: "Email already subscribed" });
      }
      
      const subscriber = await storage.createSubscriber(validation.data);
      res.status(201).json({ message: "Successfully subscribed" });
    } catch (error) {
      console.error("Error subscribing:", error);
      res.status(500).json({ message: "Failed to subscribe" });
    }
  });
  
  // Get all subscribers (admin only)
  app.get("/api/admin/subscribers", isAdmin, async (req, res) => {
    try {
      const subscribers = await storage.getAllSubscribers();
      res.json(subscribers);
    } catch (error) {
      console.error("Error fetching subscribers:", error);
      res.status(500).json({ message: "Failed to fetch subscribers" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
