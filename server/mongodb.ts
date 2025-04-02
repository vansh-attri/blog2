import { MongoClient, Collection, Db } from 'mongodb';
import { User, Post, Subscriber } from '@shared/schema';

// Connection URL
const url = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGODB_DB || 'nexpeer_tech_blog';

// Create a new MongoClient
const client = new MongoClient(url);
let db: Db;

// Collections
export let usersCollection: Collection<User>;
export let postsCollection: Collection<Post>;
export let subscribersCollection: Collection<Subscriber>;

export async function connectToDatabase() {
  try {
    // Connect the client to the server
    await client.connect();
    console.log('Connected successfully to MongoDB server');
    
    // Get database reference
    db = client.db(dbName);
    
    // Get collection references
    usersCollection = db.collection<User>('users');
    postsCollection = db.collection<Post>('posts');
    subscribersCollection = db.collection<Subscriber>('subscribers');

    // Create indexes
    await usersCollection.createIndex({ username: 1 }, { unique: true });
    await postsCollection.createIndex({ slug: 1 }, { unique: true });
    await subscribersCollection.createIndex({ email: 1 }, { unique: true });

    return {
      client,
      db,
      usersCollection,
      postsCollection,
      subscribersCollection
    };
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    throw err;
  }
}

export async function closeConnection() {
  await client.close();
  console.log('MongoDB connection closed');
}

export { db, client };