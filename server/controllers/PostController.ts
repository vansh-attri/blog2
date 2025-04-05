import { Request, Response } from 'express';
import { storage } from '../models/BaseModel';

export class PostController {
  static async getAllPosts(req: Request, res: Response) {
    try {
      const posts = await storage.getAllPosts();
      res.json({ posts });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  }

  static async createPost(req: Request, res: Response) {
    try {
      const post = await storage.createPost(req.body);
      res.json(post);
    } catch (error) {
      res.status(500).json({ error: "Failed to create post" });
    }
  }

  // Add other post-related methods
}