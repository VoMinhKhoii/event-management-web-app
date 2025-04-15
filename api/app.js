import express from 'express';
import dotenv from 'dotenv';
import connectDb from './config/db.js';
import cors from 'cors';
import authRoute from './routes/authRoute.js';
import userRoute from './routes/userRoute.js';
import eventRoute from './routes/eventRoute.js';
import cookieParser from 'cookie-parser';

// Log that we're starting
console.log('Starting API server...');

dotenv.config();

connectDb();

const app = express();
app.use(cors({
    origin: process.env.CLIENT_URL, 
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

//Authentication routes
app.use('/api/auth', authRoute);
app.use('/api/user', userRoute);
app.use('/api/event', eventRoute);


app.listen(8800, () => {
    console.log('Server is running on port 8800'); 
});