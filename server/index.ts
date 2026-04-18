import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

import traineeRoutes from './routes/traineeRoutes.js';
import configRoutes from './routes/configRoutes.js';
import foodRoutes from './routes/foodRoutes.js';

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use('/api/trainees', traineeRoutes);
app.use('/api/config', configRoutes);
app.use('/api/food', foodRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
