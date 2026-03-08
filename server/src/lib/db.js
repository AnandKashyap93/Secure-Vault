const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        if (!process.env.DATABASE_URL) {
            console.warn("MongoDB connection string (DATABASE_URL) is missing!");
        }
        await mongoose.connect(process.env.DATABASE_URL, {
            // Options are usually not strictly necessary for modern mongoose versions
        });
        console.log('MongoDB connected successfully');

        const seedAdmin = require('./seedAdmin');
        await seedAdmin();
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

module.exports = connectDB;
