// routes/adminRoutes.js
import express from 'express';
import {getRecentActivities } from '../controllers/adminController.js';
import { verifyToken } from '../middleware/verifyToken.js';
const router = express.Router();


router.get('/activities',verifyToken, getRecentActivities);

export default router;

