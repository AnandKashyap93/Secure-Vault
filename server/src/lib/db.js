const mongoose = require('mongoose');

// Cache the database connection for serverless environments like Vercel
let cachedDb = null;

const connectDB = async () => {
    if (cachedDb) {
        console.log('Using existing MongoDB connection');
        return cachedDb;
    }

    try {
        if (!process.env.DATABASE_URL) {
            console.warn("MongoDB connection string (DATABASE_URL) is missing!");
            return null;
        }

        console.log('Establishing new MongoDB connection...');
        const db = await mongoose.connect(process.env.DATABASE_URL, {
            // Options are usually not strictly necessary for modern mongoose versions
        });

        cachedDb = db;
        console.log('MongoDB connected successfully');

        // Seed admin in the background without blocking the connection itself
        const seedAdmin = require('./seedAdmin');
        seedAdmin().catch(err => console.error("Admin seeding error:", err));

        return db;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        // DO NOT use process.exit(1) here! 
        // In serverless environments (like Vercel), it crashes the function completely causing 500s.
        throw error;
    }
};

module.exports = connectDB;
