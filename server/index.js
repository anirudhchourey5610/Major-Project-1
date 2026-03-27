import dotenv from 'dotenv';
import app from './app.js';
import { connectToDatabase } from './db.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

connectToDatabase()
  .then(() => {
    console.log('Connected to MongoDB');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });
