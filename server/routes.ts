import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./models/BaseModel";
import { setupAuth } from "./auth";
import { connection } from "./config/mongo";
import { insertPostSchema, updatePostSchema, searchSchema, insertSubscriberSchema } from "@shared/schema";
import { z } from "zod";
import { Router } from 'express';
import { AuthController } from './controllers/AuthController';
import { PostController } from './controllers/PostController';

const router = Router();

// Auth routes
router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);

// Post routes
router.get('/posts', PostController.getAllPosts);
router.post('/posts', PostController.createPost);


// Middleware to check MongoDB connection for API routes
function checkDatabaseConnectionMiddleware(req: Request, res: Response, next: NextFunction) {
  // Skip for authentication routes to always allow login/logout with in-memory fallback
  if (req.path.startsWith('/api/login') || req.path.startsWith('/api/logout') || req.path.startsWith('/api/user')) {
    return next();
  }
  
  // Only check on API routes
  if (req.path.startsWith('/api/')) {
    // Check if we're in memory mode
    if (global.useMemoryStorage) {
      // If already in memory mode, add context to response
      res.locals.storageType = 'memory';
      return next();
    }
    
    // Check MongoDB connection
    if (connection.readyState !== 1) { // Not connected
      console.warn(`Database disconnected (state: ${connection.readyState}), switching to memory storage`);
      global.useMemoryStorage = true;
      res.locals.storageType = 'memory';
    } else {
      res.locals.storageType = 'mongodb';
    }
  }
  
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Add database health check middleware
  app.use(checkDatabaseConnectionMiddleware);
  // Set up authentication
  const { isAdmin } = setupAuth(app);
  
  app.use('/api', router); // Use the new router for API routes

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

  // System status endpoint for admins - check database health
  app.get("/api/admin/system/status", isAdmin, (req, res) => {
    try {
      const isMongoConnected = connection.readyState === 1;
      const status = {
        database: {
          type: global.useMemoryStorage ? 'memory' : 'mongodb',
          connected: global.useMemoryStorage ? true : isMongoConnected,
          connectionState: global.useMemoryStorage ? 1 : connection.readyState,
          readyStates: {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting',
            99: 'uninitialized'
          }
        },
        server: {
          environment: process.env.NODE_ENV || 'development',
          uptime: Math.floor(process.uptime()) + ' seconds'
        },
        memory: {
          usage: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100 + ' MB',
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100 + ' MB'
        }
      };
      res.json(status);
    } catch (error) {
      console.error("Error fetching system status:", error);
      res.status(500).json({ message: "Failed to fetch system status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}