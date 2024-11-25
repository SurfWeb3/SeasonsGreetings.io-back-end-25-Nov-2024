import express from 'express';
import cors from 'cors';
import mainRouter from './routes';
import errorHandler from './middleware/errorHandler';
import connectDB from './config/database';

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api', mainRouter);

// Error handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});