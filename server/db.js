import mongoose from 'mongoose';

let cachedConnection = globalThis.__netShieldMongooseConnection;
let cachedPromise = globalThis.__netShieldMongoosePromise;

export const connectToDatabase = async () => {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  if (!cachedPromise) {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error('MONGODB_URI is not configured');
    }

    cachedPromise = mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });
    globalThis.__netShieldMongoosePromise = cachedPromise;
  }

  cachedConnection = await cachedPromise;
  globalThis.__netShieldMongooseConnection = cachedConnection;

  return cachedConnection;
};

export const isDatabaseConnected = () => mongoose.connection.readyState === 1;
