import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import User from '../models/User.js';

const seedDefaultUser = async () => {
    try {
        const email = "test@gmail.com";
        const existingUser = await User.findOne({ email });
        
        if (!existingUser) {
            await User.create({
                name: "Test User",
                email: email,
                password: "test@gmail.com", // Plain text password, pre-save hook will hash it
                role: "admin",
                plan: "enterprise"
            });
            console.log("Default user seeded: test@gmail.com");
        }
    } catch (error) {
        console.error("Error seeding default user:", error.message);
    }
};

const connectDB = async ()=>{
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB connected : ${conn.connection.host}`);
        
        // Run seed
        await seedDefaultUser();
    } catch (error) {
        console.log(`Error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;