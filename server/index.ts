import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { connectToMongoDB } from "./mongo";
import dotenv from "dotenv";

// Declare global namespace extension for TypeScript
declare global {
  namespace NodeJS {
    interface Global {
      useMemoryStorage: boolean;
    }
  }
  
  var useMemoryStorage: boolean;
}

// Initialize the global flag
global.useMemoryStorage = false;

// Load environment variables
dotenv.config();

// Set MongoDB connection string
// MongoDB URI may not be set in environment - set a default
if (!process.env.MONGODB_URI) {
  process.env.MONGODB_URI = 'mongodb://localhost:27017/nexpeer-blog';
}

// Validate the MongoDB URI to ensure it starts with mongodb:// or mongodb+srv://
if (!process.env.MONGODB_URI.startsWith('mongodb://') && !process.env.MONGODB_URI.startsWith('mongodb+srv://')) {
  console.warn('Invalid MongoDB URI format, forcing in-memory storage mode');
  // Set the global flag to use memory storage instead of failing
  global.useMemoryStorage = true;
} else {
  console.log('Using MongoDB URI (partial):', 
    process.env.MONGODB_URI.includes('@') 
      ? process.env.MONGODB_URI.split('@')[0] + '@...'
      : 'mongodb://localhost:...'
  );
}

// Initialize MongoDB connection
async function initStorage() {
  try {
    console.log('Connecting to MongoDB...');
    // Try to connect to MongoDB with a timeout
    const connectionPromise = connectToMongoDB();
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Connection timeout')), 7000);
    });
    
    // Race the connection against a timeout
    const connected = await Promise.race([
      connectionPromise,
      timeoutPromise
    ]);
    
    if (connected) {
      console.log('Successfully connected to MongoDB');
    } else {
      console.warn('MongoDB connection returned false, falling back to in-memory storage');
      global.useMemoryStorage = true;
    }
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
    console.warn('Falling back to in-memory storage');
    global.useMemoryStorage = true;
  }
  
  // Log the storage mode that will be used
  if (global.useMemoryStorage) {
    console.log('🧠 Using in-memory storage for this session');
  } else {
    console.log('🗄️ Using MongoDB for persistent storage');
  }
}

// Wait for storage initialization
initStorage().catch(err => {
  console.error('Error during storage initialization:', err);
  console.warn('Defaulting to in-memory storage due to initialization error');
  global.useMemoryStorage = true;
});

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    // Log the error with stack trace
    console.error(`Server error (${status}):`, err.message);
    if (err.stack) {
      console.error(err.stack);
    }
    
    // For MongoDB connection errors, set the global flag
    if (err.name === 'MongoError' || err.name === 'MongoServerError' || 
        err.name === 'MongoNetworkError' || err.message?.includes('mongo')) {
      console.warn('MongoDB error detected, falling back to in-memory storage');
      global.useMemoryStorage = true;
    }
    
    // Send error response
    res.status(status).json({ 
      message,
      error: app.get('env') === 'development' ? err.toString() : undefined
    });
    
    // Don't throw the error again, which would crash the server
    // This allows the server to continue running even if there are errors
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
