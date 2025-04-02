import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

// Set mongoose connection options
mongoose.set('strictQuery', true);

// Maximum number of connection attempts
const MAX_RETRIES = 3;
// Delay between retries (in milliseconds)
const RETRY_DELAY = 2000;

/**
 * Connect to MongoDB with retry logic
 * @returns Promise<boolean> True if connection successful, false otherwise
 */
export async function connectToMongoDB() {
  let retries = 0;
  
  // Initialize the global variable if it doesn't exist
  if (typeof global.useMemoryStorage === 'undefined') {
    global.useMemoryStorage = false;
  }
  
  // If already forcing memory storage, skip connection attempt
  if (global.useMemoryStorage) {
    console.log('🧠 Using in-memory storage (as configured)');
    return false;
  }
  
  // Get MongoDB URI from environment
  const mongodbUri = process.env.MONGODB_URI;
  
  // Validate the MongoDB URI
  if (!mongodbUri) {
    console.error('⚠️ MONGODB_URI environment variable is not set');
    global.useMemoryStorage = true;
    return false;
  }
  
  // Check URI format
  if (!mongodbUri.startsWith('mongodb://') && !mongodbUri.startsWith('mongodb+srv://')) {
    console.error('⚠️ Invalid MongoDB URI format');
    global.useMemoryStorage = true;
    return false;
  }
  
  // Connection options with timeouts and retry configuration
  const options = {
    serverSelectionTimeoutMS: 5000,  // 5 seconds to select server
    connectTimeoutMS: 10000,         // 10 seconds to establish connection
    socketTimeoutMS: 45000,          // 45 seconds for operations
    maxPoolSize: 10,                 // Maximum number of connections in the pool
    minPoolSize: 2,                  // Minimum number of connections in the pool
    retryWrites: true,               // Retry writes if they fail
    retryReads: true,                // Retry reads if they fail
  };
  
  // Connection retry loop
  while (retries < MAX_RETRIES) {
    try {
      if (retries > 0) {
        console.log(`🔄 Retrying MongoDB connection (attempt ${retries+1}/${MAX_RETRIES})...`);
      } else {
        console.log('🔌 Connecting to MongoDB...');
      }
      
      // Check if already connected
      if (mongoose.connection.readyState === 1) {
        console.log('✅ Already connected to MongoDB');
        return true;
      }
      
      // Create a promise that will be rejected after timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Connection timeout exceeded')), options.connectTimeoutMS);
      });
      
      // Create the actual connection promise
      const connectionPromise = mongoose.connect(mongodbUri, options);
      
      // Race the promises - whichever resolves/rejects first wins
      await Promise.race([connectionPromise, timeoutPromise]);
      
      // If we get here, the connection was successful
      console.log('✅ Connected to MongoDB successfully');
      return true;
    } catch (error: any) {
      retries++;
      console.error(`❌ MongoDB connection error (attempt ${retries}/${MAX_RETRIES}):`, error.message);
      
      // If we've reached max retries, give up and switch to memory storage
      if (retries >= MAX_RETRIES) {
        console.warn('⚠️ Maximum connection retries reached, falling back to in-memory storage');
        global.useMemoryStorage = true;
        return false;
      }
      
      // Wait before the next retry
      console.log(`⏱️ Waiting ${RETRY_DELAY/1000} seconds before retrying...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }
  }
  
  // We should never reach here, but just in case
  global.useMemoryStorage = true;
  return false;
}

/**
 * Check if the MongoDB connection is alive
 * @returns boolean True if connected, false otherwise
 */
export function isMongoConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

/**
 * Explicitly close the MongoDB connection
 */
export async function closeMongoDB(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    console.log('Closing MongoDB connection...');
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Create connection event listeners
mongoose.connection.on('error', err => {
  console.error('⚠️ MongoDB connection error:', err.message);
  // Signal to use memory storage
  global.useMemoryStorage = true;
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
  // Signal to use memory storage on disconnect
  global.useMemoryStorage = true;
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected');
  // Reset memory storage flag if reconnected successfully
  global.useMemoryStorage = false;
});

// Connection success event
mongoose.connection.once('open', () => {
  console.log('✅ MongoDB connection is open and ready');
});

// Process termination handlers for clean shutdown
process.on('SIGINT', async () => {
  await closeMongoDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeMongoDB();
  process.exit(0);
});

// Export the connection and helper functions
export const connection = mongoose.connection;