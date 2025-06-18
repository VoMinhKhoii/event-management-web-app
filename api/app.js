import express from 'express';
import dotenv from 'dotenv';
import connectDb from './config/db.js';
import cors from 'cors';
import authRoute from './routes/authRoute.js';
import commentRoute from './routes/commentRoute.js';
import userRoute from './routes/userRoute.js';
import eventRoute from './routes/eventRoute.js';
import adminRoute from './routes/adminRoute.js';
import settingsRoute from './routes/settingsRoute.js';

import cookieParser from 'cookie-parser';
import notificationRoute from './routes/notificationRoute.js';
import eventStatusUpdater from './middleware/eventStatusUpdater.js';

// Log that we're starting
console.log('Starting API server...');

// Load environment variables
dotenv.config();

// Connect to the database
connectDb();

const app = express();

app.use(cors({
    origin: [
        'http://localhost:5173',  // Keep for local development
        'https://relaxed-sprite-091d26.netlify.app'  // Add your Netlify URL
    ]
}));
app.use(express.json());
app.use(cookieParser());

// API Routes
app.use('/api/auth', authRoute);
app.use('/api/settings', settingsRoute);
app.use('/api/comments', commentRoute);
app.use('/api/users', userRoute);
app.use('/api/events', eventRoute);
app.use('/api/notifications', notificationRoute);
app.use('/api/admin', adminRoute)

app.listen(8800, () => {
    console.log('Server is running on port 8800');
    console.log(`CORS enabled for origin: ${process.env.CLIENT_URL}`);
    eventStatusUpdater();
});

export default app;

