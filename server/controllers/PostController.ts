
import { Request, Response } from 'express';
import { storage } from '../models/BaseModel';

export class PostController {
  static async getAllPosts(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string;

      const posts = await storage.getAllPosts({ status, limit, offset: (page - 1) * limit });
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
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  }

  static async createPost(req: Request, res: Response) {
    try {
      const post = await storage.createPost({
        ...req.body,
        authorId: req.user?.id
      });
      res.json(post);
    } catch (error) {
      console.error('Error creating post:', error);
      res.status(500).json({ error: "Failed to create post" });
    }
  }
}
