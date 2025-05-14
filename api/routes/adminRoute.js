// routes/adminRoutes.js
import express from 'express';
import {getRecentActivities, adminLogin, adminLogout, createDefaultAdmin } from '../controllers/adminController.js';
import { verifyToken } from '../middleware/verifyToken.js';
const router = express.Router();

// Admin get user data
router.get('/activities', verifyToken, getRecentActivities);
// Login route admin
router.post('/login', adminLogin);
router.post('/logout', adminLogout);    
router.post('/create', createDefaultAdmin);

export default router;

