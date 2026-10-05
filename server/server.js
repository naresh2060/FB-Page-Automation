import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import apiRoutes from './routes/index.js';




const app = express();

// Connect to MongoDB
connectDB();

//Middlewares
app.use(cors())   // cors policy
app.use(express.json());  //to parse JSON request body
app.use(express.urlencoded({ extended: true }));

//Routes
const API_VERSION = process.env.API_VERSION || 'v1';
app.use(`/api/${API_VERSION}`, apiRoutes);



const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});