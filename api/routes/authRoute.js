import express from 'express';

import { signup, login, logout, adminLogin } from '../controllers/authController.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

// Register route
router.post('/signup', signup);

// Login route
router.post('/login', login);
// Login route
router.post('/admin/login', adminLogin);

// Logout route
router.post('/logout', logout);

export default router;