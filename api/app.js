import express from 'express';
import dotenv from 'dotenv';
import connectDb from './config/db.js';
import cors from 'cors';
import bodyParser from 'body-parser';
import authRoute from './routes/authRoute.js';
import commentRoute from './routes/commentRoute.js';
import userRoute from './routes/userRoute.js';
import eventRoute from './routes/eventRoute.js';
import adminRoute from './routes/adminRoute.js';
import settingsRoute from './routes/settingsRoute.js';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

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
    // origin: [
    //     'http://localhost:5173',  // For local development
    //     'https://relaxed-sprite-091d26.netlify.app'  // Your Netlify URL
    // ],
    origin: true,
    credentials: true,  // This is the key part that's missing!
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())
app.use(express.json());
app.use(cookieParser());

   // Swagger definition
   const swaggerOptions = {
       swaggerDefinition: {
           openapi: '3.0.0',
           info: {
               title: 'Event Management API',
               version: '1.0.0',
               description: 'API documentation using Swagger',
           },
           servers: [
            {
                url: 'http://localhost:8800',
                description: 'Development server'
            },
            {
                url: 'https://event-management-web-app-19wj.onrender.com',
                description: 'Production server'
            }
        ],
      components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
                cookieAuth: {
                    type: 'apiKey',
                    in: 'cookie',
                    name: 'token'
                }
            },
        },
       },
       apis: ['./routes/*.js'], // Path to your API docs
   };

const swaggerDocs = swaggerJSDoc(swaggerOptions);
// Serve swagger.json at /api-docs/swagger.json
app.get('/api-docs/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerDocs);
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
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

